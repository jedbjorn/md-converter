// Inline-content deep links — open a markdown doc straight into the app via a
// `?c=` query param, with no upload and no fetch (so it works cross-origin
// against the live app: the markdown rides *in* the URL).
//
// Contract (must stay byte-identical to any producer, e.g. the dos-arch API's
// Python encoder): markdown → UTF-8 bytes → gzip → base64url (no padding).
// Python side: gzip.compress(s.encode()) + urlsafe_b64encode(...).rstrip('=').
//
// Decode uses the browser-native DecompressionStream; encode uses
// CompressionStream. Both are available in modern browsers and Workers.

const PARAM = 'c';

function bytesToBase64Url(bytes: Uint8Array): string {
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
	const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
	const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
	const bin = atob(b64 + pad);
	return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
}

// CompressionStream / DecompressionStream are typed with BufferSource I/O in
// lib.dom; cast to a plain byte transform so the stream generics line up.
type ByteTransform = TransformStream<Uint8Array, Uint8Array>;

function streamOf(bytes: Uint8Array): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
}

async function pipe(input: Uint8Array, transform: ByteTransform): Promise<Uint8Array> {
	const stream = streamOf(input).pipeThrough(transform);
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

function gzip(input: Uint8Array): Promise<Uint8Array> {
	return pipe(input, new CompressionStream('gzip') as unknown as ByteTransform);
}

function gunzip(input: Uint8Array): Promise<Uint8Array> {
	return pipe(input, new DecompressionStream('gzip') as unknown as ByteTransform);
}

/** Encode markdown into a `c=` param value (gzip + base64url, no padding). */
export async function encodeInline(markdown: string): Promise<string> {
	const bytes = new TextEncoder().encode(markdown);
	return bytesToBase64Url(await gzip(bytes));
}

/** Decode a `c=` param value back into markdown. Throws on malformed input. */
export async function decodeInline(param: string): Promise<string> {
	const bytes = await gunzip(base64UrlToBytes(param));
	return new TextDecoder().decode(bytes);
}

/**
 * Read the inline-content param from a URL's query string, if present.
 * Returns the decoded markdown, or null when the param is absent.
 * Throws only when the param is present but malformed.
 */
export async function readInlineParam(search: string): Promise<string | null> {
	const value = new URLSearchParams(search).get(PARAM);
	if (!value) return null;
	return decodeInline(value);
}
