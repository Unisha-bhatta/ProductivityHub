// ==========================================================
//  ProductivityHub — script.js
//  Phase 2 (Day 4): Auth Module
//  - Tab switching (Sign In / Sign Up)
//  - Real-time form validation
//  - Password strength meter
//  - Show / hide password toggle
//  - Login and signup logic
//  - Session persistence via localStorage
// ==========================================================


// ── Wait for DOM to be ready ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Grab form elements
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');

  // Attach tab click events
  tabLogin.addEventListener('click',  () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // Attach form submit events
  loginForm.addEventListener('submit',  handleLogin);
  signupForm.addEventListener('submit', handleSignup);

  // Password strength — fires on every keystroke
  document.getElementById('signup-password').addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });

  // Show / hide password toggles
  // We use querySelectorAll because there are 3 pw-toggle buttons
  document.querySelectorAll('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      // The input is the previous sibling of this button inside .password-wrap
      const input = btn.previousElementSibling;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      // Dim the icon when password is visible so the user knows the state
      btn.style.opacity = isHidden ? '1' : '0.45';
    });
  });

  // Check if a user session already exists
  // If yes, skip the auth screen and go straight to dashboard
  checkExistingSession();

});


// ==========================================================
//  TAB SWITCHING
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

  // Clear all errors when switching tabs
  clearAllErrors();
}


// ==========================================================
//  FORM VALIDATION HELPERS
// ==========================================================

// Show an error message under a field
function showError(errorId, message) {
  document.getElementById(errorId).textContent = message;
}

// Clear a single error
function clearError(errorId) {
  document.getElementById(errorId).textContent = '';
}

// Clear all error messages and remove red borders from all inputs
function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  document.querySelectorAll('input.error').forEach((el) => {
    el.classList.remove('error');
  });
}

// Mark a field as invalid — red border + error message
function markInvalid(inputId, errorId, message) {
  document.getElementById(inputId).classList.add('error');
  showError(errorId, message);
}

// Mark a field as valid — remove red border
function markValid(inputId, errorId) {
  document.getElementById(inputId).classList.remove('error');
  clearError(errorId);
}

// Email format check using a regular expression
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// ==========================================================
//  PASSWORD STRENGTH METER
// ==========================================================

function updatePasswordStrength(password) {
  const bar  = document.getElementById('pw-bar');
  const hint = document.getElementById('pw-hint');

  // Score the password out of 5
  let score = 0;
  if (password.length >= 6)          score++; // minimum length
  if (password.length >= 10)         score++; // good length
  if (/[A-Z]/.test(password))        score++; // has uppercase
  if (/[0-9]/.test(password))        score++; // has number
  if (/[^A-Za-z0-9]/.test(password)) score++; // has special char

  // Map score to visual feedback
  const levels = [
    { width: '20%',  color: '#ff5f6e', label: 'Very weak'   },
    { width: '40%',  color: '#ff5f6e', label: 'Weak'        },
    { width: '60%',  color: '#f5a623', label: 'Fair'        },
    { width: '80%',  color: '#3ecf88', label: 'Strong'      },
    { width: '100%', color: '#3ecf88', label: 'Very strong' },
  ];

  if (password.length === 0) {
    // Reset bar when field is empty
    bar.style.width      = '0%';
    bar.style.background = 'transparent';
    hint.textContent     = '';
    hint.style.color     = '';
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
  e.preventDefault(); // stop the page from refreshing
  clearAllErrors();

  const email    = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  let valid      = true;

  // Validate email
  if (!isValidEmail(email.value)) {
    markInvalid('login-email', 'login-email-error', 'Please enter a valid email address');
    valid = false;
  } else {
    markValid('login-email', 'login-email-error');
  }

  // Validate password
  if (password.value.length < 6) {
    markInvalid('login-password', 'login-password-error', 'Password must be at least 6 characters');
    valid = false;
  } else {
    markValid('login-password', 'login-password-error');
  }

  if (!valid) return;

  // Build a user object from the email
  // We derive a display name from the part before the @ symbol
  const rawName     = email.value.split('@')[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const user = {
    name:  displayName,
    email: email.value.trim(),
  };

  // Save session and enter dashboard
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
  let valid      = true;

  // Validate name
  if (name.value.trim().length < 2) {
    markInvalid('signup-name', 'signup-name-error', 'Name must be at least 2 characters');
    valid = false;
  } else {
    markValid('signup-name', 'signup-name-error');
  }

  // Validate email
  if (!isValidEmail(email.value)) {
    markInvalid('signup-email', 'signup-email-error', 'Please enter a valid email address');
    valid = false;
  } else {
    markValid('signup-email', 'signup-email-error');
  }

  // Validate password length
  if (password.value.length < 6) {
    markInvalid('signup-password', 'signup-password-error', 'Password must be at least 6 characters');
    valid = false;
  } else {
    markValid('signup-password', 'signup-password-error');
  }

  // Validate passwords match
  if (password.value !== confirm.value) {
    markInvalid('signup-confirm', 'signup-confirm-error', 'Passwords do not match');
    valid = false;
  } else if (confirm.value.length > 0) {
    markValid('signup-confirm', 'signup-confirm-error');
  }

  if (!valid) return;

  const user = {
    name:  name.value.trim(),
    email: email.value.trim(),
  };

  saveSession(user);
  showDashboard(user);
}


// ==========================================================
//  SESSION MANAGEMENT
// ==========================================================

// Save user to localStorage so they stay logged in on refresh
function saveSession(user) {
  localStorage.setItem('ph_user', JSON.stringify(user));
}

// Load user from localStorage
function loadSession() {
  const data = localStorage.getItem('ph_user');
  return data ? JSON.parse(data) : null;
}

// Clear session on logout
function clearSession() {
  localStorage.removeItem('ph_user');
}

// On page load — if a session exists, skip auth and go to dashboard
function checkExistingSession() {
  const user = loadSession();
  if (user) {
    showDashboard(user);
  }
}


// ==========================================================
//  SCREEN TRANSITIONS
// ==========================================================

function showDashboard(user) {
  // Hide auth, show dashboard
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');

  // Populate user info in the sidebar
  document.getElementById('user-name-display').textContent = user.name;
  document.getElementById('user-avatar').textContent       = user.name.charAt(0).toUpperCase();
}

function showAuth() {
  document.getElementById('dashboard-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  // Reset both forms
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  clearAllErrors();

  // Reset password strength bar
  updatePasswordStrength('');
}

// Logout — called from the logout button (added in Day 5)
function logout() {
  clearSession();
  showAuth();
}