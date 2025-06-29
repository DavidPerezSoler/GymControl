// detailRenderer.js
window.addEventListener('DOMContentLoaded', () => {
    // Registra el callback para cuando llegue el detalle
    window.api.onDetail((e) => {
      document.getElementById('detailName').textContent = e.name;
      document.getElementById('detailCategory').textContent = e.category;
      document.getElementById('detailForce').textContent = e.force;
      document.getElementById('detailLevel').textContent = e.level;
      document.getElementById('detailMechanic').textContent = e.mechanic;
      document.getElementById('detailEquipment').textContent = e.equipment;
      document.getElementById('detailPrimary').textContent = e.primaryMuscles.join(', ');
      document.getElementById('detailSecondary').textContent = e.secondaryMuscles.join(', ');
      const ol = document.getElementById('detailInstructions');
      ol.innerHTML = '';
      e.instructions.forEach(instr => {
        const li = document.createElement('li');
        li.textContent = instr;
        ol.appendChild(li);
      });
    });
  });
  