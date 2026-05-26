import type MarkdownIt from 'markdown-it';

export function mermaidPlugin(md: MarkdownIt): void {
	md.core.ruler.after('block', 'mermaid-fence', (state) => {
		for (const t of state.tokens) {
			if (t.type !== 'fence' || t.info.trim() !== 'mermaid') continue;
			t.type = 'mermaid_block';
			t.meta = { source: t.content };
		}
		return true;
	});
}
