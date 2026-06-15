import { describe, it, expect } from 'vitest';
import { validateRemoteUrl, getUrlParam } from './index';

describe('validateRemoteUrl — accepts any GitHub source', () => {
	it('passes a raw.githubusercontent URL unchanged', () => {
		const url = 'https://raw.githubusercontent.com/jedbjorn/super-coder/main/README.md';
		expect(validateRemoteUrl(url)).toBe(url);
	});

	it('rewrites a github.com /blob/ URL to the raw host', () => {
		expect(validateRemoteUrl('https://github.com/jedbjorn/super-coder/blob/main/README.md')).toBe(
			'https://raw.githubusercontent.com/jedbjorn/super-coder/main/README.md'
		);
	});

	it('rewrites a github.com /raw/ URL to the raw host', () => {
		expect(validateRemoteUrl('https://github.com/jedbjorn/md-converter/raw/main/docs/x.md')).toBe(
			'https://raw.githubusercontent.com/jedbjorn/md-converter/main/docs/x.md'
		);
	});

	it('accepts any owner, not just one', () => {
		expect(validateRemoteUrl('https://github.com/someoneelse/repo/blob/main/README.md')).toBe(
			'https://raw.githubusercontent.com/someoneelse/repo/main/README.md'
		);
		const raw = 'https://raw.githubusercontent.com/someoneelse/repo/main/README.md';
		expect(validateRemoteUrl(raw)).toBe(raw);
	});

	it('keeps a nested file path intact', () => {
		const url = 'https://raw.githubusercontent.com/jedbjorn/repo/main/a/b/c.md';
		expect(validateRemoteUrl(url)).toBe(url);
	});
});

describe('validateRemoteUrl — refuses everything else', () => {
	it('rejects an unrelated host', () => {
		expect(() => validateRemoteUrl('https://evil.example.com/jedbjorn/x.md')).toThrow();
	});

	it('rejects non-https', () => {
		expect(() =>
			validateRemoteUrl('http://raw.githubusercontent.com/jedbjorn/repo/main/x.md')
		).toThrow(/https/);
	});

	it('rejects a github.com repo page (no /blob/ file)', () => {
		expect(() => validateRemoteUrl('https://github.com/jedbjorn/super-coder')).toThrow();
	});

	it('rejects a malformed URL', () => {
		expect(() => validateRemoteUrl('not a url')).toThrow();
	});
});

describe('getUrlParam', () => {
	it('extracts the url param', () => {
		expect(getUrlParam('?url=https://example.com/x.md')).toBe('https://example.com/x.md');
	});

	it('returns null when absent', () => {
		expect(getUrlParam('?c=abc')).toBeNull();
		expect(getUrlParam('')).toBeNull();
	});
});
