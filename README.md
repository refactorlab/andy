# Andy — PR Handoff Assistant by Drift

> Every PR, handed off like the author wrote it.

Andy is a GitHub Action that turns every pull request into a guided handoff:
architecture diagrams, business-value scoring, focused code suggestions, and a
risk map — all posted as a single bot comment on the PR.

- **Marketplace:** <https://github.com/marketplace/actions/andy-pr-handoff-by-drift>
- **Landing page:** <https://refactorlab.github.io/andy/>
- **License:** MIT
- **Contact:** [schuldi@gmail.com](mailto:schuldi@gmail.com)

## What's in this repo

This repository hosts the public landing page for Andy. It's a small
[Bun](https://bun.com) + [React](https://react.dev) + [Vite](https://vite.dev)
app deployed to GitHub Pages on every push to `main`.

```
public/pr36-github-ui_2.html   # the full example review the landing page links to
src/                            # React landing-page components
.github/workflows/deploy.yml    # GitHub Pages deploy pipeline
```

## Local development

Requires [Bun](https://bun.com) ≥ 1.3.

```sh
bun install
bun run dev        # local dev server
bun run build      # production build into dist/
bun run preview    # preview the production build
```

The dev server serves the example PR review at `/pr36-github-ui_2.html`.

## Deployment

A push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Installs dependencies with `bun install --frozen-lockfile`
2. Type-checks with `tsc -b --noEmit`
3. Builds with `vite build` (base path `/andy/`)
4. Uploads `dist/` as a Pages artifact and deploys to GitHub Pages

The first time you deploy, enable Pages for the repo under
**Settings → Pages → Source → GitHub Actions**.

## License

MIT — see [LICENSE](./LICENSE).
