// Relative-link resolution for remote (`?url=`) docs. A doc fetched from
// GitHub renders here, but its relative links were authored against the repo
// tree — left untouched they resolve against THIS app's origin and 404
// (e.g. md-converter.designs-os.com/docs/install.md). The doc's source URL is
// known, so resolve at the render layer instead of forcing authors to write
// absolute URLs:
//
//   .md targets      → stay in the app: /?url=<resolved raw URL> (+hash)
//   other targets    → the human-facing GitHub blob page (LICENSE, source)
//   image sources    → the resolved raw URL (fetchable <img src>)
//   #anchors, absolute http(s)/mailto links → untouched
//
// The walk mutates the parsed token stream once, right after a remote load —
// every rewrite produces an absolute URL, so a second pass is a no-op.
import type Token from 'markdown-it/lib/token.mjs';
import type { IR } from '../parser/types';
import { validateRemoteUrl } from './index';

const RAW_HOST = 'raw.githubusercontent.com';

/** raw.githubusercontent.com/<owner>/<repo>/<ref>/<path> → github.com blob page. */
export function rawToBlob(raw: string): string {
	const url = new URL(raw);
	const [owner, repo, ref, ...path] = url.pathname.replace(/^\/+/, '').split('/');
	return `https://github.com/${owner}/${repo}/blob/${ref}/${path.join('/')}`;
}

/** A target this module should resolve: relative, and not an anchor/scheme link. */
function isRelative(target: string): boolean {
	if (!target) return false;
	if (target.startsWith('#') || target.startsWith('//')) return false;
	return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target); // any scheme: https, mailto, data…
}

/** Resolve a relative href against the doc's raw source URL. */
export function resolveDocLink(href: string, baseRaw: string): string {
	const resolved = new URL(href, baseRaw);
	if (resolved.hostname !== RAW_HOST) return href;
	const hash = resolved.hash;
	resolved.hash = '';
	if (/\.(md|markdown)$/i.test(resolved.pathname)) {
		return `/?url=${encodeURIComponent(resolved.toString())}${hash}`;
	}
	return rawToBlob(resolved.toString()) + hash;
}

/** Resolve a relative image src against the doc's raw source URL. */
export function resolveDocImage(src: string, baseRaw: string): string {
	const resolved = new URL(src, baseRaw);
	return resolved.hostname === RAW_HOST ? resolved.toString() : src;
}

function walk(tokens: Token[], baseRaw: string): void {
	for (const t of tokens) {
		if (t.type === 'link_open') {
			const href = t.attrGet('href');
			if (href && isRelative(href)) t.attrSet('href', resolveDocLink(href, baseRaw));
		} else if (t.type === 'image') {
			const src = t.attrGet('src');
			if (src && isRelative(src)) t.attrSet('src', resolveDocImage(src, baseRaw));
		}
		if (t.children) walk(t.children, baseRaw);
	}
}

/**
 * Rewrite every relative link/image in a parsed remote doc against its source
 * URL (any accepted GitHub form — normalized to raw here). No-op on an
 * invalid base rather than breaking the render.
 */
export function rewriteRelativeLinks(ir: IR, sourceUrl: string): void {
	let baseRaw: string;
	try {
		baseRaw = validateRemoteUrl(sourceUrl);
	} catch {
		return;
	}
	for (const tab of ir.tabs) walk(tab.tokens, baseRaw);
}
