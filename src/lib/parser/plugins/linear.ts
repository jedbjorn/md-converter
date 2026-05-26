import type MarkdownIt from 'markdown-it';
import type { ClassName, LinearStep } from '../types';

const STEP_CLASS_RE = /^(.*?)\s*:::class([1-4])\s*$/;

export function parseLinear(src: string): LinearStep[] {
	return src
		.replace(/\n/g, ' ')
		.split('->')
		.map((part) => {
			const trimmed = part.trim();
			if (!trimmed) return null;
			const m = trimmed.match(STEP_CLASS_RE);
			if (m) return { text: m[1].trim(), cls: `class${m[2]}` as ClassName };
			return { text: trimmed };
		})
		.filter((s): s is LinearStep => s !== null);
}

export function linearPlugin(md: MarkdownIt): void {
	md.core.ruler.after('block', 'linear-fence', (state) => {
		for (const t of state.tokens) {
			if (t.type !== 'fence' || t.info.trim() !== 'linear') continue;
			t.type = 'linear_block';
			t.meta = { steps: parseLinear(t.content) };
		}
		return true;
	});
}
