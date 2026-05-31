/**
 * Build-time SSG step. Runs *after* `vite build`:
 *
 *  1. Spawns a small Vite SSR build of `src/App.tsx`, producing a Node-loadable
 *     ES module. We inherit the main config's React→Preact alias so the SSR
 *     bundle uses the same component tree the client will hydrate.
 *  2. Dynamically imports that bundle, renders it with preact-render-to-string,
 *     and patches `dist/index.html` so `#root` contains the rendered markup.
 *
 * The result: the user receives a page with every visible pixel of the Andy
 * landing already painted in the first HTML packet. The shipped JS only has
 * to *hydrate* the existing DOM, not build it — so first paint becomes a
 * function of HTML parse, not script parse + virtual-DOM diff + insertion.
 *
 * Every `window` / `document` access in the App tree lives inside a
 * `useEffect`; `preact-render-to-string` does not run effects, so those
 * accesses are safely deferred to the browser. Components that need the
 * browser to render anything visible (CommandPalette, EasterEgg, PerfHUD)
 * are wrapped in <Suspense fallback={null}> and contribute nothing to the
 * SSR output until they're hydrated client-side.
 */
import { build as viteBuild } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = resolve(import.meta.dir, '..')

// Emit the SSR bundle inside the project tree (not `/tmp`) so that when the
// bundle does `import "preact"`, the runtime resolves it to the *same*
// node_modules/preact instance that preact-render-to-string is loaded from.
// Mixing two copies causes Preact's hook system to crash (its internal state
// is module-singleton).
const tempDir = resolve(projectRoot, 'node_modules/.cache/andy-ssr')
mkdirSync(tempDir, { recursive: true })

try {
  // 1) Build a Node-loadable SSR bundle of App.tsx.
  await viteBuild({
    root: projectRoot,
    configFile: false,
    base: '/andy/',
    logLevel: 'error',
    // Must mirror the main build's define so the SSR-rendered Footer year
    // matches the hydrating client (both inline the same literal → no mismatch).
    define: {
      __BUILD_YEAR__: new Date().getFullYear(),
    },
    plugins: [react()],
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
        'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
      },
    },
    build: {
      ssr: 'src/App.tsx',
      outDir: tempDir,
      emptyOutDir: true,
      minify: false,
      cssCodeSplit: false,
      target: 'es2022',
      rollupOptions: {
        // Externalize Preact so the bundle and preact-render-to-string share
        // a single runtime instance — otherwise hooks crash on a second copy
        // of the internal state.
        external: (id) => id === 'preact' || id.startsWith('preact/'),
        output: { format: 'es', entryFileNames: 'app.mjs' },
      },
    },
  })

  // 2) Import the built SSR bundle and render it.
  const bundleUrl = pathToFileURL(join(tempDir, 'app.mjs')).href
  const { default: App } = (await import(bundleUrl)) as { default: () => unknown }
  const { renderToString } = await import('preact-render-to-string')
  const { h } = await import('preact')

  const html = renderToString(h(App, null))

  // 3) Patch dist/index.html. The string we replace exists verbatim because
  // index.html's template uses that exact form and our minifier never touches
  // it (no whitespace to collapse, nothing inside).
  const indexPath = resolve(projectRoot, 'dist/index.html')
  const orig = readFileSync(indexPath, 'utf8')
  const patched = orig.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`,
  )
  if (patched === orig) {
    throw new Error('prerender: failed to find <div id="root"></div> — index template changed?')
  }
  writeFileSync(indexPath, patched)
  console.log(`✓ prerendered ${html.length.toLocaleString()} chars into dist/index.html`)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
