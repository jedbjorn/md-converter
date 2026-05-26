import { describe, it, expect } from 'vitest';
import { parse } from './index';
import { parseStats } from './plugins/stats';
import { parseLinear } from './plugins/linear';
import { extractFrontmatter } from './frontmatter';
import { slugify } from './tabs';

const fixture = (parts: TemplateStringsArray, ...values: unknown[]): string =>
	String.raw({ raw: parts }, ...values).replace(/\n\t+/g, '\n');

describe('extractFrontmatter', () => {
	it('extracts required fields', () => {
		const src = `---\ntitle: My Doc\ntags: [a, b]\n---\n\nhello`;
		const { frontmatter, body } = extractFrontmatter(src);
		expect(frontmatter.title).toBe('My Doc');
		expect(frontmatter.tags).toEqual(['a', 'b']);
		expect(body.trim()).toBe('hello');
	});

	it('extracts optional fields', () => {
		const src = `---\ntitle: T\ntags: []\ndate: 2026-05-25\nproject: P\npurpose: X\n---\n`;
		const { frontmatter } = extractFrontmatter(src);
		expect(frontmatter.date).toBe('2026-05-25');
		expect(frontmatter.project).toBe('P');
		expect(frontmatter.purpose).toBe('X');
	});

	it('throws when title is missing', () => {
		const src = `---\ntags: []\n---\n`;
		expect(() => extractFrontmatter(src)).toThrow(/title/);
	});

	it('throws when tags is not an array', () => {
		const src = `---\ntitle: T\ntags: nope\n---\n`;
		expect(() => extractFrontmatter(src)).toThrow(/tags/);
	});
});

describe('slugify', () => {
	it('lowercases and dasherizes', () => {
		expect(slugify('Hello World!')).toBe('hello-world');
		expect(slugify('  Two   Spaces  ')).toBe('two-spaces');
		expect(slugify('')).toBe('tab');
		expect(slugify('!!')).toBe('tab');
	});
});

describe('parseStats', () => {
	it('parses multiple cards with optional description', () => {
		const cards = parseStats(
			fixture`
			:::class1
			value: 87%
			label: User satisfaction
			description: Up 12% from last quarter
			:::class2
			value: 1.2M
			label: Active users
			`
		);
		expect(cards).toHaveLength(2);
		expect(cards[0]).toEqual({
			cls: 'class1',
			value: '87%',
			label: 'User satisfaction',
			description: 'Up 12% from last quarter'
		});
		expect(cards[1]).toEqual({ cls: 'class2', value: '1.2M', label: 'Active users' });
	});

	it('returns empty array for no class headers', () => {
		expect(parseStats('value: 100\nlabel: foo')).toEqual([]);
	});
});

describe('parseLinear', () => {
	it('parses steps with mixed class tags', () => {
		const steps = parseLinear('Step 1 :::class1 -> Step 2 :::class2 -> Step 3');
		expect(steps).toEqual([
			{ text: 'Step 1', cls: 'class1' },
			{ text: 'Step 2', cls: 'class2' },
			{ text: 'Step 3' }
		]);
	});

	it('trims and ignores empty segments', () => {
		expect(parseLinear('  A  ->  B  ')).toEqual([{ text: 'A' }, { text: 'B' }]);
	});
});

describe('parse: full pipeline', () => {
	const baseFm = `---\ntitle: Demo\ntags: [t]\n---\n\n`;

	it('groups content under H2 boundaries', () => {
		const src =
			baseFm +
			`# Header\n\n## First\n\nintro paragraph\n\n### sub\n\nmore text\n\n## Second\n\nsecond body\n`;
		const ir = parse(src);
		expect(ir.title).toBe('Header');
		expect(ir.tabs).toHaveLength(2);
		expect(ir.tabs[0].heading).toBe('First');
		expect(ir.tabs[0].slug).toBe('first');
		expect(ir.tabs[1].heading).toBe('Second');
		// First tab should contain its paragraph + H3 + paragraph (no H1, no H2)
		const types0 = ir.tabs[0].tokens.map((t) => t.type);
		expect(types0).toContain('paragraph_open');
		const headings = ir.tabs[0].tokens.filter((t) => t.type === 'heading_open');
		expect(headings).toHaveLength(1);
		expect(headings[0].tag).toBe('h3');
	});

	it('falls back to frontmatter title when no H1', () => {
		const src = baseFm + `## Only Section\n\nbody`;
		const ir = parse(src);
		expect(ir.title).toBe('Demo');
		expect(ir.tabs).toHaveLength(1);
	});

	it('creates a single default tab when no H2', () => {
		const src = baseFm + `# Solo\n\nbody text\n\n### sub\n\nmore`;
		const ir = parse(src);
		expect(ir.tabs).toHaveLength(1);
		expect(ir.tabs[0].slug).toBe('main');
		expect(ir.tabs[0].tokens.length).toBeGreaterThan(0);
	});

	it('drops preamble when H2s exist', () => {
		const src = baseFm + `# Title\n\norphan paragraph\n\n## First\n\nin tab\n`;
		const ir = parse(src);
		// The "orphan paragraph" should NOT appear in any tab
		const allText = ir.tabs.flatMap((t) =>
			t.tokens
				.filter((tok) => tok.type === 'inline')
				.map((tok) => tok.content)
		);
		expect(allText.some((s) => s.includes('orphan'))).toBe(false);
		expect(allText.some((s) => s.includes('in tab'))).toBe(true);
	});

	it('converts callouts to callout_open/close with class meta', () => {
		const src = baseFm + `## Section\n\n> [!class3]\n> A callout body\n\nnormal text\n`;
		const ir = parse(src);
		const tokens = ir.tabs[0].tokens;
		const callout = tokens.find((t) => t.type === 'callout_open');
		expect(callout).toBeDefined();
		expect(callout?.meta).toEqual({ cls: 'class3' });
		expect(tokens.find((t) => t.type === 'callout_close')).toBeDefined();
		// The marker should be stripped from the inline content
		const inline = tokens.find((t) => t.type === 'inline');
		expect(inline?.content).not.toMatch(/\[!class3\]/);
		expect(inline?.content).toContain('A callout body');
	});

	it('converts stats fences to stats_block with parsed cards', () => {
		const src =
			baseFm +
			'## S\n\n```stats\n:::class1\nvalue: 42\nlabel: foo\n:::class2\nvalue: 7\nlabel: bar\n```\n';
		const ir = parse(src);
		const block = ir.tabs[0].tokens.find((t) => t.type === 'stats_block');
		expect(block).toBeDefined();
		const cards = (block?.meta as { cards: unknown[] }).cards;
		expect(cards).toHaveLength(2);
	});

	it('converts linear fences to linear_block with parsed steps', () => {
		const src = baseFm + '## S\n\n```linear\nA :::class1 -> B :::class2\n```\n';
		const ir = parse(src);
		const block = ir.tabs[0].tokens.find((t) => t.type === 'linear_block');
		expect(block).toBeDefined();
		expect((block?.meta as { steps: unknown[] }).steps).toHaveLength(2);
	});

	it('converts mermaid fences to mermaid_block carrying source', () => {
		const src = baseFm + '## S\n\n```mermaid\ngraph LR\n  A --> B\n```\n';
		const ir = parse(src);
		const block = ir.tabs[0].tokens.find((t) => t.type === 'mermaid_block');
		expect(block).toBeDefined();
		expect((block?.meta as { source: string }).source).toMatch(/graph LR/);
	});

	it('leaves non-custom fenced code blocks alone', () => {
		const src = baseFm + '## S\n\n```ts\nconst x = 1;\n```\n';
		const ir = parse(src);
		const fences = ir.tabs[0].tokens.filter((t) => t.type === 'fence');
		expect(fences).toHaveLength(1);
		expect(fences[0].info.trim()).toBe('ts');
	});
});
