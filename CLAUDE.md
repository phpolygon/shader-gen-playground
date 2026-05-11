# shader-gen-playground — package brief

WebGL playground for shader effects. See `../shader-generator/CLAUDE.md` for the canonical project brief.

## Rules for this package

- **Bundle size is part of the product.** First-paint speed is the "30 seconds from tweet to shader" promise. Every new dependency needs justification.
- **Three.js is allowed.** Anything heavier (React, Vue, UI kit) is not — confirm with Hendrik first.
- **UI is vanilla Web Components.** No framework. Components live in `src/ui/`.
- **Effect specs are read-only.** Mutate parameter values, never the spec.
- **The URL hash is the single source of truth for shared state.** When parameter values change, write through `share/hash-sync.ts`.
- **Visual review is human-only.** Default parameter values, preview camera angles, colors — surface to Hendrik. Do not pick "looks fine" defaults alone.

## Layout

- `src/main.ts` — bootstrap
- `src/preview/scene.ts` — three.js renderer, sphere mesh, swappable ShaderMaterial
- `src/ui/parameter-panel.ts` — `<parameter-panel>` Web Component
- `src/share/hash-sync.ts` — read/write URL hash through core's codec

## When working here

- New UI component: vanilla Web Component, define in `src/ui/`, register from `main.ts`.
- New preview behavior (geometry swap, post-processing): isolate in `src/preview/`, keep `scene.ts` orchestrating.
- Default parameter values, colors, camera angles → ask Hendrik.
- New dependency → ask Hendrik.
