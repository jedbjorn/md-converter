// Remote-content deep links — open a markdown doc straight into the app via a
// `?url=` query param. Sibling to the `?c=` inline deep link, but for docs that
// are too large to ride in the URL or that should always reflect their live
// source (e.g. a project README on `main`).
//
// The app is a static site, so the fetch runs in the *browser* — there is no
// server leg and no SSRF surface. It only works against CORS-permissive hosts:
// raw.githubusercontent.com sends `Access-Control-Allow-Origin: *`.
//
// Allowlist: only this owner's public GitHub repos. Both URL shapes are
// accepted and normalized to the raw host (the only one with permissive CORS):
//   https://raw.githubusercontent.com/jedbjorn/<repo>/<ref>/<path>
//   https://github.com/jedbjorn/<repo>/blob/<ref>/<path>   (→ converted to raw)
// Anything else — another owner, another host, a non-https URL — is refused.
// For docs outside the allowlist, upload the .md file in the Style sidebar.

const PARAM = 'url';
const ALLOWED_OWNER = 'jedbjorn';
const RAW_HOST = 'raw.githubusercontent.com';
const GH_HOSTS = new Set(['github.com', 'www.github.com']);

/**
 * Validate + normalize a candidate remote-doc URL to a CORS-fetchable raw URL.
 *
 * Accepts only `https:` URLs under the allowed owner, on either
 * raw.githubusercontent.com (used as-is) or github.com (a `/blob/` or `/raw/`
 * link, rewritten to the raw host). Throws on anything else.
 */
export function validateRemoteUrl(raw: string): string {
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new Error('Not a valid URL');
	}
	if (url.protocol !== 'https:') {
		throw new Error('Only https URLs are supported');
	}

	const segments = url.pathname.replace(/^\/+/, '').split('/');
	const owner = segments[0];

	if (url.hostname === RAW_HOST) {
		if (owner !== ALLOWED_OWNER) {
			throw new Error(`Only github.com/${ALLOWED_OWNER} documents are allowed`);
		}
		return url.toString();
	}

	if (GH_HOSTS.has(url.hostname)) {
		// /<owner>/<repo>/(blob|raw)/<ref>/<path...>  →  raw.githubusercontent.com/<owner>/<repo>/<ref>/<path...>
		const [ghOwner, repo, kind, ...rest] = segments;
		if (ghOwner !== ALLOWED_OWNER) {
			throw new Error(`Only github.com/${ALLOWED_OWNER} documents are allowed`);
		}
		if ((kind !== 'blob' && kind !== 'raw') || !repo || rest.length === 0) {
			throw new Error('Link a file (a /blob/ or /raw/ URL), not a repo page');
		}
		return `https://${RAW_HOST}/${ghOwner}/${repo}/${rest.join('/')}`;
	}

	throw new Error(`Only github.com/${ALLOWED_OWNER} documents are allowed`);
}

/** Read the `url` param from a query string, or null when absent. */
export function getUrlParam(search: string): string | null {
	return new URLSearchParams(search).get(PARAM) || null;
}

/**
 * Read the remote-content param from a URL's query string, fetch it, and return
 * the markdown. Returns null when the param is absent. Throws when the param is
 * present but the URL is disallowed or the fetch fails (bad status, CORS, network).
 */
export async function readUrlParam(search: string): Promise<string | null> {
	const raw = getUrlParam(search);
	if (!raw) return null;
	const url = validateRemoteUrl(raw);
	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
	return await res.text();
}
