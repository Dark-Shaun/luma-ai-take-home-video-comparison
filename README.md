# Video Experiment Comparison Tool

A frontend-only tool for blind pairwise comparison of video outputs from two experiments (`A` vs `B`).

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Recharts

## Features

- Blind rating per pair: `Left better`, `Tie`, `Right better`
- Keyboard-first flow for speed (`1/2/3`, arrows, space, `?`, `Cmd/Ctrl+Z`)
- Auto-advance mode for high-throughput evaluation
- Synchronized playback and synchronized timeline scrubbing
- Pair navigator sidebar to jump to any pair quickly
- Current-pair undo with toast feedback
- Local session persistence (`localStorage`)
- Summary dashboard with charts, filters, and per-pair table
- Export results as JSON and CSV

## Routes

- `/` -> Dashboard / landing page
- `/evaluate` -> Pairwise rating page
- `/summary` -> Results page

## Data / Video Assets

- Video pairs are matched by filename:
  - `/public/videos/exp_a/segment_000.mp4` ... `segment_035.mp4`
  - `/public/videos/exp_b/segment_000.mp4` ... `segment_035.mp4`
- `exp_b` currently also contains `*.orig.mp4` backup files from codec fixes; these are not used by the app.
- For browser compatibility, three `exp_b` files were normalized with ffmpeg from `yuv444p` to `yuv420p` (`segment_008`, `segment_020`, `segment_032`) so all pairs decode reliably in Chromium/Safari.
- Prompts are shown as `Segment N` because prompt metadata was not provided separately.

## Run Locally

### Prerequisites

- Node.js `20.19+` (or `22.12+`)
- npm 10+

### Install

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

## Code Quality / Validation

Not required to run the app, but recommended before submission.

### Lint

```bash
npm run lint
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Notes

- This project is intentionally frontend-only for take-home scope.
- On Node `20.18.0`, Vite prints an engine warning (`20.19+` recommended), but the app still builds and runs correctly.

## Time Spent

- Total: ~4 hours
- Breakdown:
  - Setup and scaffolding: ~0.7h
  - Core rating flow and state model: ~1.4h
  - UX/power features (hotkeys, sidebar, timeline, undo, persistence): ~1.2h
  - Summary, charts, exports, QA, and polish: ~0.7h

## Deferred Improvements

- Let users customize keyboard shortcuts
- Add an optional single-video inspection mode
- Add backend support for multi-user evaluation jobs and shared results
