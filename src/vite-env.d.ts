/// <reference types="vite/client" />

// Injected at build time via Vite `define` (vite.config.ts + scripts/prerender.ts):
// a literal year baked identically into the client + SSR bundles, so the Footer
// copyright never triggers a hydration mismatch across a year boundary.
declare const __BUILD_YEAR__: number
