window.addEventListener('DOMContentLoaded', () => {
  const exercisesListEl = document.getElementById('exercisesList');
  const form = document.getElementById('form');
  const errorEl = document.getElementById('error');

  async function loadExercises() {
    exercisesListEl.innerHTML = '';
    errorEl.textContent = '';
    try {
      const data = await window.api.fetchExercises();
      data.forEach(e => {
        const li = document.createElement('li');
        li.textContent = `${e.name} (${e.category})`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          window.api.openDetail(e);
        });
        exercisesListEl.appendChild(li);
      });
    } catch (err) {
      errorEl.textContent = 'Could not load exercises.';
      console.error(err);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    const formData = new FormData(form);
    const body = {
      name: formData.get('name'),
      force: formData.get('force'),
      level: formData.get('level'),
      mechanic: formData.get('mechanic'),
      equipment: formData.get('equipment'),
      category: formData.get('category'),
      primaryMuscles: formData.get('primaryMuscles')
        .split(',').map(s => s.trim()).filter(s => s),
      secondaryMuscles: formData.get('secondaryMuscles')
        .split(',').map(s => s.trim()).filter(s => s),
      instructions: formData.get('instructions')
        .split('\n').map(s => s.trim()).filter(s => s)
    };

    try {
      await window.api.postExercise(body);
      form.reset();
      await loadExercises();
    } catch (err) {
      errorEl.textContent = 'Could not create exercise.';
      console.error(err);
    }
  });

  loadExercises();
});
