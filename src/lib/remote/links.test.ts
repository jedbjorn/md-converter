import { describe, it, expect } from 'vitest';
import { parse } from '../parser';
import { renderTokens } from '../renderer';
import { rewriteRelativeLinks, resolveDocLink, rawToBlob } from './links';

const BASE = 'https://raw.githubusercontent.com/jedbjorn/subfloor/main/README.md';
const DOCS_BASE = 'https://raw.githubusercontent.com/jedbjorn/subfloor/main/docs/install.md';

const FM = '---\ntitle: T\ntags: [test]\n---\n\n';

function renderAll(md: string, sourceUrl: string): string {
	const ir = parse(FM + md);
	rewriteRelativeLinks(ir, sourceUrl);
	return ir.tabs.map((t) => renderTokens(t.tokens)).join('\n');
}

describe('rawToBlob', () => {
	it('maps a raw URL to its blob page', () => {
		expect(rawToBlob(BASE)).toBe('https://github.com/jedbjorn/subfloor/blob/main/README.md');
	});
});

describe('resolveDocLink', () => {
	it('sends .md targets back into the app via ?url=', () => {
		expect(resolveDocLink('docs/install.md', BASE)).toBe(
			`/?url=${encodeURIComponent('https://raw.githubusercontent.com/jedbjorn/subfloor/main/docs/install.md')}`
		);
	});

	it('resolves ../ against the source path', () => {
		expect(resolveDocLink('../specs_sc/x.md', DOCS_BASE)).toBe(
			`/?url=${encodeURIComponent('https://raw.githubusercontent.com/jedbjorn/subfloor/main/specs_sc/x.md')}`
		);
	});

	it('keeps a fragment on an .md target', () => {
		expect(resolveDocLink('docs/install.md#quick-start', BASE)).toMatch(/#quick-start$/);
	});

	it('sends non-md targets to the GitHub blob page', () => {
		expect(resolveDocLink('LICENSE', BASE)).toBe(
			'https://github.com/jedbjorn/subfloor/blob/main/LICENSE'
		);
	});
});

describe('rewriteRelativeLinks', () => {
	it('rewrites relative links but leaves anchors and absolute links alone', () => {
		const html = renderAll(
			'## Tab\n\n[docs](docs/install.md) · [anchor](#tab) · [abs](https://x.com/a.md)',
			BASE
		);
		expect(html).toContain(
			`href="/?url=${encodeURIComponent('https://raw.githubusercontent.com/jedbjorn/subfloor/main/docs/install.md')}"`
		);
		expect(html).toContain('href="#tab"');
		expect(html).toContain('href="https://x.com/a.md"');
	});

	it('resolves relative image sources to the raw host', () => {
		const html = renderAll('## Tab\n\n![shot](docs/images/cover.png)', BASE);
		expect(html).toContain(
			'src="https://raw.githubusercontent.com/jedbjorn/subfloor/main/docs/images/cover.png"'
		);
	});

	it('reaches links nested in tables and lists', () => {
		const html = renderAll('## Tab\n\n| a |\n|---|\n| [x](docs/a.md) |\n\n- [y](docs/b.md)', BASE);
		expect(html).not.toContain('href="docs/a.md"');
		expect(html).not.toContain('href="docs/b.md"');
	});

	it('accepts a github.com blob URL as the base', () => {
		const html = renderAll(
			'## Tab\n\n[docs](docs/install.md)',
			'https://github.com/jedbjorn/subfloor/blob/main/README.md'
		);
		expect(html).toContain(encodeURIComponent('raw.githubusercontent.com/jedbjorn/subfloor'));
	});

	it('no-ops on an invalid base instead of throwing', () => {
		const ir = parse(FM + '## Tab\n\n[docs](docs/install.md)');
		expect(() => rewriteRelativeLinks(ir, 'not a url')).not.toThrow();
		expect(renderTokens(ir.tabs[0].tokens)).toContain('href="docs/install.md"');
	});
});
