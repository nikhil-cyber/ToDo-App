# Daily Planner

A personal productivity app for logging daily work, managing reminders, and tracking long-term goals. All data is stored locally in the browser — no account, no server, no internet connection required after the first load.

---

## Features

### Daily Log
- Log tasks for any day with a description, time spent (hours + minutes), customer name, and an optional link
- Navigate between days using arrow buttons or click the date label to open a calendar picker
- Switch between **Day view** (single day) and **Week view** (Monday–Sunday) to see your full week at a glance
- Click any day header in Week view to jump to that day
- Edit any logged task inline — click the pencil icon on hover
- Summary stats: total tasks and total time logged per day or week

### Reminders
- Add future tasks with a due date, priority (Low / Medium / High), customer name, and an optional link
- Overdue reminders are highlighted and pulse red
- Filter by All / Active / Completed / High Priority / Overdue
- Mark reminders as done with a single click

### Bucket List
- Track yearly goals and long-term ambitions with a target year and category
- Categories: Personal, Career, Travel, Health, Learning, Finance, Other
- Filter by category or view only achieved goals
- Mark goals as done or undo them

### General
- **Light and Dark mode** — toggle in the top-right corner; preference is saved automatically
- Fully **responsive** — works on desktop, tablet, and mobile
- All data persists in `localStorage` — no data is sent anywhere

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |
| [Vite](https://vitejs.dev) | 6 | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility CSS (base reset + `@theme`) |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animations and transitions |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | State management with `localStorage` persistence |
| [date-fns](https://date-fns.org) | 4 | Date formatting and calendar logic |
| [Lucide React](https://lucide.dev) | 0.487 | Icons |

---

## Prerequisites

You need **Node.js version 18 or higher** installed on your machine.

Check if you already have it:

```bash
node --version
```

If the command is not found or the version is below 18, install Node.js from the official site:

**https://nodejs.org**

Download the **LTS** version (recommended). The installer also includes `npm`.

> **macOS users:** You can also install Node.js via Homebrew:
> ```bash
> brew install node
> ```

---

## Setup and Running Locally

### 1. Clone the repository

```bash
git clone <your-gitlab-repo-url>
cd ToDoApp
```

### 2. Install dependencies

```bash
npm install
```

This downloads all required packages into a `node_modules` folder. It only needs to be done once (or again after pulling changes that update `package.json`).

### 3. Start the development server

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:5173
```

The app hot-reloads automatically whenever you save a file — no need to restart the server.

---

## Other Useful Commands

### Build for production

Compiles and bundles the app into the `dist/` folder:

```bash
npm run build
```

### Preview the production build locally

Serves the contents of `dist/` to verify the build before deploying:

```bash
npm run preview
```

Then open `http://localhost:4173` in your browser.

---

## Project Structure

```
ToDoApp/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── DailyLog.tsx        # Daily task log with day/week view
│   │   ├── Reminders.tsx       # Future task reminders
│   │   ├── BucketList.tsx      # Long-term goals
│   │   └── ui/
│   │       ├── DatePicker.tsx  # Custom calendar popup
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── StatCard.tsx
│   ├── lib/
│   │   ├── utils.ts            # Date helpers, formatting, calculations
│   │   └── theme.ts            # Light/dark mode hook
│   ├── App.tsx                 # Root component, tab navigation, theme toggle
│   ├── store.ts                # Zustand store — all app data and actions
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles and CSS theme variables
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Data Storage

All data (tasks, reminders, bucket list items) is stored in the browser's `localStorage` under the key `daily-planner-v1`. Theme preference is stored under `planner-theme`.

This means:
- Data is **per browser and per device** — it does not sync across machines
- Clearing browser site data will erase all entries
- There is no login, no database, and no backend

---

## Troubleshooting

**`npm install` fails or throws permission errors**
- Make sure you are inside the project folder before running the command
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**Port 5173 is already in use**
- Vite will automatically try the next available port (5174, 5175, etc.) and print the URL in the terminal

**The app opens but shows a blank page**
- Open the browser developer console (F12) and check for errors
- Make sure you ran `npm install` before `npm run dev`

**Node version is too old**
- The minimum required version is Node.js 18. Check with `node --version` and upgrade if needed
