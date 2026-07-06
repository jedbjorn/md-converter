import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type { ClassName, LinearStep, StatCard } from '../parser/types';

const md = new MarkdownIt({ html: false, linkify: true });
const esc = md.utils.escapeHtml;

md.renderer.rules.callout_open = (tokens, idx) => {
	const cls = (tokens[idx].meta as { cls: ClassName }).cls;
	return `<div class="callout callout-${cls}">`;
};
md.renderer.rules.callout_close = () => '</div>';

md.renderer.rules.stats_block = (tokens, idx) => {
	const cards = (tokens[idx].meta as { cards: StatCard[] }).cards;
	const inner = cards
		.map((c) => {
			const desc = c.description ? `<div class="stat-desc">${esc(c.description)}</div>` : '';
			return `<div class="stat-card ${c.cls}"><div class="stat-value">${esc(c.value)}</div><div class="stat-label">${esc(c.label)}</div>${desc}</div>`;
		})
		.join('');
	return `<div class="stats">${inner}</div>\n`;
};

md.renderer.rules.linear_block = (tokens, idx) => {
	const steps = (tokens[idx].meta as { steps: LinearStep[] }).steps;
	const inner = steps
		.map((s) => `<div class="linear-step${s.cls ? ' ' + s.cls : ''}">${esc(s.text)}</div>`)
		.join('');
	return `<div class="linear">${inner}</div>\n`;
};

md.renderer.rules.mermaid_block = (tokens, idx) => {
	const source = (tokens[idx].meta as { source: string }).source;
	// Source must be raw (escape would corrupt mermaid syntax); mermaid.js parses
	// its own input. The wrapper class is .mermaid; .mermaid-wrap provides theme
	// padding/background. Both classes match the four reference templates.
	return `<div class="mermaid-wrap"><div class="mermaid">${esc(source)}</div></div>\n`;
};

md.renderer.rules.video_block = (tokens, idx) => {
	const src = (tokens[idx].meta as { src: string }).src;
	// GitHub user-attachments URLs carry no extension; the browser sniffs the
	// content-type from the response, so `src` on the element is enough (a typed
	// <source> would force us to guess). controls + playsinline + metadata preload
	// match how the source README renders on GitHub.
	return `<div class="video-wrap"><video class="md-video" src="${esc(src)}" controls playsinline preload="metadata"></video></div>\n`;
};

// Block images become figures. markdown-it emits an image-only paragraph as
// `<p><img></p>`, but every theme ships `figure` / `figure img` / `figcaption`
// styling (frames, borders, filters, captions) that expects `<figure>`. Wrap
// the two block-image shapes — a lone image, and a lone linked image (GitHub's
// clickable-screenshot idiom) — and emit the image's title (`![alt](src
// "title")`) as its caption. Paragraphs mixing images with text stay
// paragraphs, so badge rows and inline icons are untouched.
function soleImage(inline: Token | undefined): Token | null {
	if (inline?.type !== 'inline' || !inline.children) return null;
	const kids = inline.children.filter((c) => !(c.type === 'text' && c.content.trim() === ''));
	if (kids.length === 1 && kids[0].type === 'image') return kids[0];
	if (
		kids.length === 3 &&
		kids[0].type === 'link_open' &&
		kids[1].type === 'image' &&
		kids[2].type === 'link_close'
	) {
		return kids[1];
	}
	return null;
}

md.renderer.rules.paragraph_open = (tokens, idx, options, env, self) => {
	// hidden = tight-list paragraph, which renders no wrapper at all — an image
	// inside a tight list item stays a bare <img> in its <li>.
	if (!tokens[idx].hidden && soleImage(tokens[idx + 1])) {
		return '<figure class="md-figure">';
	}
	return self.renderToken(tokens, idx, options);
};

md.renderer.rules.paragraph_close = (tokens, idx, options, env, self) => {
	if (!tokens[idx].hidden) {
		const img = soleImage(tokens[idx - 1]);
		if (img) {
			const title = img.attrGet('title');
			return `${title ? `<figcaption>${esc(title)}</figcaption>` : ''}</figure>\n`;
		}
	}
	return self.renderToken(tokens, idx, options);
};

// Wrap tables in a horizontal-scroll container so a wide table scrolls within
// its own box instead of widening the whole page (which would force a page-level
// horizontal scrollbar alongside the vertical one). The <table> keeps its normal
// display:table + width:100%, so narrow tables look identical on desktop.
md.renderer.rules.table_open = () => '<div class="table-scroll"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';

// Task lists: when bullet_list_open carries meta.taskList, emit the templates'
// span-based checkbox markup instead of the standard <ul>/<li>.
md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
	if ((tokens[idx].meta as { taskList?: boolean } | null)?.taskList) {
		return '<ul class="task-list">\n';
	}
	return self.renderToken(tokens, idx, options);
};

md.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
	const meta = tokens[idx].meta as { task?: boolean; done?: boolean } | null;
	if (meta?.task) {
		const cls = meta.done ? ' class="done"' : '';
		const checkCls = meta.done ? 'task-checkbox done' : 'task-checkbox';
		return `<li${cls}><span class="${checkCls}"></span><span${cls}>`;
	}
	return self.renderToken(tokens, idx, options);
};

md.renderer.rules.list_item_close = (tokens, idx, options, env, self) => {
	// Find the matching open by walking backward — markdown-it pairs by nesting
	let depth = 0;
	for (let j = idx; j >= 0; j--) {
		const t = tokens[j];
		if (t.type === 'list_item_close') depth++;
		else if (t.type === 'list_item_open') {
			depth--;
			if (depth === 0) {
				const meta = t.meta as { task?: boolean } | null;
				if (meta?.task) return '</span></li>\n';
				break;
			}
		}
	}
	return self.renderToken(tokens, idx, options);
};

/**
 * Render a sub-stream of markdown-it tokens to HTML, applying our custom
 * rules. Used per-tab on the IR's token arrays.
 */
export function renderTokens(tokens: Token[]): string {
	return md.renderer.render(tokens, md.options, {});
}
