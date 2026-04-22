// ==========================================================
//  ProductivityHub — script.js
//  Phase 2 (Day 4): Auth Module
//  Phase 2 (Day 5): Dashboard Module added
// ==========================================================


// ── Wait for DOM ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Auth tab events
  document.getElementById('tab-login').addEventListener('click',  () => switchTab('login'));
  document.getElementById('tab-signup').addEventListener('click', () => switchTab('signup'));

  // Form submit events
  document.getElementById('login-form').addEventListener('submit',  handleLogin);
  document.getElementById('signup-form').addEventListener('submit', handleSignup);

  // Password strength meter
  document.getElementById('signup-password').addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // Show / hide password toggles
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.style.opacity = isHidden ? '1' : '0.45';
    });
  });

  // Check for an existing session on page load
  checkExistingSession();
});


// ==========================================================
//  TAB SWITCHING — AUTH
// ==========================================================

function switchTab(tab) {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }

  clearAllErrors();
}


// ==========================================================
//  VALIDATION HELPERS
// ==========================================================

function showError(errorId, message) {
  document.getElementById(errorId).textContent = message;
}

function clearError(errorId) {
  document.getElementById(errorId).textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach((el) => el.textContent = '');
  document.querySelectorAll('input.error').forEach((el) => el.classList.remove('error'));
}

function markInvalid(inputId, errorId, message) {
  document.getElementById(inputId).classList.add('error');
  showError(errorId, message);
}

function markValid(inputId, errorId) {
  document.getElementById(inputId).classList.remove('error');
  clearError(errorId);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// ==========================================================
//  PASSWORD STRENGTH METER
// ==========================================================

function updatePasswordStrength(password) {
  const bar  = document.getElementById('pw-bar');
  const hint = document.getElementById('pw-hint');

  let score = 0;
  if (password.length >= 6)          score++;
  if (password.length >= 10)         score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { width: '20%',  color: '#ff5f6e', label: 'Very weak'   },
    { width: '40%',  color: '#ff5f6e', label: 'Weak'        },
    { width: '60%',  color: '#f5a623', label: 'Fair'        },
    { width: '80%',  color: '#3ecf88', label: 'Strong'      },
    { width: '100%', color: '#3ecf88', label: 'Very strong' },
  ];

  if (password.length === 0) {
    bar.style.width      = '0%';
    bar.style.background = 'transparent';
    hint.textContent     = '';
    return;
  }

  const level          = levels[score - 1] || levels[0];
  bar.style.width      = level.width;
  bar.style.background = level.color;
  hint.textContent     = level.label;
  hint.style.color     = level.color;
}


// ==========================================================
//  LOGIN HANDLER
// ==========================================================

function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();

  const email    = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  let valid = true;

  if (!isValidEmail(email.value)) {
    markInvalid('login-email', 'login-email-error', 'Please enter a valid email address');
    valid = false;
  } else {
    markValid('login-email', 'login-email-error');
  }

  if (password.value.length < 6) {
    markInvalid('login-password', 'login-password-error', 'Password must be at least 6 characters');
    valid = false;
  } else {
    markValid('login-password', 'login-password-error');
  }

  if (!valid) return;

  const rawName     = email.value.split('@')[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const user        = { name: displayName, email: email.value.trim() };

  saveSession(user);
  showDashboard(user);
}


// ==========================================================
//  SIGNUP HANDLER
// ==========================================================

function handleSignup(e) {
  e.preventDefault();
  clearAllErrors();

  const name     = document.getElementById('signup-name');
  const email    = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirm  = document.getElementById('signup-confirm');
  let valid = true;

  if (name.value.trim().length < 2) {
    markInvalid('signup-name', 'signup-name-error', 'Name must be at least 2 characters');
    valid = false;
  } else {
    markValid('signup-name', 'signup-name-error');
  }

  if (!isValidEmail(email.value)) {
    markInvalid('signup-email', 'signup-email-error', 'Please enter a valid email address');
    valid = false;
  } else {
    markValid('signup-email', 'signup-email-error');
  }

  if (password.value.length < 6) {
    markInvalid('signup-password', 'signup-password-error', 'Password must be at least 6 characters');
    valid = false;
  } else {
    markValid('signup-password', 'signup-password-error');
  }

  if (password.value !== confirm.value) {
    markInvalid('signup-confirm', 'signup-confirm-error', 'Passwords do not match');
    valid = false;
  } else if (confirm.value.length > 0) {
    markValid('signup-confirm', 'signup-confirm-error');
  }

  if (!valid) return;

  const user = { name: name.value.trim(), email: email.value.trim() };
  saveSession(user);
  showDashboard(user);
}


// ==========================================================
//  SESSION MANAGEMENT
// ==========================================================

function saveSession(user) {
  localStorage.setItem('ph_user', JSON.stringify(user));
}

function loadSession() {
  const data = localStorage.getItem('ph_user');
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem('ph_user');
}

function checkExistingSession() {
  const user = loadSession();
  if (user) showDashboard(user);
}


// ==========================================================
//  SCREEN TRANSITIONS
// ==========================================================

function showDashboard(user) {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');

  // Populate sidebar user info
  document.getElementById('user-name-display').textContent = user.name;
  document.getElementById('user-avatar').textContent       = user.name.charAt(0).toUpperCase();

  // Set greeting and date
  setGreeting(user);
  setHeaderDate();

  // Render stats (all zero until tasks are added in Day 6)
  renderStats();
}

function showAuth() {
  document.getElementById('dashboard-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  clearAllErrors();
  updatePasswordStrength('');
}

function logout() {
  clearSession();
  showAuth();
}


// ==========================================================
//  DASHBOARD MODULE
// ==========================================================

// Switch between Overview / Tasks / Weather tabs
function switchDashTab(tab, btn) {
  // Hide all tabs
  document.querySelectorAll('.dash-tab').forEach((t) => t.classList.remove('active'));
  // Remove active from all nav buttons
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));

  // Show selected tab and mark button active
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
}

// Personalized greeting based on time of day
function setGreeting(user) {
  const hour = new Date().getHours();
  let timeOfDay = 'Good morning';
  if (hour >= 12 && hour < 18) timeOfDay = 'Good afternoon';
  else if (hour >= 18)         timeOfDay = 'Good evening';

  const firstName = user.name.split(' ')[0];
  document.getElementById('greeting-text').textContent = `${timeOfDay}, ${firstName} 👋`;
}

// Display the current date in the header
function setHeaderDate() {
  const now  = new Date();
  const day  = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  document.getElementById('header-date').innerHTML = `<strong>${day}</strong><br>${date}`;
}

// Render stats cards — tasks module fills these in Day 6
function renderStats() {
  // These will be wired to real task data in Day 6
  // For now they correctly show 0
  const total   = 0;
  const done    = 0;
  const pending = 0;
  const high    = 0;
  const pct     = 0;

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-high').textContent    = high;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}