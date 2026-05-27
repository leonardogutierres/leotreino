# LeoTreino — Agent Instructions

## Project

React + Vite PWA workout tracker with Express/PostgreSQL backend. Deployed on EasyPanel (nginx:alpine serving from project root).

## Key Files

- `src/data.js` — Workouts data (`WORKOUTS`), colors (`COLORS`), exercise videos (`VIDEOS`), series parser.
- `src/App.jsx` — Main app with workout grid, cardio tracker, bottom nav.
- `src/components/WorkoutView.jsx` — Individual workout page, global timer state, expand/collapse.
- `src/components/ExerciseBlock.jsx` — Exercise expand/collapse, series completion, weight persistence (API + localStorage).
- `src/components/SeriesCard.jsx` — Individual series card with reps/peso inputs and completion button.
- `src/components/RestTimer.jsx` — Floating rest timer, timestamp-based (survives backgrounding on mobile), auto-dismisses after 4s.
- `src/api.js` — HTTP client for Express API (`/api/pesos`, `/api/pr`, `/api/timer`, `/api/treinos/historico`).
- `server.js` — Express server: serves `dist/` as static, PostgreSQL API endpoints, auto-creates tables on start.
- `package.json` — `build` script: restores Vite template from `.bak`, builds, copies `dist/` → root (for nginx).
- `index.html` — **Production entry point** (copied from `dist/` by build script). Served by nginx.
- `index.html.bak` — **Vite template** (`src="/src/main.jsx"`). Build restores from this. Never modify manually.
- `treinos.json` — Legacy data file (not used by React app, `WORKOUTS` in `data.js` is the source of truth).
- `dieta.html` / `remedios.html` — Static companion pages.
- `index+bkp2903.html.bak` — Legacy single-file PWA backup. Do not modify.

## Critical Conventions

- **Never modify `index.html` directly** — it's overwritten by build. Edit `index.html.bak` for HTML template changes.
- **Workout keys**: `A`, `B`, `C`, `D` (maps to `WORKOUTS` in `data.js`).
- **Day names**: `TERÇA-FEIRA`, `QUARTA-FEIRA`, `QUINTA-FEIRA`, `SÁBADO` (with accent on SÁBADO in data.js).
- **Database connection** via `.env` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- **Offline-first**: localStorage used as fallback for weights (`leotreino-weights`) and cardio tracker.
- **Timer**: Single global timer in `WorkoutView`, auto-closes 4s after done. Uses `Date.now()` + `requestAnimationFrame` — works in background on mobile.
- **Build pipeline**: `npm run build` → restores template → Vite build → copies `dist/` to root (index.html + assets/).
- **Deployment**: EasyPanel uses `nginx:alpine`, serves from project root. Files hot-copied via `docker cp`.

## Commands

```bash
npm run build    # Full build pipeline (restore template → Vite build → copy to root)
npm run dev      # Vite dev server on port 3000
npm run start    # Express server (serves dist/ + API)
```

## When Editing

- Edit source in `src/` only — never edit generated files in `dist/` or `assets/`.
- After changes, run `npm run build` and copy to running containers:
  ```bash
  docker ps --format '{{.Names}}' | grep leotreino | while read c; do
    docker cp index.html "$c:/usr/share/nginx/html/index.html"
    docker cp assets/ "$c:/usr/share/nginx/html/assets/"
  done
  ```
- If changing `index.html.bak` (head/meta/scripts), update both `.bak` and ensure build copies correctly.
- To add/change exercises, edit `WORKOUTS` in `src/data.js`.
