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
		expect(html).toContain('<a href="https://x.com">link</a>');
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
		const card2 =
			html.match(/<div class="stat-card class3">[\s\S]*?<\/div><\/div>/) ?? [''];
		expect(card2[0]).not.toContain('stat-desc');
	});

	it('escapes HTML in stat values', () => {
		const html = renderTab0('## S\n\n```stats\n:::class1\nvalue: <x>&y\nlabel: L\n```\n');
		expect(html).toContain('&lt;x&gt;&amp;y');
	});
});

describe('renderTokens: linear', () => {
	it('emits .linear with optionally-classed .linear-step children', () => {
		const html = renderTab0(
			'## S\n\n```linear\nA :::class1 -> B :::class4 -> C\n```\n'
		);
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
		const html = renderTab0(
			'## S\n\n- [ ] First\n- [x] Second\n- [ ] Third\n'
		);
		expect(html).toContain('<ul class="task-list">');
		// Incomplete
		expect(html).toContain('<li><span class="task-checkbox"></span><span>');
		expect(html).toContain('First');
		// Complete
		expect(html).toContain('<li class="done"><span class="task-checkbox done"></span><span class="done">');
		expect(html).toContain('Second');
	});

	it('leaves non-task bullet lists alone', () => {
		const html = renderTab0('## S\n\n- alpha\n- beta\n');
		expect(html).toContain('<ul>');
		expect(html).not.toContain('task-list');
		expect(html).toContain('<li>alpha</li>');
	});
});

describe('renderTokens: inline video', () => {
	const GH = 'https://github.com/user-attachments/assets/7ac96408-d531-4930-a1ad-446b2994739c';

	it('renders a bare GitHub user-attachments URL as a video player', () => {
		const html = renderTab0(`## S\n\n${GH}\n`);
		expect(html).toContain('<div class="video-wrap">');
		expect(html).toContain(`<video class="md-video" src="${GH}" controls playsinline preload="metadata">`);
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
