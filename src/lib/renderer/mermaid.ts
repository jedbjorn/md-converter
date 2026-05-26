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
 * Build a mermaid `classDef` preamble that binds class1..class4 to the
 * active theme's colors. Spec §3.5 / §8.2 — the renderer must inject this.
 *
 * Node fill is the theme's panel bg (--bg-2) so node text always reads
 * against the same surface the rest of the doc uses; class identity lives
 * in a 2px colored border. Mirrors the alt-style spec's pipeline-card
 * pattern and keeps text legibility consistent across all themes.
 */
export function buildClassDefs(colors: ThemeColors, textColor: string): string {
	const fill = colors['bg-2'];
	const def = (k: 'class1' | 'class2' | 'class3' | 'class4') =>
		`classDef ${k} fill:${fill},stroke:${colors[k]},stroke-width:2px,color:${textColor};`;
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
	const classDefs = buildClassDefs(colors, textColor);

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
	const classDefs = buildClassDefs(colors, textColor);
	const { svg } = await mermaid.render(id, injectClassDefs(source, classDefs));
	return svg;
}
