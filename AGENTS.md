# LeoTreino — Agent Instructions

## Project

Single-file PWA workout tracker. No build step, no dependencies, no server. Open `index.html` in a browser.

## Key Files

- `index.html` — Entire app (HTML + CSS + JS inline, ~1400 lines). PWA with embedded `TREINOS_DATA`.
- `treinos.json` — Source of truth for exercises. Data is **duplicated** inside `index.html` as `TREINOS_DATA`. Keep them in sync.
- `dieta.html` / `remedios.html` — Static companion pages.
- `CLAUDE.md` — Workout schedule, architecture decisions, feature list. Read first.

## Critical Conventions

- **`TREINOS_DATA` is embedded in `index.html`** — do NOT add a fetch() for `treinos.json`. Offline-first design.
- **Keys use Portuguese**: `TERÇA-FEIRA`, `QUARTA-FEIRA`, `QUINTA-FEIRA`, `SABADO` (note: SABADO has no accent). Must match `diasSemana` array.
- **All state is localStorage**: weights, theme, PRs, history, timer settings. No backend.
- **Floating timer** uses `#floating-timer` element — fixed position, does not push content.
- **Backup file** `index+bkp2903.html` — do not modify, reference only if needed.

## Commands

No build/test/lint commands. Verify by opening `index.html` in a browser.

## When Editing

- Always update BOTH `treinos.json` and the embedded `TREINOS_DATA` in `index.html` when changing exercises.
- Preserve Portuguese encoding (UTF-8) — accented characters are intentional.
- The file is large (~1400 lines). Use grep/search before reading fully.
