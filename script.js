const $ = (selector) => document.querySelector(selector);

let tasks = JSON.parse(localStorage.getItem('smartTasks') || '[]');
let filter = 'all';

function save() {
  localStorage.setItem('smartTasks', JSON.stringify(tasks));
}

function render() {
  const query = $('#search').value.toLowerCase();
  const list = tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.done) ||
      (filter === 'completed' && task.done);

    return matchesFilter && task.title.toLowerCase().includes(query);
  });

  $('#taskList').innerHTML = list
    .map(
      (task) => `
        <li class="task ${task.done ? 'done' : ''}">
          <input
            type="checkbox"
            ${task.done ? 'checked' : ''}
            onchange="toggleTask('${task.id}')"
            aria-label="Mark ${escapeHtml(task.title)} complete"
          >
          <span class="title">${escapeHtml(task.title)}</span>
          <span class="badge">${escapeHtml(task.priority)}</span>
          <span class="actions">
            <button type="button" onclick="editTask('${task.id}')">Edit</button>
            <button type="button" onclick="deleteTask('${task.id}')">Delete</button>
          </span>
        </li>
      `
    )
    .join('');

  $('#empty').style.display = list.length ? 'none' : 'block';

  const completed = tasks.filter((task) => task.done).length;
  $('#stats').innerHTML = `
    <span class="stat">Total: <b>${tasks.length}</b></span>
    <span class="stat">Active: <b>${tasks.length - completed}</b></span>
    <span class="stat">Completed: <b>${completed}</b></span>
  `;
}

function addTask() {
  const title = $('#taskInput').value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority: $('#priority').value,
    done: false,
  });

  $('#taskInput').value = '';
  save();
  render();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  save();
  render();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const value = prompt('Edit task', task.title);
  if (value && value.trim()) {
    task.title = value.trim();
    save();
    render();
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

$('#addBtn').onclick = addTask;
$('#taskInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addTask();
});
$('#search').oninput = render;

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.onclick = () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => {
      item.classList.remove('active');
    });
    button.classList.add('active');
    render();
  };
});

render();
