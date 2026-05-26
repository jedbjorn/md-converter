import type MarkdownIt from 'markdown-it';
import type { ClassName } from '../types';

const CALLOUT_RE = /^\[!class([1-4])\]\s*\n?/;

export function calloutsPlugin(md: MarkdownIt): void {
	md.core.ruler.after('block', 'callouts', (state) => {
		const tokens = state.tokens;
		for (let i = 0; i < tokens.length; i++) {
			const open = tokens[i];
			if (open.type !== 'blockquote_open') continue;

			const para = tokens[i + 1];
			const inline = tokens[i + 2];
			if (para?.type !== 'paragraph_open' || inline?.type !== 'inline') continue;

			const m = inline.content.match(CALLOUT_RE);
			if (!m) continue;

			// Find matching blockquote_close at same depth
			let depth = 0;
			let closeIdx = -1;
			for (let j = i; j < tokens.length; j++) {
				if (tokens[j].type === 'blockquote_open') depth++;
				else if (tokens[j].type === 'blockquote_close') {
					depth--;
					if (depth === 0) {
						closeIdx = j;
						break;
					}
				}
			}
			if (closeIdx === -1) continue;

			const cls = `class${m[1]}` as ClassName;
			open.type = 'callout_open';
			open.tag = 'div';
			open.meta = { cls };
			tokens[closeIdx].type = 'callout_close';
			tokens[closeIdx].tag = 'div';

			// Strip the [!classN] marker from inline content + first text child
			inline.content = inline.content.slice(m[0].length);
			if (inline.children) {
				while (inline.children.length > 0) {
					const child = inline.children[0];
					if (child.type === 'text' && CALLOUT_RE.test(child.content)) {
						child.content = child.content.replace(CALLOUT_RE, '');
						if (child.content.length === 0) inline.children.shift();
						break;
					}
					if (child.type === 'softbreak' || child.type === 'hardbreak') {
						inline.children.shift();
						continue;
					}
					break;
				}
			}
		}
		return true;
	});
}
