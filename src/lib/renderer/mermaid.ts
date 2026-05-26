import mermaid from 'mermaid';
import type { ThemeColors } from '$lib/themes/types';

/**
 * (Re-)initialize mermaid with theme-aware defaults. Called before every
 * render so dark→light or light→dark theme swaps pick up the right edge
 * color, label background, etc. (Mermaid recomputes defaults from the
 * current init when render() is invoked.)
 *
 * `text-soft` works as the line color across every bundled theme: it's a
 * mid-tone in light themes (legible against the bg) and a mid-tone in dark
 * themes (the previous "edges disappear into the bg" failure mode).
 */
function configure(colors: ThemeColors, textColor: string, themeMode: 'light' | 'dark') {
	mermaid.initialize({
		startOnLoad: false,
		theme: themeMode === 'dark' ? 'dark' : 'base',
		securityLevel: 'strict',
		fontFamily: 'inherit',
		themeVariables: {
			lineColor: colors['text-soft'],
			textColor,
			mainBkg: colors.bg,
			edgeLabelBackground: colors.bg
		}
	});
}

/**
 * Pick black or white as the text color that contrasts best against a given
 * fill. YIQ brightness — good enough to keep node labels legible whether the
 * fill is bright sage or deep coral, light or dark theme.
 */
function contrastingText(hex: string): string {
	const c = hex.replace('#', '');
	if (c.length !== 6) return '#000000';
	const r = parseInt(c.slice(0, 2), 16);
	const g = parseInt(c.slice(2, 4), 16);
	const b = parseInt(c.slice(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff';
}

/**
 * Build a mermaid `classDef` preamble that binds class1..class4 to the
 * active theme's colors. Spec §3.5 / §8.2 — the renderer must inject this.
 * Per-class text color is chosen for contrast against the class fill so
 * labels stay legible whichever theme + class combination is in play.
 */
export function buildClassDefs(colors: ThemeColors): string {
	const stroke = colors.bg;
	const def = (k: 'class1' | 'class2' | 'class3' | 'class4') =>
		`classDef ${k} fill:${colors[k]},stroke:${stroke},stroke-width:1.5px,color:${contrastingText(colors[k])};`;
	return [def('class1'), def('class2'), def('class3'), def('class4')].join('\n');
}

/**
 * Insert classDef lines into a mermaid source AFTER the diagram-type
 * declaration (first non-empty line). Mermaid requires classDef to live
 * inside a diagram context — leading-position classDefs break the
 * `flowchart`/`graph` parser in v11.x.
 */
function injectClassDefs(source: string, classDefs: string): string {
	const trimmed = source.trim();
	const nl = trimmed.indexOf('\n');
	if (nl === -1) return `${trimmed}\n${classDefs}`;
	const header = trimmed.slice(0, nl);
	const rest = trimmed.slice(nl + 1);
	return `${header}\n${classDefs}\n${rest}`;
}

/**
 * Render every `.mermaid` node in the document with classDefs derived from
 * the active theme. Idempotent: stores original source on first call so
 * re-renders use fresh source instead of the already-rendered SVG markup.
 */
export async function renderMermaidAll(
	colors: ThemeColors,
	textColor: string,
	themeMode: 'light' | 'dark'
): Promise<void> {
	if (typeof document === 'undefined') return;
	configure(colors, textColor, themeMode);

	const nodes = document.querySelectorAll<HTMLElement>('.mermaid');
	const classDefs = buildClassDefs(colors);

	for (const node of nodes) {
		const original =
			node.dataset.original ?? (node.textContent || '').trim();
		if (!node.dataset.original) node.dataset.original = original;

		// Reset to source form so mermaid can re-process
		node.innerHTML = '';
		node.removeAttribute('data-processed');
		node.textContent = injectClassDefs(original, classDefs);
	}

	if (nodes.length > 0) {
		try {
			await mermaid.run({ querySelector: '.mermaid' });
		} catch (err) {
			console.warn('mermaid render failed', err);
		}
	}
}

/**
 * Render a single mermaid source string to a standalone SVG string, used by
 * the HTML export pipeline. Does not touch the DOM.
 */
export async function renderMermaidToSvg(
	source: string,
	id: string,
	colors: ThemeColors,
	textColor: string,
	themeMode: 'light' | 'dark'
): Promise<string> {
	configure(colors, textColor, themeMode);
	const classDefs = buildClassDefs(colors);
	const { svg } = await mermaid.render(id, injectClassDefs(source, classDefs));
	return svg;
}
