# nn-architectures

A static website of interactive neural-network architecture diagrams, built with [nn-diagram](https://github.com/yanexr/nn-diagram) (`@nn-diagram/*` from npm).

## Where things are

```
content/models/<lab>/<model>/   model.json, README.md, *.diagram.jsx and media: the site's data
src/app/                        Next.js pages: gallery, /<lab>/<model>, /editor, /content/* (raw files)
src/lib/models.ts               reads the content folder
src/lib/ml-library/             the editor's ML shape sections and media library
public/media/                   media used by the library
.agents/skills/                 nn-diagram (format; update with `pnpm nn-diagram skill`) and nn-architectures (ML conventions, adding a model)
```

To draw or edit a diagram, or add a model, read the two skills first.

## Commands

```sh
pnpm dev                       # http://localhost:3000 (editor at /editor)
pnpm nn-diagram check content  # validate diagrams; `render <file>` to look at one
pnpm build                     # static site in out/ (served under /nn-architectures)
pnpm lint && pnpm typecheck
```

## Notes

- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before changing framework code.
- The site is a static export with a base path. Raw URLs (content files, media, plain `<a href>`) need `BASE_PATH` from `src/lib/base-path.ts`; `next/link` and the router add it themselves.
- Pushing to `main` deploys via `.github/workflows/deploy.yml`.
