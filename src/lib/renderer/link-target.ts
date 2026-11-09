// Per-link tab decision for rendered documents.
//
//   #anchors                          → current tab (the app selects a section by hash)
//   relative (/x, ./x, x, ?q)         → current tab — internal to the host app
//   absolute http(s), same origin     → current tab — internal to the host app
//   absolute http(s), other origin    → new tab
//   any other scheme (mailto:, tel:…) → new tab
//   protocol-relative (//host/x)      → compared like an absolute URL
//
// The page origin comes from `window.location.origin` in the browser. Outside a
// browser (tests, any non-DOM render) there is no origin, so only relative
// links count as internal and every absolute URL opens in a new tab.

const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/** The current page origin, or null when there is none (no window, file://, sandboxed). */
export function currentOrigin(): string | null {
	if (typeof window === 'undefined' || !window.location) return null;
	const origin = window.location.origin;
	return origin && origin !== 'null' ? origin : null;
}

/** True when `href` should open in a new tab; false keeps it in the current tab. */
export function opensInNewTab(href: string, origin: string | null = currentOrigin()): boolean {
	const h = href.trim();
	if (!h || h.startsWith('#')) return false;
	const absolute = h.startsWith('//') || SCHEME.test(h);
	if (!absolute) return false;
	if (!origin) return true;
	try {
		const url = new URL(h, origin);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
		return url.origin !== origin;
	} catch {
		return true;
	}
}
