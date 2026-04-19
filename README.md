# ◈ ProductivityHub

> A personal productivity dashboard for task management, real-time weather, and user authentication. Built with pure HTML, CSS, and JavaScript. No frameworks. No dependencies.


## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Tech Stack](#-tech-stack)
- [Roadmap](#-roadmap)
- [Design System](#-design-system)
- [License](#-license)

---

## Overview

**ProductivityHub** is a single-page application (SPA) that combines three core utilities into one unified dashboard:

- **Authentication** — Sign up and sign in with full client-side validation
- **Task Manager** — Create, prioritize, complete, edit, and reorder tasks
- **Weather** — Live weather data for any city in the world

The entire app runs in the browser with zero build tools, zero frameworks, and zero dependencies. Data persists across sessions using the browser's `localStorage` API.

This project was built as a real-world frontend exercise demonstrating SPA architecture, API integration, drag-and-drop interaction, responsive design, and a professional design system — all from scratch.

---

## Features

### Authentication
- Sign In and Sign Up with a tabbed interface
- Real-time field validation (name, email format, password length, confirm match)
- Password strength meter with 5 levels: Very Weak → Very Strong
- Show / hide password toggle on all password fields
- Session persistence — users stay logged in after page refresh

### Task Manager
- Add tasks with a priority level: 🔴 High, 🟡 Medium, 🟢 Low
- Mark tasks complete with an animated checkbox
- Inline editing — double-click any task to rename it
- Hover-to-reveal delete button
- Drag-and-drop reordering
- Filter by: All · Pending · Completed · High · Medium · Low
- Pending task count badge in the sidebar
- All tasks persisted to `localStorage`

### Weather
- Search real-time weather by city name
- Displays: temperature, feels like, humidity, wind speed & direction, UV index, cloud cover, and local time
- Weather icon from WeatherAPI
- Graceful error handling for invalid cities and network failures
- Mini weather summary visible on the Overview tab
- Last searched city restored on reload

### Overview Dashboard
- Personalized greeting based on time of day
- Stats cards: Total Tasks · Completed · Pending · High Priority
- Visual progress bar showing percentage complete
- Quick-add task form
- Recent tasks list (latest 5)
- Mini weather widget with link to full weather tab

---

## Project Structure

```
productivity-hub/
│
├── index.html          # App shell — all HTML sections and templates
├── style.css           # Design system — tokens, layout, components, responsive
├── script.js           # All logic — Auth, Tasks, Weather, Dashboard modules
└── README.md           # Project documentation
```

Each module in `script.js` is clearly separated with section comments:

```
// AUTH MODULE
// DASHBOARD MODULE
// TASKS MODULE
// WEATHER MODULE
// UTILITIES
```

---

## Getting Started

No installation. No build step. No Node.js required.

**Option 1 — Clone the repository**
```bash
git clone https://github.com/Unisha-bhatta/ProductivityHub.git
cd productivity-hub
```
Then open `index.html` in your browser.

**Option 2 — Download ZIP**

Click **Code → Download ZIP**, extract it, and open `index.html`.

**Option 3 — Live Server (recommended for development)**

If you use VS Code, install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, and select **Open with Live Server**.

> **Demo credentials:** Use any valid email address and any password with 6 or more characters to sign in or create an account. Authentication is client-side only.

---

## Design System

The visual design is built on a set of CSS custom properties (tokens) defined in `:root`, ensuring consistency across every component.

| Token | Value | Usage |
|---|---|---|
| `--bg-page` | `#0d0d14` | Page background |
| `--bg-card` | `#18182a` | Cards and panels |
| `--accent` | `#7c6fff` | Buttons, active states, links |
| `--green` | `#3ecf88` | Completed tasks, success states |
| `--amber` | `#f5a623` | Medium priority, warnings |
| `--red` | `#ff5f6e` | High priority, errors |
| `--font-display` | DM Serif Display | Headings and greetings |
| `--font-main` | DM Sans | All UI text |

**Design principles:**
- Dark-first, high contrast for readability
- Color encodes meaning — not decoration
- Motion is subtle and purposeful (slide-up, fade-in, hover lifts)
- Priority system uses left-border color coding for instant visual scanning
- Mobile-first responsive breakpoints at 900px, 700px, and 480px

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute with attribution.

---
