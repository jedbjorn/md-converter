---
title: md-converter
tags: [markdown, themes, svelte, cloudflare]
project: md-converter
purpose: Render themed Markdown into styled, shareable HTML
---

# md-converter

[![Open in md-converter](https://img.shields.io/badge/Open%20in-md--converter-6b46c1?style=flat-square)](https://md-converter.designs-os.com/?url=https://github.com/jedbjorn/md-converter/blob/main/README.md)

A static web app that renders **themed Markdown** into styled, shareable HTML.
Pick a theme, tweak the colors and type, then share it as a link or export
self-contained HTML. No server, no account — it runs in the browser and deploys
as static assets on Cloudflare. Live at
**[md-converter.designs-os.com](https://md-converter.designs-os.com)**.

> The badge above opens this very README in the app — md-converter rendering
> itself. It works because this file follows the themed-markdown syntax. A plain
> Markdown file without that syntax will **not** render — see
> **Embed your own README with a badge** below for the contract and the skill
> that writes it.

## What it does

- **Themed rendering** — nine built-in themes (editorial, risograph, bauhaus,
  terminal, dossier, almanac, manuscript, neongrid, atelier), each a full
  color + typography system you can override live from the Style sidebar.
- **Themed-Markdown contract** — YAML frontmatter, H2 tabs, callouts, stat
  cards, mermaid + linear diagrams, and `class1`–`class4` accents.
- **Three ways in** — upload a `.md` file, ride a doc inline in the URL
  (`?c=`, gzip + base64url), or point at a live document on GitHub (`?url=`).
- **Export** — download standalone HTML or a shareable config.

## Embed your own README with a badge

Because the app reads any public GitHub document, you can drop a one-click
"Open in md-converter" badge into your own project. Readers click it and your
doc renders, themed, in the app:

```markdown
[![Open in md-converter](https://img.shields.io/badge/Open%20in-md--converter-6b46c1?style=flat-square)](https://md-converter.designs-os.com/?url=https://github.com/<owner>/<repo>/blob/main/README.md)
```

Swap `<owner>/<repo>` for your repository.

**One requirement: the document must follow the themed-markdown syntax.**
md-converter does **not** render arbitrary Markdown — a file that doesn't
conform is refused ("Could not load the document from this link"). A
conforming doc must:

- start with a YAML frontmatter block carrying a `title` and a `tags` array;
- put all content under `##` (H2) sections — each H2 becomes a tab, and any
  preamble before the first H2 is dropped;
- use only the contract's constructs (callouts, stat cards, linear/mermaid
  diagrams, `class1`–`class4`) and never hard-code colors, fonts, or themes.

| Field                          | Status   |
| ------------------------------ | -------- |
| `title`                        | required |
| `tags`                         | required |
| `date` / `project` / `purpose` | optional |

**The skill writes it for you.** The full authoring contract ships as a
downloadable _skill_ — a single instruction file you hand to an AI assistant
(or follow yourself) so it emits docs that conform to the contract:

- **[Download the themed-markdown skill](https://raw.githubusercontent.com/jedbjorn/md-converter/main/docs/spec/themed-markdown.skill.md)**
  (raw `.md`), or browse it [in the repo](docs/spec/themed-markdown.skill.md).
- Or click **Download skill** inside the app (Style sidebar) for the same file.

This README itself follows the contract — that's why its own badge renders.

## The ?url= deep link

```
https://md-converter.designs-os.com/?url=<github-document-url>
```

The `url` param accepts **any public GitHub document**, in either shape:

| Shape                       | Example                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `github.com` blob/raw link  | `https://github.com/<owner>/<repo>/blob/main/<doc>.md`           |
| `raw.githubusercontent.com` | `https://raw.githubusercontent.com/<owner>/<repo>/main/<doc>.md` |

A `github.com` `/blob/` or `/raw/` link is normalized to the raw host before
fetching. The app is a static site, so the fetch runs in your browser against
`raw.githubusercontent.com` (which is CORS-permissive) — there is no server leg
and no SSRF surface. Non-GitHub hosts, non-`https` URLs, bare repo pages, and
documents that don't follow the themed-markdown syntax are refused; for the
last case, rewrite the doc against the contract (download the skill above).

## Develop

```
npm install
npm run dev        # dev server
npm test           # vitest
npm run build      # static build → ./build
npm run preview    # preview the production build
```

Deploys as Cloudflare static assets — see [`docs/deploy.md`](docs/deploy.md).
Stack: SvelteKit (static adapter), markdown-it, mermaid, Cloudflare Workers
assets.

## License

[MIT](LICENSE) © 2026 jedbjorn.
