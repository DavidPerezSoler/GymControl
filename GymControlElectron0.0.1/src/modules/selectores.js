// src/modules/selectores.js

// contenedor general
export const calendar = document.querySelector('.calendar-container');
// lista de días (se irán llenando por Calendar.js)
export const calendarDays = document.querySelector('.calendar__days');
// botones de mes anterior / siguiente
export const previousMonthBtn = document.querySelector('.calendar__button--previous');
export const nextMonthBtn     = document.querySelector('.calendar__button--next');
// título con “Mes Año”
export const calendarDateEl = document.getElementById('calendar-date');
