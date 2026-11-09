import { describe, it, expect } from 'vitest';
import { parse } from '../parser';
import { renderTokens } from './render-html';

const fm = `---\ntitle: T\ntags: []\n---\n\n`;

function renderTab0(src: string): string {
	const ir = parse(fm + src);
	return renderTokens(ir.tabs[0].tokens);
}

describe('renderTokens: standard markdown', () => {
	it('renders paragraphs and inline formatting', () => {
		const html = renderTab0('## S\n\n**bold** and *em* and `code` and [link](https://x.com).');
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('<em>em</em>');
		expect(html).toContain('<code>code</code>');
		expect(html).toContain(
			'<a href="https://x.com" target="_blank" rel="noopener noreferrer">link</a>'
		);
	});

	it('keeps fragment links in the current tab', () => {
		const html = renderTab0('## S\n\n[Go to another section](#another-section).');
		expect(html).toContain('<a href="#another-section">Go to another section</a>');
		expect(html).not.toContain('target="_blank"');
		expect(html).not.toContain('rel="noopener noreferrer"');
	});
	it('renders H3 (H2 is consumed as tab heading)', () => {
		const html = renderTab0('## S\n\n### Subsection\n\nbody');
		expect(html).toContain('<h3>Subsection</h3>');
		expect(html).not.toContain('<h2');
	});

	it('renders tables', () => {
		const html = renderTab0('## S\n\n| A | B |\n|---|---|\n| 1 | 2 |\n');
		expect(html).toContain('<table>');
		expect(html).toContain('<th>A</th>');
		expect(html).toContain('<td>1</td>');
	});

	it('renders fenced code with language', () => {
		const html = renderTab0('## S\n\n```ts\nconst x = 1;\n```\n');
		expect(html).toMatch(/<pre><code class="language-ts">/);
	});
});

describe('renderTokens: callouts', () => {
	it('emits .callout .callout-classN wrapper', () => {
		const html = renderTab0('## S\n\n> [!class2]\n> A callout body\n');
		expect(html).toContain('<div class="callout callout-class2">');
		expect(html).toContain('A callout body');
		expect(html).not.toContain('[!class2]');
		expect(html).not.toContain('<blockquote');
	});
});

describe('renderTokens: stats', () => {
	it('emits .stats with .stat-card .classN children', () => {
		const html = renderTab0(
			'## S\n\n```stats\n:::class1\nvalue: 87%\nlabel: Sat\ndescription: Up\n:::class3\nvalue: 7\nlabel: Bar\n```\n'
		);
		expect(html).toContain('<div class="stats">');
		expect(html).toContain('<div class="stat-card class1">');
		expect(html).toContain('<div class="stat-value">87%</div>');
		expect(html).toContain('<div class="stat-label">Sat</div>');
		expect(html).toContain('<div class="stat-desc">Up</div>');
		expect(html).toContain('<div class="stat-card class3">');
		// Card without description should not emit empty stat-desc
		const card2 = html.match(/<div class="stat-card class3">[\s\S]*?<\/div><\/div>/) ?? [''];
		expect(card2[0]).not.toContain('stat-desc');
	});

	it('escapes HTML in stat values', () => {
		const html = renderTab0('## S\n\n```stats\n:::class1\nvalue: <x>&y\nlabel: L\n```\n');
		expect(html).toContain('&lt;x&gt;&amp;y');
	});
});

describe('renderTokens: linear', () => {
	it('emits .linear with optionally-classed .linear-step children', () => {
		const html = renderTab0('## S\n\n```linear\nA :::class1 -> B :::class4 -> C\n```\n');
		expect(html).toContain('<div class="linear">');
		expect(html).toContain('<div class="linear-step class1">A</div>');
		expect(html).toContain('<div class="linear-step class4">B</div>');
		expect(html).toContain('<div class="linear-step">C</div>');
	});
});

describe('renderTokens: mermaid', () => {
	it('emits .mermaid-wrap > .mermaid with escaped source', () => {
		const html = renderTab0('## S\n\n```mermaid\ngraph LR\n  A --> B\n```\n');
		expect(html).toMatch(/<div class="mermaid-wrap"><div class="mermaid">/);
		expect(html).toContain('graph LR');
	});
});

describe('renderTokens: task lists', () => {
	it('emits .task-list with span-based checkbox markup', () => {
		const html = renderTab0('## S\n\n- [ ] First\n- [x] Second\n- [ ] Third\n');
		expect(html).toContain('<ul class="task-list">');
		// Incomplete
		expect(html).toContain('<li><span class="task-checkbox"></span><span>');
		expect(html).toContain('First');
		// Complete
		expect(html).toContain(
			'<li class="done"><span class="task-checkbox done"></span><span class="done">'
		);
		expect(html).toContain('Second');
	});

	it('leaves non-task bullet lists alone', () => {
		const html = renderTab0('## S\n\n- alpha\n- beta\n');
		expect(html).toContain('<ul>');
		expect(html).not.toContain('task-list');
		expect(html).toContain('<li>alpha</li>');
	});
});

describe('renderTokens: block images', () => {
	it('wraps an image-only paragraph in a figure', () => {
		const html = renderTab0('## S\n\n![shot](https://x.com/a.png)\n');
		expect(html).toContain(
			'<figure class="md-figure"><img src="https://x.com/a.png" alt="shot"></figure>'
		);
		expect(html).not.toContain('<p><img');
	});

	it('emits the image title as a figcaption', () => {
		const html = renderTab0('## S\n\n![shot](https://x.com/a.png "The caption")\n');
		expect(html).toContain('<figcaption>The caption</figcaption></figure>');
	});

	it('wraps a lone linked image in a figure, keeping the link', () => {
		const html = renderTab0('## S\n\n[![shot](https://x.com/a.png)](https://x.com/page)\n');
		expect(html).toMatch(
			/<figure class="md-figure"><a href="https:\/\/x\.com\/page" target="_blank" rel="noopener noreferrer"><img src="https:\/\/x\.com\/a\.png" alt="shot"><\/a><\/figure>/
		);
	});

	it('leaves a paragraph mixing text and an image as a paragraph', () => {
		const html = renderTab0('## S\n\nSee ![icon](https://x.com/i.png) inline.\n');
		expect(html).not.toContain('figure');
		expect(html).toContain('<p>See <img');
	});

	it('leaves a badge row (multiple linked images) as a paragraph', () => {
		const html = renderTab0(
			'## S\n\n[![a](https://x.com/a.svg)](https://x.com/1) [![b](https://x.com/b.svg)](https://x.com/2)\n'
		);
		expect(html).not.toContain('figure');
		expect(html).toContain('<p>');
	});

	it('leaves an image in a tight list item as a bare img', () => {
		const html = renderTab0('## S\n\n- ![shot](https://x.com/a.png)\n- beta\n');
		expect(html).not.toContain('figure');
		expect(html).toContain('<li><img');
	});
});

describe('renderTokens: inline video', () => {
	const GH = 'https://github.com/user-attachments/assets/7ac96408-d531-4930-a1ad-446b2994739c';

	it('renders a bare GitHub user-attachments URL as a video player', () => {
		const html = renderTab0(`## S\n\n${GH}\n`);
		expect(html).toContain('<div class="video-wrap">');
		expect(html).toContain(
			`<video class="md-video" src="${GH}" controls playsinline preload="metadata">`
		);
		// Not rendered as a paragraph link
		expect(html).not.toContain(`<a href="${GH}"`);
	});

	it('renders a bare URL with a video extension as a video player', () => {
		const html = renderTab0('## S\n\nhttps://cdn.example.com/clip.mp4\n');
		expect(html).toContain('<video class="md-video" src="https://cdn.example.com/clip.mp4"');
	});

	it('leaves a normal link alone', () => {
		const html = renderTab0(`## S\n\nSee [the clip](${GH}) here.\n`);
		expect(html).not.toContain('video-wrap');
		expect(html).toContain('<a href=');
	});

	it('leaves an image (markdown image syntax) alone', () => {
		const html = renderTab0(`## S\n\n![shot](${GH})\n`);
		expect(html).not.toContain('video-wrap');
		expect(html).toContain('<img');
	});

	it('does not treat a non-video bare URL as a video', () => {
		const html = renderTab0('## S\n\nhttps://example.com/page\n');
		expect(html).not.toContain('video-wrap');
		expect(html).toContain('<a href="https://example.com/page"');
	});
});

describe('renderTokens: link targets (internal current tab, external new tab)', () => {
	const ORIGIN = 'https://app.example.com';
	const NEW_TAB = 'target="_blank" rel="noopener noreferrer"';

	function render(src: string, origin?: string | null): string {
		const ir = parse(fm + '## S\n\n' + src);
		return renderTokens(ir.tabs[0].tokens, origin === undefined ? {} : { origin });
	}

	it.each(['/documents/12', './x.md', 'notes/y', '?q=1', '../up'])(
		'keeps relative link %s in the current tab',
		(href) => {
			const html = render(`[l](${href})`, ORIGIN);
			expect(html).toContain(`<a href="${href}">l</a>`);
			expect(html).not.toContain('target=');
		}
	);

	it('keeps same-origin absolute links in the current tab', () => {
		const html = render(`[l](${ORIGIN}/documents/12?x=1#s)`, ORIGIN);
		expect(html).toContain(`<a href="${ORIGIN}/documents/12?x=1#s">l</a>`);
		expect(html).not.toContain('target=');
	});

	it('opens cross-origin absolute links in a new tab', () => {
		for (const href of [
			'https://other.example.com/a',
			'http://app.example.com/a',
			'//cdn.example.org/x'
		]) {
			expect(render(`[l](${href})`, ORIGIN)).toContain(`<a href="${href}" ${NEW_TAB}>l</a>`);
		}
	});

	it('opens mailto links in a new tab', () => {
		expect(render('[mail](mailto:a@b.co)', ORIGIN)).toContain(
			`<a href="mailto:a@b.co" ${NEW_TAB}>mail</a>`
		);
	});

	it('keeps #anchor links in the current tab', () => {
		const html = render('[s](#another-section)', ORIGIN);
		expect(html).toContain('<a href="#another-section">s</a>');
		expect(html).not.toContain('target=');
	});

	it('without a page origin, only relative links are internal', () => {
		expect(render('[l](/documents/12)', null)).toContain('<a href="/documents/12">l</a>');
		expect(render(`[l](${ORIGIN}/documents/12)`, null)).toContain(NEW_TAB);
		// Default (node test env has no window) behaves the same.
		expect(render(`[l](${ORIGIN}/documents/12)`)).toContain(NEW_TAB);
		expect(render('[l](/documents/12)')).not.toContain('target=');
	});

	it('does not leak a decision into the cached token stream across renders', () => {
		const ir = parse(fm + `## S\n\n[l](${ORIGIN}/a)`);
		expect(renderTokens(ir.tabs[0].tokens, { origin: null })).toContain(NEW_TAB);
		expect(renderTokens(ir.tabs[0].tokens, { origin: ORIGIN })).not.toContain('target=');
	});
});
