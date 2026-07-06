// ═══════════════════════════════════════════════════════
//  1. STATE & STORAGE
// ═══════════════════════════════════════════════════════

const state = {
  user:        null,   // { name, email }
  tasks:       [],     // [{ id, text, priority, completed, createdAt }]
  taskFilter:  'all',  // 'all' | 'pending' | 'completed' | 'high' | 'medium' | 'low'
  weather:     null,   // last fetched weather data
  nextId:      1,      // auto-incrementing task ID
};

function save() {
  localStorage.setItem('ph_user',    JSON.stringify(state.user));
  localStorage.setItem('ph_tasks',   JSON.stringify(state.tasks));
  localStorage.setItem('ph_next_id', state.nextId);
  if (state.weather) localStorage.setItem('ph_weather', JSON.stringify(state.weather));
}

function load() {
  try {
    const user    = localStorage.getItem('ph_user');
    const tasks   = localStorage.getItem('ph_tasks');
    const nextId  = localStorage.getItem('ph_next_id');
    const weather = localStorage.getItem('ph_weather');

    if (user)    state.user    = JSON.parse(user);
    if (tasks)   state.tasks   = JSON.parse(tasks);
    if (nextId)  state.nextId  = parseInt(nextId, 10) || 1;
    if (weather) state.weather = JSON.parse(weather);
  } catch (e) {
    // Corrupted storage — start fresh
    localStorage.clear();
  }
}


// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  load();

  // Auth events
  document.getElementById('tab-login').addEventListener('click',  () => switchAuthTab('login'));
  document.getElementById('tab-signup').addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('login-form').addEventListener('submit',  handleLogin);
  document.getElementById('signup-form').addEventListener('submit', handleSignup);

  // Password strength
  document.getElementById('signup-password').addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // Show / hide password toggles
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.style.opacity = input.type === 'text' ? '1' : '0.45';
    });
  });

  // Check for existing session
  if (state.user) {
    enterDashboard(state.user);
  }
});


// ═══════════════════════════════════════════════════════
//  2. AUTH MODULE
// ═══════════════════════════════════════════════════════

function switchAuthTab(tab) {
  const isLogin = tab === 'login';

  document.getElementById('login-form').classList.toggle('hidden', !isLogin);
  document.getElementById('signup-form').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-signup').classList.toggle('active', !isLogin);

  clearAllFieldErrors();
}

// ── Login ───────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  clearAllFieldErrors();

  const email    = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  let ok = true;

  if (!validEmail(email.value)) {
    setFieldError(email, 'login-email-error', 'Enter a valid email address');
    ok = false;
  }

  if (password.value.length < 6) {
    setFieldError(password, 'login-password-error', 'Password must be at least 6 characters');
    ok = false;
  }

  if (!ok) return;

  const name = email.value.split('@')[0];
  const user = {
    name:  name.charAt(0).toUpperCase() + name.slice(1),
    email: email.value.trim(),
  };

  state.user = user;
  save();
  enterDashboard(user);
}

// ── Signup ──────────────────────────────────────────────
function handleSignup(e) {
  e.preventDefault();
  clearAllFieldErrors();

  const name     = document.getElementById('signup-name');
  const email    = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirm  = document.getElementById('signup-confirm');
  let ok = true;

  if (name.value.trim().length < 2) {
    setFieldError(name, 'signup-name-error', 'Name must be at least 2 characters');
    ok = false;
  }

  if (!validEmail(email.value)) {
    setFieldError(email, 'signup-email-error', 'Enter a valid email address');
    ok = false;
  }

  if (password.value.length < 6) {
    setFieldError(password, 'signup-password-error', 'Password must be at least 6 characters');
    ok = false;
  }

  if (password.value !== confirm.value) {
    setFieldError(confirm, 'signup-confirm-error', 'Passwords do not match');
    ok = false;
  }

  if (!ok) return;

  const user = {
    name:  name.value.trim(),
    email: email.value.trim(),
  };

  state.user = user;
  save();
  enterDashboard(user);
}

// ── Logout ──────────────────────────────────────────────
function logout() {
  state.user    = null;
  state.weather = null;
  localStorage.removeItem('ph_user');
  localStorage.removeItem('ph_weather');

  document.getElementById('dashboard-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  clearAllFieldErrors();
  updatePasswordStrength('');
  switchAuthTab('login');
}

// ── Password strength meter ─────────────────────────────
function updatePasswordStrength(pw) {
  const bar  = document.getElementById('pw-bar');
  const hint = document.getElementById('pw-hint');

  if (!pw) {
    bar.style.width = '0%';
    hint.textContent = '';
    return;
  }

  let score = 0;
  if (pw.length >= 6)          score++;
  if (pw.length >= 10)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { w: '20%',  c: '#ff5f6e', l: 'Very weak'   },
    { w: '40%',  c: '#ff5f6e', l: 'Weak'        },
    { w: '60%',  c: '#f5a623', l: 'Fair'        },
    { w: '80%',  c: '#3ecf88', l: 'Strong'      },
    { w: '100%', c: '#3ecf88', l: 'Very strong' },
  ];

  const lv           = levels[score - 1] || levels[0];
  bar.style.width      = lv.w;
  bar.style.background = lv.c;
  hint.textContent     = lv.l;
  hint.style.color     = lv.c;
}

// ── Validation helpers ──────────────────────────────────
function validEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function setFieldError(inputEl, errorId, msg) {
  inputEl.classList.add('error');
  document.getElementById(errorId).textContent = msg;
}

function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach((el) => el.textContent = '');
  document.querySelectorAll('input.error').forEach((el) => el.classList.remove('error'));
}


// ═══════════════════════════════════════════════════════
//  3. DASHBOARD MODULE
// ═══════════════════════════════════════════════════════

function enterDashboard(user) {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');

  // Sidebar user info
  document.getElementById('user-name-display').textContent  = user.name;
  document.getElementById('user-email-display').textContent = user.email;
  document.getElementById('user-avatar').textContent        = user.name.charAt(0).toUpperCase();

  setGreeting(user);
  setDate();
  renderStats();
  renderTaskList();
  renderRecentTasks();

  // Restore weather mini if we have cached data
  if (state.weather) renderWeatherMini(state.weather);
}

function setGreeting(user) {
  const h = new Date().getHours();
  const period = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const first  = user.name.split(' ')[0];
  document.getElementById('greeting-text').textContent = `${period}, ${first} 👋`;
}

function setDate() {
  const d   = new Date();
  const day  = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('header-date').innerHTML = `<strong>${day}</strong><br>${date}`;
}

function switchDashTab(tab, btn) {
  document.querySelectorAll('.dash-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((b)  => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
}


// ═══════════════════════════════════════════════════════
//  4. TASKS MODULE
// ═══════════════════════════════════════════════════════

// ── Add ─────────────────────────────────────────────────
function addTask() {
  const input    = document.getElementById('task-input');
  const priority = document.getElementById('task-priority').value;
  const text     = input.value.trim();

  if (!text) {
    input.style.borderColor = 'var(--red)';
    setTimeout(() => input.style.borderColor = '', 1200);
    input.focus();
    return;
  }

  createTask(text, priority);
  input.value = '';
  input.focus();
  showToast('Task added');
}

function addTaskFromOverview() {
  const input    = document.getElementById('overview-task-input');
  const priority = document.getElementById('overview-priority').value;
  const text     = input.value.trim();
  if (!text) { input.focus(); return; }

  createTask(text, priority);
  input.value = '';
  showToast('Task added');
}

function createTask(text, priority = 'medium') {
  const task = {
    id:        state.nextId++,
    text,
    priority,
    completed: false,
    createdAt: Date.now(),
  };
  state.tasks.unshift(task);
  save();
  renderTaskList();
  renderRecentTasks();
  renderStats();
}

// ── Toggle complete ─────────────────────────────────────
function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  save();
  renderTaskList();
  renderRecentTasks();
  renderStats();
}

// ── Delete ──────────────────────────────────────────────
function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  save();
  renderTaskList();
  renderRecentTasks();
  renderStats();
  showToast('Task deleted');
}

// ── Clear all completed ─────────────────────────────────
function clearCompleted() {
  const count = state.tasks.filter((t) => t.completed).length;
  if (!count) return;
  state.tasks = state.tasks.filter((t) => !t.completed);
  save();
  renderTaskList();
  renderRecentTasks();
  renderStats();
  showToast(`${count} completed task${count > 1 ? 's' : ''} cleared`);
}

// ── Filter ──────────────────────────────────────────────
function filterTasks(filter, btn) {
  state.taskFilter = filter;
  document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  renderTaskList();
}

function getFiltered() {
  const f = state.taskFilter;
  if (f === 'all')       return state.tasks;
  if (f === 'pending')   return state.tasks.filter((t) => !t.completed);
  if (f === 'completed') return state.tasks.filter((t) =>  t.completed);
  return state.tasks.filter((t) => t.priority === f);
}

// ── Render list ─────────────────────────────────────────
function renderTaskList() {
  const list     = document.getElementById('task-list');
  const empty    = document.getElementById('task-empty');
  const badge    = document.getElementById('tasks-badge');
  const clearBtn = document.getElementById('clear-completed-btn');
  const filtered = getFiltered();

  const pendingCount   = state.tasks.filter((t) => !t.completed).length;
  const completedCount = state.tasks.filter((t) =>  t.completed).length;

  // Update badge
  badge.textContent = pendingCount || '';
  badge.classList.toggle('visible', pendingCount > 0);

  // Show/hide clear completed button
  clearBtn.style.display = completedCount > 0 ? 'block' : 'none';

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  filtered.forEach((task) => {
    list.appendChild(buildTaskEl(task));
  });

  initDragDrop(list);
}

function buildTaskEl(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
  li.dataset.id = task.id;
  li.draggable  = true;

  const labels = { high: 'High', medium: 'Medium', low: 'Low' };

  li.innerHTML = `
    <div class="drag-handle" title="Drag to reorder">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9"  cy="5"  r="1.3"/><circle cx="15" cy="5"  r="1.3"/>
        <circle cx="9"  cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/>
        <circle cx="9"  cy="19" r="1.3"/><circle cx="15" cy="19" r="1.3"/>
      </svg>
    </div>
    <div class="task-check" onclick="toggleTask(${task.id})">
      <svg class="check-mark" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div class="task-text-wrap">
      <span class="task-text" ondblclick="startEdit(${task.id}, this)">${escapeHtml(task.text)}</span>
    </div>
    <span class="priority-badge badge-${task.priority}">${labels[task.priority]}</span>
    <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task" aria-label="Delete task">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
      </svg>
    </button>
  `;

  return li;
}

// ── Inline edit ─────────────────────────────────────────
function startEdit(id, spanEl) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task || task.completed) return;

  const input = document.createElement('input');
  input.type      = 'text';
  input.value     = task.text;
  input.className = 'task-edit-input';

  const commit = () => {
    const val = input.value.trim();
    if (val && val !== task.text) {
      task.text = val;
      save();
      showToast('Task updated');
    }
    renderTaskList();
    renderRecentTasks();
  };

  input.addEventListener('blur',    commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { input.blur(); }
    if (e.key === 'Escape') { input.value = task.text; input.blur(); }
  });

  spanEl.replaceWith(input);
  input.focus();
  input.select();
}

// ── Drag and drop ────────────────────────────────────────
function initDragDrop(list) {
  let dragged = null;

  list.addEventListener('dragstart', (e) => {
    dragged = e.target.closest('li');
    if (!dragged) return;
    dragged.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    document.querySelectorAll('.task-item').forEach((el) => {
      el.classList.remove('dragging', 'drag-target');
    });
    // Sync state order to DOM
    const ids = [...list.querySelectorAll('.task-item')].map((el) => parseInt(el.dataset.id, 10));
    state.tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    save();
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('li');
    if (!target || target === dragged) return;

    document.querySelectorAll('.task-item').forEach((el) => el.classList.remove('drag-target'));
    target.classList.add('drag-target');

    const mid = target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
    if (e.clientY < mid) {
      list.insertBefore(dragged, target);
    } else {
      list.insertBefore(dragged, target.nextSibling);
    }
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    document.querySelectorAll('.task-item').forEach((el) => el.classList.remove('drag-target'));
    dragged = null;
  });
}

// ── Stats ────────────────────────────────────────────────
function renderStats() {
  const total   = state.tasks.length;
  const done    = state.tasks.filter((t) =>  t.completed).length;
  const pending = state.tasks.filter((t) => !t.completed).length;
  const high    = state.tasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-high').textContent    = high;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

// ── Recent tasks ─────────────────────────────────────────
function renderRecentTasks() {
  const container = document.getElementById('recent-tasks');
  const recent    = state.tasks.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = '<li class="empty-note">No tasks yet — add one to get started.</li>';
    return;
  }

  const colors = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' };

  container.innerHTML = recent.map((t) => `
    <li class="recent-item ${t.completed ? 'done' : ''}">
      <span class="recent-dot" style="background:${colors[t.priority]}"></span>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(t.text)}</span>
    </li>
  `).join('');
}


// ═══════════════════════════════════════════════════════
//  5. WEATHER MODULE
// ═══════════════════════════════════════════════════════

const WEATHER_KEY = '52bc14bf1df3f5a9d620a61de21f4a2d';

async function fetchWeather() {
  const cityInput = document.getElementById('city-input');
  const city      = cityInput.value.trim();
  if (!city) { cityInput.focus(); return; }

  // UI state: loading
  document.getElementById('weather-loading').hidden = false;
  document.getElementById('weather-result').hidden  = true;
  document.getElementById('weather-error').hidden   = true;

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${encodeURIComponent(city)}&aqi=no`;
    const res  = await fetch(url);

    if (!res.ok) throw new Error('not_found');

    const data = await res.json();
    state.weather = data;
    save();

    renderWeather(data);
    renderWeatherMini(data);
    showToast(`Weather loaded for ${data.location.name}`);

  } catch (err) {
    const msg = err.message === 'not_found'
      ? 'City not found. Check the spelling and try again.'
      : 'Network error. Please check your connection.';

    document.getElementById('weather-error-msg').textContent = msg;
    document.getElementById('weather-error').hidden = false;
  } finally {
    document.getElementById('weather-loading').hidden = true;
  }
}

function renderWeather(data) {
  const loc = data.location;
  const cur = data.current;

  const region = [loc.region, loc.country].filter(Boolean).join(', ');
  const localTime = new Date(loc.localtime).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  document.getElementById('w-city').textContent      = loc.name;
  document.getElementById('w-region').textContent    = region;
  document.getElementById('w-condition').textContent = cur.condition.text;
  document.getElementById('w-time').textContent      = `Local time: ${localTime}`;
  document.getElementById('w-icon').src              = `https:${cur.condition.icon}`;
  document.getElementById('w-icon').alt              = cur.condition.text;
  document.getElementById('w-temp').textContent      = `${Math.round(cur.temp_c)}°`;
  document.getElementById('w-feels').textContent     = `${Math.round(cur.feelslike_c)}°C`;
  document.getElementById('w-humidity').textContent  = `${cur.humidity}%`;
  document.getElementById('w-wind').textContent      = `${Math.round(cur.wind_kph)} km/h ${cur.wind_dir}`;
  document.getElementById('w-uv').textContent        = `${cur.uv} / 11`;
  document.getElementById('w-cloud').textContent     = `${cur.cloud}%`;
  document.getElementById('w-vis').textContent       = `${cur.vis_km} km`;

  document.getElementById('weather-result').hidden = false;
}

function renderWeatherMini(data) {
  document.getElementById('mini-city').textContent = data.location.name;
  document.getElementById('mini-temp').textContent = `${Math.round(data.current.temp_c)}°C`;

  const icon = document.getElementById('mini-icon');
  icon.src = `https:${data.current.condition.icon}`;
  icon.alt = data.current.condition.text;

  document.getElementById('weather-mini-data').style.display = 'flex';
}


// ═══════════════════════════════════════════════════════
//  6. UTILITIES
// ═══════════════════════════════════════════════════════

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}