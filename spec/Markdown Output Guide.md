# Markdown Output Guide

Output all content using this markdown format.

## Frontmatter
Begin every document with YAML frontmatter:

```
---
title: Document Title
tags: [tag1, tag2]
date: YYYY-MM-DD
project: Project Name
purpose: Brief description
---
```

`title` and `tags` are required. `date`, `project`, and `purpose` are optional metadata fields.

## Structure
- H1: document title, once at top
- H2: major sections
- H3: subsections within H2

## Inline formatting
- **bold** for strong emphasis
- *italic* for soft emphasis
- ~~strikethrough~~ for removed or deprecated content
- `inline code` for technical terms, filenames, UI labels
- [link text](https://url.com) for links

## Lists
- Unordered with `-`
- Ordered with `1.`
- Task lists with `- [ ]` and `- [x]`

## Tables

| Column A | Column B |
|----------|----------|
| Cell     | Cell     |

## Images

![alt text](https://url.com/image.png)
*Caption text*

Use descriptive alt text. URLs only. Add an optional caption on the next line in italics.

## Code blocks

```language
code here
```

## Color classes

Four classes are available: `class1`, `class2`, `class3`, `class4`. Use them to color callouts, stat cards, mermaid nodes, and linear diagram steps. Choose which class fits each piece of content based on context.

## Callouts

> [!class1]
> Content

Replace `class1` with `class2`, `class3`, or `class4` as needed.

## Stat cards

Group one or more stat cards in a single block:

```stats
:::class1
value: 87%
label: User satisfaction
description: Up 12% from last quarter
:::class2
value: 1.2M
label: Active users
:::class3
value: 4.8
label: App rating
```

`value` and `label` are required. `description` is optional.

## Mermaid diagrams

Apply classes to nodes with `:::classN`:

```mermaid
graph LR
  A[Start]:::class1 --> B[Middle]:::class2 --> C[End]:::class3
```

## Linear diagrams and timelines

Apply classes to steps with `:::classN`:

```linear
Step 1 :::class1 -> Step 2 :::class2 -> Step 3 :::class3
```

## Do not use
H4-H6, blockquotes, footnotes, raw HTML.
