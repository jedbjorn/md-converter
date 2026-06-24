import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

// Inline video support. GitHub's own upload convention is the contract:
//   - an uploaded *image* arrives as `![](https://github.com/user-attachments/assets/<id>)`
//     (markdown image syntax), so it tokenizes as an `image` inside a paragraph.
//   - an uploaded *video* arrives as a *bare* URL on its own line, which tokenizes
//     as a plain autolink paragraph.
// So a paragraph whose only content is a bare video URL is reliably a video. We
// also accept any bare URL whose path ends in a known video extension, so an
// authored doc can drop a `.mp4`/`.webm`/… on its own line and get a player.

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;
const GH_ATTACHMENT_RE = /^https:\/\/github\.com\/user-attachments\/assets\/[\w-]+$/i;

function isVideoUrl(url: string): boolean {
	return VIDEO_EXT_RE.test(url) || GH_ATTACHMENT_RE.test(url);
}

/** A bare-URL paragraph is exactly: paragraph_open, inline (single URL), paragraph_close. */
function bareVideoUrl(open: Token, inline: Token | undefined, close: Token | undefined): string | null {
	if (!inline || !close) return null;
	if (open.type !== 'paragraph_open' || inline.type !== 'inline' || close.type !== 'paragraph_close') {
		return null;
	}
	const text = inline.content.trim();
	// Single token, no embedded whitespace — one URL and nothing else.
	if (!text || /\s/.test(text)) return null;
	return isVideoUrl(text) ? text : null;
}

export function videoPlugin(md: MarkdownIt): void {
	md.core.ruler.after('inline', 'video-block', (state) => {
		const out: Token[] = [];
		const toks = state.tokens;
		for (let i = 0; i < toks.length; i++) {
			const src = bareVideoUrl(toks[i], toks[i + 1], toks[i + 2]);
			if (src) {
				const block = new state.Token('video_block', '', 0);
				block.block = true;
				block.map = toks[i].map;
				block.meta = { src };
				out.push(block);
				i += 2; // consume the inline + paragraph_close
				continue;
			}
			out.push(toks[i]);
		}
		state.tokens = out;
		return true;
	});
}
