# @phpolygon/shader-gen-playground

Browser playground for previewing and exporting shader effects from [`@phpolygon/shader-gen-core`](../shader-gen-core).

## Prerequisites

`shader-gen-core` must live as a sibling directory at `../shader-gen-core`. Vite resolves the dependency via alias to its source — no npm publish required.

```
~/Projekte/
├── shader-gen-core/
└── shader-gen-playground/   ← you are here
```

## Scripts

```sh
npm install
npm run dev         # vite dev server, hot reload across core + playground
npm run build
npm run typecheck
```

## Deployment

GitHub Actions builds on push to `main`, deploys to GitHub Pages. The workflow checks out `phpolygon/shader-gen-core` alongside this repo so the alias resolves in CI.

See `../shader-generator/CLAUDE.md` for the full project brief.
