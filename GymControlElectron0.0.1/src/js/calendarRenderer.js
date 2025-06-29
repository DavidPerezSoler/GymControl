import {
  calendar,
  calendarDays,
  previousMonthBtn,
  nextMonthBtn,
  calendarDateEl
} from '../modules/selectores.js';
import { renderCalendar, setMonth, currentDate } from '../modules/components/Calendar.js';

let currentClientUid = null;

window.api.onClientCalendar(uid => {
  currentClientUid = uid;
  renderAndPopulate(); 
});

previousMonthBtn.addEventListener('click', () => {
  setMonth(-1);
  renderAndPopulate();
});
nextMonthBtn.addEventListener('click', () => {
  setMonth(1);
  renderAndPopulate();
});

async function renderAndPopulate() {
  renderCalendar();
  await populateAssignedPerDay();
}

async function populateAssignedPerDay() {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1–12

  // Para cada celda real
  calendarDays.querySelectorAll('.calendar__day').forEach(async dayEl => {
    if (dayEl.classList.contains('calendar__day--hidden')) return;
    const day = parseInt(dayEl.dataset.day, 10);
    if (isNaN(day)) return;

    // Formatear YYYY-MM-DD sin toISOString
    const isoDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    // Leer Firestore
    try {
      const ref = window.fs.doc(window.fs.db, 'clientExercises', currentClientUid, 'dates', isoDate);
      const snap = await window.fs.getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const count = Array.isArray(data.exercises) ? data.exercises.length : 0;
        if (count > 0) {
          // Añadir contador dentro de la celda
          dayEl.insertAdjacentHTML('beforeend',
            `<span class="exercise-count">${count}</span>`);
        }
      }
    } catch (e) {
      console.error('Error leyendo ejercicios para', isoDate, e);
    }
  });
}

// Abrir Day Detail
calendar.addEventListener('click', e => {
  const dayEl = e.target.closest('.calendar__day');
  if (!dayEl || dayEl.classList.contains('calendar__day--hidden')) return;
  const day = String(dayEl.dataset.day).padStart(2,'0');
  const year  = currentDate.getFullYear();
  const month = String(currentDate.getMonth()+1).padStart(2,'0');
  const isoDate = `${year}-${month}-${day}`;
  window.api.openDayDetail(currentClientUid, isoDate);
});
