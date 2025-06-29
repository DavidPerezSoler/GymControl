import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc, getDoc,
  setDoc, updateDoc,
  arrayUnion, arrayRemove
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

window.api.onDayDetailLoad(async ({ clientUid, date }) => {
  // --- REFERENCIAS DOM ---
  const titleEl      = document.getElementById('day-title');
  const assignedEl   = document.getElementById('assigned-list');
  const availableEl  = document.getElementById('available-list');
  const addExBtn     = document.getElementById('add-exercise-api-btn');
  const searchInput  = document.getElementById('search-input');
  const filterMuscle = document.getElementById('filter-muscle');
  const filterLevel  = document.getElementById('filter-level');

  // --- MODAL EJERCICIO (para POST y PUT) ---
  const exModal       = document.getElementById('exercise-modal');
  const exFields      = {
    name:          document.getElementById('ex-name'),
    force:         document.getElementById('ex-force'),
    level:         document.getElementById('ex-level'),
    mechanic:      document.getElementById('ex-mechanic'),
    equipment:     document.getElementById('ex-equipment'),
    primary:       document.getElementById('ex-primary'),
    secondary:     document.getElementById('ex-secondary'),
    instructions:  document.getElementById('ex-instructions')
  };
  const btnExCancel   = document.getElementById('ex-cancel');
  const btnExSave     = document.getElementById('ex-save');

  // --- MODAL NÚMERO DE SETS ---
  const setsModal     = document.getElementById('sets-modal');
  // Pre-genera contenido del modal una sola vez
  setsModal.innerHTML = `
    <div class="modal-content">
      <h3>¿Cuántos sets?</h3>
      <input type="number" id="modal-sets-input" min="1" placeholder="Nº de sets" />
      <div class="modal-buttons">
        <button id="modal-cancel-btn">Cancelar</button>
        <button id="modal-ok-btn">Aceptar</button>
      </div>
    </div>
  `;
  const inpSets       = document.getElementById('modal-sets-input');
  const btnSetsCancel = document.getElementById('modal-cancel-btn');
  const btnSetsOk     = document.getElementById('modal-ok-btn');

  titleEl.textContent = `Ejercicios para ${date}`;

  const dateRef = doc(db, 'clientExercises', clientUid, 'dates', date);

  // --- FUNCIÓN PARA CARGAR ASIGNADOS ---
  async function loadAssigned() {
    assignedEl.innerHTML = '';
    let assigned = [];
    try {
      const snap = await getDoc(dateRef);
      assigned = snap.exists() && Array.isArray(snap.data().exercises)
        ? snap.data().exercises
        : [];
    } catch (err) {
      console.error(err);
    }

    for (const item of assigned) {
      const li = document.createElement('li');
      li.className = 'exercise-assigned';

      //DPS--- AQUI TENGO QUE AÑADIR EL CHECKBOX PARA VER SI LO HA HECHO O NO
      li.innerHTML = `
        <h4>${item.name}</h4>
        <ul class="sets-list"></ul>
        <div class="actions">
          <button class="btn edit-sets">Editar series</button>
          <button class="btn unassign">Desasignar</button>
          <button class="btn view-detail">Ver detalle</button>
           <label style="display: flex; align-items: center; gap: 5px;">
      <input type="checkbox" ${item.done ? 'checked' : ''} />
      Hecho
    </label>
        </div>
      `;
      assignedEl.appendChild(li);

      // Pinto los sets
      const setsList = li.querySelector('.sets-list');
      item.sets.forEach(s => {
        const setLi = document.createElement('li');
        setLi.textContent = `Set ${s.setNumber}: ${s.reps} reps @ ${s.weight}kg`;
        setsList.appendChild(setLi);
      });

      // EDITAR SERIES: pide nº sets → genera inputs reps/peso → guarda
      li.querySelector('.edit-sets').addEventListener('click', () => {
        inpSets.value = item.sets.length || 1;
        setsModal.classList.remove('hidden');

        btnSetsCancel.onclick = () => setsModal.classList.add('hidden');
        btnSetsOk.onclick     = async () => {
          const count = parseInt(inpSets.value, 10);
          if (isNaN(count) || count < 1) {
            alert('Sets inválido');
            return;
          }
          setsModal.classList.add('hidden');

          // Genera inputs dinámicos
          const detailContainer = document.createElement('div');
          detailContainer.className = 'edit-sets-container';
          for (let i = 1; i <= count; i++) {
            detailContainer.innerHTML += `
              <div class="set-edit-row">
                <label>Set ${i}:</label>
                <input type="number" class="reps-input" placeholder="Reps" />
                <input type="number" class="weight-input" placeholder="Peso" />
              </div>
            `;
          }
          const saveBtn = document.createElement('button');
          saveBtn.className = 'btn save-sets-btn';
          saveBtn.textContent = 'Guardar cambios';
          detailContainer.appendChild(saveBtn);
          li.appendChild(detailContainer);

          saveBtn.onclick = async () => {
            const rows = detailContainer.querySelectorAll('.set-edit-row');
            const newSets = Array.from(rows).map((row, idx) => ({
              setNumber: idx + 1,
              reps: parseInt(row.querySelector('.reps-input').value, 10) || 0,
              weight: parseFloat(row.querySelector('.weight-input').value) || 0
            }));
            await updateDoc(dateRef, { exercises: arrayRemove(item) });
            await updateDoc(dateRef, { exercises: arrayUnion({ name: item.name, sets: newSets }) });
            loadAssigned();
          };
        };
      });

      // DESASIGNAR
      li.querySelector('.unassign').addEventListener('click', async () => {
        await updateDoc(dateRef, { exercises: arrayRemove(item) });
        loadAssigned();
      });

      // VER DETALLE
      li.querySelector('.view-detail').addEventListener('click', async () => {
        const res = await fetch(
          `http://localhost:10001/api/Exercises/${item.name}`
        );
        const ex = await res.json();
        // Rellenar exModal
        exFields.name.value         = ex.name;
        exFields.force.value        = ex.force;
        exFields.level.value        = ex.level;
        exFields.mechanic.value     = ex.mechanic;
        exFields.equipment.value    = ex.equipment;
        exFields.primary.value      = ex.primaryMuscles.join(', ');
        exFields.secondary.value    = ex.secondaryMuscles.join(', ');
        exFields.instructions.value = ex.instructions.join('\n');
        exModal.classList.remove('hidden');

        btnExCancel.onclick = () => exModal.classList.add('hidden');
        btnExSave.onclick   = async () => {
          // Construye payload y hace PUT
          ex.force = exFields.force.value;
          ex.level = exFields.level.value;
          ex.mechanic = exFields.mechanic.value;
          ex.equipment = exFields.equipment.value;
          ex.primaryMuscles = exFields.primary.value.split(',').map(s => s.trim());
          ex.secondaryMuscles = exFields.secondary.value.split(',').map(s => s.trim());
          ex.instructions = exFields.instructions.value.split('\n').map(s => s.trim());
          await fetch(`http://localhost:10001/api/Exercises/${ex.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ex)
          });
          exModal.classList.add('hidden');
          loadAvailable();
        };
      });
    }
  }

  // --- FUNCIÓN PARA CARGAR DISPONIBLES ---
  async function loadAvailable() {
    availableEl.innerHTML = '';
    let all = [];
    try {
      const res = await fetch('http://localhost:10001/api/Exercises');
      all = await res.json();
    } catch (e) {
      console.error(e);
    }

    const s = searchInput.value.trim().toLowerCase();
    const m = filterMuscle.value.toLowerCase();
    const l = filterLevel.value;

    all
      .filter(ex =>
        ex.name.toLowerCase().includes(s) &&
        (!m || ex.primaryMuscles.join(',').toLowerCase().includes(m)) &&
        (!l || ex.level === l)
      )
      .forEach(ex => {
        const li = document.createElement('li');
        li.className = 'exercise-item';
        li.innerHTML = `
          <span class="exercise-name">${ex.name}</span>
          <div class="actions">
            <button class="btn view-detail">Ver</button>
            <button class="btn assign-btn">Asignar</button>
            <button class="btn edit-api">Editar</button>
            <button class="btn delete-api">Borrar</button>
          </div>
        `;
        availableEl.appendChild(li);

        li.querySelector('.view-detail')
          .addEventListener('click', () => window.api.openDetail(ex));

        li.querySelector('.assign-btn')
          .addEventListener('click', () => {
            inpSets.value = 1;
            setsModal.classList.remove('hidden');
            btnSetsCancel.onclick = () => setsModal.classList.add('hidden');
            btnSetsOk.onclick     = async () => {
              const count = parseInt(inpSets.value, 10);
              if (isNaN(count) || count < 1) {
                alert('Sets inválido');
                return;
              }
              setsModal.classList.add('hidden');
              const detailContainer = document.createElement('div');
              detailContainer.className = 'edit-sets-container';
              for (let i = 1; i <= count; i++) {
                detailContainer.innerHTML += `
                  <div class="set-edit-row">
                    <label>Set ${i}:</label>
                    <input type="number" class="reps-input" placeholder="Reps" />
                    <input type="number" class="weight-input" placeholder="Peso" />
                  </div>
                `;
              }
              const saveBtn = document.createElement('button');
              saveBtn.className = 'btn save-sets-btn';
              saveBtn.textContent = 'Guardar sets';
              detailContainer.appendChild(saveBtn);
              li.appendChild(detailContainer);
              saveBtn.onclick = async () => {
                const rows = detailContainer.querySelectorAll('.set-edit-row');
                const setsData = Array.from(rows).map((row, idx) => ({
                  setNumber: idx + 1,
                  reps: parseInt(row.querySelector('.reps-input').value, 10) || 0,
                  weight: parseFloat(row.querySelector('.weight-input').value) || 0
                }));
                await updateDoc(dateRef, { exercises: arrayUnion({ name: ex.name, sets: setsData }) })
                  .catch(async () => setDoc(dateRef, { exercises: [{ name: ex.name, sets: setsData }] }));
                loadAssigned();
              };
            };
          });

        li.querySelector('.edit-api')
          .addEventListener('click', async () => {
            // igual que en loadAssigned→view-detail
            const res = await fetch(`http://localhost:10001/api/Exercises/${ex.name}`);
            const data = await res.json();
            exFields.name.value         = data.name;
            exFields.force.value        = data.force;
            exFields.level.value        = data.level;
            exFields.mechanic.value     = data.mechanic;
            exFields.equipment.value    = data.equipment;
            exFields.primary.value      = data.primaryMuscles.join(', ');
            exFields.secondary.value    = data.secondaryMuscles.join(', ');
            exFields.instructions.value = data.instructions.join('\n');
            exModal.classList.remove('hidden');
            btnExCancel.onclick = () => exModal.classList.add('hidden');
            btnExSave.onclick   = async () => {
              data.force = exFields.force.value;
              data.level = exFields.level.value;
              data.mechanic = exFields.mechanic.value;
              data.equipment = exFields.equipment.value;
              data.primaryMuscles = exFields.primary.value.split(',').map(s=>s.trim());
              data.secondaryMuscles = exFields.secondary.value.split(',').map(s=>s.trim());
              data.instructions = exFields.instructions.value.split('\n').map(s=>s.trim());
              await fetch(`http://localhost:10001/api/Exercises/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              exModal.classList.add('hidden');
              loadAvailable();
            };
          });

        li.querySelector('.delete-api')
          .addEventListener('click', async () => {
            if (!confirm(`¿Borrar "${ex.name}"?`)) return;
            await fetch(`http://localhost:10001/api/Exercises/${ex.id}`, { method: 'DELETE' });
            loadAvailable();
          });
      });

    if (!availableEl.childElementCount) {
      availableEl.innerHTML = '<li class="no-records">No hay ejercicios.</li>';
    }
  }

  // --- EVENTOS FILTROS & ADD-NEW ---
  [searchInput, filterMuscle, filterLevel].forEach(el =>
    el.addEventListener('input', loadAvailable)
  );
  addExBtn.addEventListener('click', () => {
    // Modo creación: limpia exFields y reusa mismo modal
    Object.values(exFields).forEach(f => f.value = '');
    exModal.classList.remove('hidden');
    btnExSave.onclick = async () => {
      const payload = {
        name: exFields.name.value,
        force: exFields.force.value,
        level: exFields.level.value,
        mechanic: exFields.mechanic.value,
        equipment: exFields.equipment.value,
        primaryMuscles: exFields.primary.value.split(',').map(s=>s.trim()),
        secondaryMuscles: exFields.secondary.value.split(',').map(s=>s.trim()),
        instructions: exFields.instructions.value.split('\n').map(s=>s.trim()),
        category: 'stretching'
      };
      await fetch('http://localhost:10001/api/Exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      exModal.classList.add('hidden');
      loadAvailable();
    };
    btnExCancel.onclick = () => exModal.classList.add('hidden');
  });

  // — CARGA INICIAL —
  loadAssigned();
  loadAvailable();
});
