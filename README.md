# md-converter

[![Open in md-converter](https://img.shields.io/badge/Open%20in-md--converter-6b46c1?style=flat-square)](https://md-converter.designs-os.com/?url=https://github.com/jedbjorn/md-converter/blob/main/README.md)

A static web app that renders **themed Markdown** into styled, shareable HTML.
Paste or upload a `.md` file, pick a theme, tweak the colors and type, then
share it as a link or export self-contained HTML. No server, no account — the
whole thing runs in the browser and deploys as static assets on Cloudflare.

Live at **[md-converter.designs-os.com](https://md-converter.designs-os.com)**.

> The badge above opens this very README inside the app — md-converter
> rendering itself. Click it to see what your own docs would look like.

## What it does

- **Themed rendering** — nine built-in themes (editorial, risograph, bauhaus,
  terminal, dossier, almanac, manuscript, neongrid, atelier), each a full
  color + typography system you can override live from the Style sidebar.
- **Themed-Markdown contract** — YAML frontmatter, H2 tabs, callouts, stat
  cards, mermaid + linear diagrams, and `class1`–`class4` accents. See the
  spec under [`docs/spec/`](docs/spec/), or download the authoring skill from
  the in-app menu.
- **Three ways in** — upload a `.md` file, ride a doc inline in the URL
  (`?c=`, gzip + base64url), or point at a live document on GitHub (`?url=`).
- **Export** — download standalone HTML or a shareable config.

## Embed your own README with a badge

Because the app reads any public GitHub document, you can drop a one-click
"Open in md-converter" badge into your own project's README. Readers click it
and your doc renders, themed, in the app:

```markdown
[![Open in md-converter](https://img.shields.io/badge/Open%20in-md--converter-6b46c1?style=flat-square)](https://md-converter.designs-os.com/?url=https://github.com/<owner>/<repo>/blob/main/README.md)
```

Swap `<owner>/<repo>` for your repository. That's the integration — no setup,
no key, nothing to install.

## The `?url=` deep link

```
https://md-converter.designs-os.com/?url=<github-document-url>
```

The `url` param accepts **any public GitHub document**, in either shape:

| Shape                       | Example                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `github.com` blob/raw link  | `https://github.com/<owner>/<repo>/blob/main/README.md`           |
| `raw.githubusercontent.com` | `https://raw.githubusercontent.com/<owner>/<repo>/main/README.md` |

A `github.com` `/blob/` or `/raw/` link is normalized to the raw host before
fetching. The app is a static site, so the fetch runs in your browser against
`raw.githubusercontent.com` (which is CORS-permissive) — there is no server
leg and no SSRF surface. Non-GitHub hosts, non-`https` URLs, and bare repo
pages (no file) are refused; for those, upload the `.md` directly in the
Style sidebar.

## Develop

```sh
npm install
npm run dev        # dev server
npm test           # vitest
npm run build      # static build → ./build
npm run preview    # preview the production build
```

Deploys as Cloudflare static assets — see [`docs/deploy.md`](docs/deploy.md).

## Stack

SvelteKit (static adapter) · markdown-it · mermaid · Cloudflare Workers assets.

## License

[MIT](LICENSE) © 2026 jedbjorn.
