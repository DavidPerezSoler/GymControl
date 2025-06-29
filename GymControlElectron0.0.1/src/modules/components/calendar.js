// src/modules/components/Calendar.js
export let currentDate = new Date();

const months = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export function renderCalendar() {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startIndex = (firstDay.getDay() + 6) % 7;
  const totalDays  = new Date(year, month+1, 0).getDate();

  document.getElementById('calendar-date').textContent =
    `${months[month]} ${year}`;

  const container = document.querySelector('.calendar__days');
  container.innerHTML = '';

  for(let i=0; i<startIndex; i++){
    const empty = document.createElement('li');
    empty.classList.add('calendar__day','calendar__day--hidden');
    container.appendChild(empty);
  }
  for(let day=1; day<=totalDays; day++){
    const li = document.createElement('li');
    li.classList.add('calendar__day');
    li.dataset.day = day;
    li.innerHTML = `<h5>${day}</h5>`;
    const today = new Date();
    if(day===today.getDate() &&
       month===today.getMonth() &&
       year===today.getFullYear()){
      li.classList.add('calendar__day--today');
    }
    container.appendChild(li);
  }
}

export function setMonth(delta) {
  const m = currentDate.getMonth() + delta;
  currentDate.setMonth(m);
}
