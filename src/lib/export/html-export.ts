import baseCss from '../renderer/base.css?raw';
import deckCss from '../renderer/deck.css?raw';
import { themes, type ThemeId } from '../themes';
import type { ThemeColors, ThemeTypography } from '../themes/types';
import type { LayoutId } from '../layout';

const TAB_SWITCH_JS = `(function(){
	var buttons = [].slice.call(document.querySelectorAll('.tab-nav button[data-tab]'));
	function show(idx){
		idx = Math.max(0, Math.min(buttons.length - 1, idx));
		var btn = buttons[idx];
		if (!btn) return;
		buttons.forEach(function(b) { b.classList.remove('active'); });
		document.querySelectorAll('.tab-panel').forEach(function(p) {
			p.classList.remove('active');
			p.classList.remove('first-tab');
		});
		btn.classList.add('active');
		var panel = document.getElementById(btn.dataset.tab);
		if (panel) panel.classList.add('active');
	}
	buttons.forEach(function(btn, i) {
		btn.addEventListener('click', function() { show(i); });
	});
	function activeIndex(){
		for (var i = 0; i < buttons.length; i++) if (buttons[i].classList.contains('active')) return i;
		return 0;
	}
	window.addEventListener('keydown', function(e){
		var t = e.target;
		if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
		if (e.key === 'ArrowDown' || e.key === 'PageDown') { show(activeIndex() + 1); e.preventDefault(); }
		else if (e.key === 'ArrowUp' || e.key === 'PageUp') { show(activeIndex() - 1); e.preventDefault(); }
		else if (e.key === 'Home') { show(0); }
		else if (e.key === 'End') { show(buttons.length - 1); }
	});
})();`;

// Vanilla deck navigation for exported slideshows — mirrors DeckLayout.svelte:
// Left/Right/Space/Home/End keys, prev/next arrows, dock clicks, the progress
// bar, slide counter, and the flat centred wrapping strip (constants kept in
// sync with DIAL_WINDOW / dialStyle in DeckLayout.svelte).
const DECK_NAV_JS = `(function(){
	var WIN = 4;
	var slides = [].slice.call(document.querySelectorAll('.deck .slide'));
	var dots = [].slice.call(document.querySelectorAll('.deck-dock-item'));
	var progress = document.querySelector('.deck-progress');
	var counter = document.querySelector('.deck-counter');
	var prev = document.querySelector('.deck-arrow.prev');
	var next = document.querySelector('.deck-arrow.next');
	var n = slides.length, cur = 0;
	function pad(x){ return (x < 10 ? '0' : '') + x; }
	function place(){
		dots.forEach(function(item, i){
			var d = i - cur;
			if (d > n / 2) d -= n;
			if (d < -n / 2) d += n;
			var ad = Math.abs(d);
			var x = d * 60;
			var scale = Math.max(0.6, 1 - ad * 0.08);
			item.style.transform = 'translateX(calc(-50% + ' + x + 'px)) scale(' + scale + ')';
			item.style.opacity = ad > WIN ? 0 : Math.max(0, 1 - ad / (WIN + 1));
			item.style.zIndex = String(100 - Math.round(ad));
			item.style.pointerEvents = ad > WIN ? 'none' : 'auto';
			item.classList.toggle('active', i === cur);
		});
	}
	function go(i){
		if (n === 0) return;
		cur = ((i % n) + n) % n;
		slides.forEach(function(s, k){ s.classList.toggle('active', k === cur); });
		if (progress) progress.style.width = ((cur + 1) / n * 100) + '%';
		if (counter) counter.textContent = pad(cur + 1) + ' / ' + pad(n);
		place();
	}
	// Column fit: one column until a slide would overflow, then two balanced
	// columns so it fits without a scrollbar. Mirrors fitColumns() in
	// DeckLayout.svelte. Re-run on resize + once fonts settle, because the
	// baked-in classes were measured at the authoring window size, not this one.
	function fit(){
		slides.forEach(function(s){
			var inner = s.querySelector('.slide-inner');
			if (!inner) return;
			inner.classList.remove('cols-2');
			if (inner.scrollHeight > inner.clientHeight + 4) inner.classList.add('cols-2');
		});
	}
	fit();
	window.addEventListener('resize', fit);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

	if (next) next.addEventListener('click', function(){ go(cur + 1); });
	if (prev) prev.addEventListener('click', function(){ go(cur - 1); });
	dots.forEach(function(d, k){ d.addEventListener('click', function(){ go(k); }); });
	window.addEventListener('keydown', function(e){
		var t = e.target;
		if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
		if (e.key === 'ArrowRight' || e.key === ' ') { go(cur + 1); e.preventDefault(); }
		else if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
		else if (e.key === 'Home') { go(0); }
		else if (e.key === 'End') { go(n - 1); }
	});
	go(0);
})();`;

function buildOverrideRule(
	colors: Partial<Record<keyof ThemeColors, string>>,
	fonts: Partial<Record<keyof ThemeTypography, string>>
): string {
	const decls: string[] = [];
	for (const [k, v] of Object.entries(colors)) decls.push(`--${k}: ${v};`);
	for (const [k, v] of Object.entries(fonts)) decls.push(`--${k}: ${v};`);
	if (decls.length === 0) return '';
	return `:root { ${decls.join(' ')} }`;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

interface ExportOptions {
	title: string;
	themeId: ThemeId;
	colorOverrides: Partial<Record<keyof ThemeColors, string>>;
	fontOverrides: Partial<Record<keyof ThemeTypography, string>>;
	layoutHtml: string; // outerHTML of the live layout root (.layout or .deck-root), mermaid SVGs in place
	layout?: LayoutId; // which view the markup is — selects the matching nav JS. Defaults to 'doc'.
}

/**
 * Build a fully self-contained HTML document from the live DOM state:
 * - Inlined base.css + active theme CSS + user overrides
 * - Google Fonts link for the active theme
 * - Vanilla tab-switch JS (no SvelteKit hydration needed)
 * - Mermaid diagrams are baked into the layoutHtml as pre-rendered SVG
 *   by the live mermaid renderer — caller is responsible for passing
 *   an up-to-date layoutHtml
 */
export function exportHtml(opts: ExportOptions): string {
	const theme = themes[opts.themeId];
	const fontsLink = theme.tokens.fontsHref
		? `<link rel="stylesheet" href="${escapeHtml(theme.tokens.fontsHref)}">`
		: '';
	const overrideRule = buildOverrideRule(opts.colorOverrides, opts.fontOverrides);
	const isDeck = opts.layout === 'deck';
	const navJs = isDeck ? DECK_NAV_JS : TAB_SWITCH_JS;

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
${fontsLink}
<style>
${baseCss}
</style>
<style>
${deckCss}
</style>
<style>
${theme.css}
</style>${overrideRule ? `\n<style>\n${overrideRule}\n</style>` : ''}
</head>
<body>
${opts.layoutHtml}
<script>
${navJs}
</script>
</body>
</html>
`;
}
