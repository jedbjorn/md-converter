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

![md-converter rendering a themed-markdown document in the dossier theme — H2 sections as tabs down the left rail, a numbered section heading, and a bulleted body](https://raw.githubusercontent.com/jedbjorn/md-converter/main/docs/images/what-it-does.png)

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

Swap `<owner>/<repo>` for your repository. The badge can point at **any doc in
your repo**, not just the root `README.md` — change the `blob/main/README.md`
tail to the file's path (e.g. `blob/main/docs/architecture.md`). See
[The ?url= deep link](#the-url-deep-link) for subdirectory, branch, and tag
forms.

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

**The skill writes it for you — doc and badge.** The full authoring contract
ships as a downloadable _skill_ — a single instruction file you hand to an AI
assistant (or follow yourself). It emits a doc that conforms to the contract
**and the matching "Open in md-converter" badge** for that doc (skill §14), so
you get both in one shot:

- **[Download the themed-markdown skill](https://raw.githubusercontent.com/jedbjorn/md-converter/main/docs/spec/themed-markdown.skill.md)**
  (raw `.md`), or browse it [in the repo](docs/spec/themed-markdown.skill.md).
- Or click **Download skill** inside the app (Style sidebar) for the same file.

This README itself follows the contract — that's why its own badge renders.

## The ?url= deep link

```
https://md-converter.designs-os.com/?url=<github-document-url>
```

The `url` param takes the GitHub address of **any single document** — the exact
URL you see in your browser when viewing that file on GitHub. Copy it, paste it
after `?url=`. It is **not** limited to a repo's root `README.md`: a file in a
subdirectory, nested any number of folders deep, or on a different branch, tag,
or commit all work, because the part after the ref is just the file's path in
the repo.

| Where the doc lives  | URL to pass                                                           |
| -------------------- | --------------------------------------------------------------------- |
| Repo root            | `https://github.com/<owner>/<repo>/blob/main/README.md`               |
| A subdirectory       | `https://github.com/<owner>/<repo>/blob/main/docs/architecture.md`    |
| Nested deeper        | `https://github.com/<owner>/<repo>/blob/main/docs/specs/v2/design.md` |
| On another branch    | `https://github.com/<owner>/<repo>/blob/release-2.0/CHANGELOG.md`     |
| At a tag or commit   | `https://github.com/<owner>/<repo>/blob/v1.4.0/README.md`             |
| Raw host (also fine) | `https://raw.githubusercontent.com/<owner>/<repo>/main/docs/spec.md`  |

The general form is `…/blob/<ref>/<path>`, where `<ref>` is a branch, tag, or
commit SHA and `<path>` is the file's location at any subdirectory depth. The
single rule: **link a file, not a folder** — a bare repo or directory page (no
`/blob/<ref>/<file>`) is refused.

A `github.com` `/blob/` or `/raw/` link is normalized to the raw host before
fetching. The app is a static site, so the fetch runs in your browser against
`raw.githubusercontent.com` (which is CORS-permissive) — there is no server leg
and no SSRF surface. Non-GitHub hosts, non-`https` URLs, folder/repo pages, and
documents that don't follow the themed-markdown syntax are refused; for the
last case, rewrite the doc against the contract (download the skill above).

## Share what you're viewing

Every rendered doc has a shareable link — no account, no server, no auth.

- **Embedded pages keep their link.** Open a doc via `?url=` and the address bar
  stays that link — copy it from the bar or your browser's share button. Reload
  re-fetches, so it always reflects the live source on GitHub.
- **"Copy share link" works for any doc.** The button in the Style sidebar
  copies a link to whatever is on screen. A GitHub-sourced doc copies as the
  tidy `?url=` form; an uploaded or pasted doc is packed into a self-contained
  `?c=` link (gzip + base64url) that carries the whole document in the URL — so
  it opens for anyone, even a file that never left your machine. Very large docs
  exceed a practical URL length; host those on public GitHub and share the
  `?url=` form instead.

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
