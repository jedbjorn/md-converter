import type MarkdownIt from 'markdown-it';
import type { ClassName, StatCard } from '../types';

const CLASS_HEADER_RE = /^:::class([1-4])\s*$/;
const KV_RE = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/;

export function parseStats(src: string): StatCard[] {
	const cards: StatCard[] = [];
	let current: { cls: ClassName; fields: Record<string, string> } | null = null;

	const flush = () => {
		if (!current) return;
		cards.push({
			cls: current.cls,
			value: current.fields.value ?? '',
			label: current.fields.label ?? '',
			...(current.fields.description ? { description: current.fields.description } : {})
		});
		current = null;
	};

	for (const rawLine of src.split('\n')) {
		const line = rawLine.trim();
		if (!line) continue;
		const header = line.match(CLASS_HEADER_RE);
		if (header) {
			flush();
			current = { cls: `class${header[1]}` as ClassName, fields: {} };
			continue;
		}
		if (!current) continue;
		const kv = line.match(KV_RE);
		if (kv) current.fields[kv[1]] = kv[2];
	}
	flush();
	return cards;
}

export function statsPlugin(md: MarkdownIt): void {
	md.core.ruler.after('block', 'stats-fence', (state) => {
		for (const t of state.tokens) {
			if (t.type !== 'fence' || t.info.trim() !== 'stats') continue;
			t.type = 'stats_block';
			t.meta = { cards: parseStats(t.content) };
		}
		return true;
	});
}
