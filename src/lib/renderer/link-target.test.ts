import { describe, it, expect } from 'vitest';
import { currentOrigin, opensInNewTab } from './link-target';

const O = 'https://app.example.com';

describe('opensInNewTab', () => {
	it('keeps relative links internal', () => {
		for (const h of ['/documents/12', './x', 'x', '?q', '../y']) {
			expect(opensInNewTab(h, O)).toBe(false);
			expect(opensInNewTab(h, null)).toBe(false);
		}
	});
	it('keeps same-origin absolute links internal', () => {
		expect(opensInNewTab(`${O}/documents/12`, O)).toBe(false);
		expect(opensInNewTab('//app.example.com/a', O)).toBe(false);
	});
	it('treats cross-origin and other schemes as external', () => {
		expect(opensInNewTab('https://other.example.com/', O)).toBe(true);
		expect(opensInNewTab('https://app.example.com:8443/', O)).toBe(true);
		expect(opensInNewTab('mailto:a@b.co', O)).toBe(true);
		expect(opensInNewTab('tel:+100', O)).toBe(true);
	});
	it('leaves #anchors and empty hrefs alone', () => {
		expect(opensInNewTab('#s', O)).toBe(false);
		expect(opensInNewTab('', O)).toBe(false);
	});
	it('treats every absolute URL as external without an origin', () => {
		expect(currentOrigin()).toBeNull(); // node test env: no window
		expect(opensInNewTab(`${O}/a`)).toBe(true);
		expect(opensInNewTab(`${O}/a`, null)).toBe(true);
	});
});
