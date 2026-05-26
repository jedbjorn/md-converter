import mermaid from 'mermaid';
import type { ThemeColors } from '$lib/themes/types';

let initialized = false;

function ensureInit(themeMode: 'light' | 'dark') {
	if (initialized) return;
	mermaid.initialize({
		startOnLoad: false,
		theme: themeMode === 'dark' ? 'dark' : 'base',
		securityLevel: 'strict',
		fontFamily: 'inherit'
	});
	initialized = true;
}

/**
 * Build a mermaid `classDef` preamble that binds class1..class4 to the
 * active theme's colors. Spec §3.5 / §8.2 — the renderer must inject this.
 */
export function buildClassDefs(colors: ThemeColors, textColor: string): string {
	const stroke = colors.bg;
	const fg = textColor;
	return [
		`classDef class1 fill:${colors.class1},stroke:${stroke},stroke-width:1.5px,color:${fg};`,
		`classDef class2 fill:${colors.class2},stroke:${stroke},stroke-width:1.5px,color:${fg};`,
		`classDef class3 fill:${colors.class3},stroke:${stroke},stroke-width:1.5px,color:${fg};`,
		`classDef class4 fill:${colors.class4},stroke:${stroke},stroke-width:1.5px,color:${fg};`
	].join('\n');
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
	ensureInit(themeMode);

	const nodes = document.querySelectorAll<HTMLElement>('.mermaid');
	const classDefs = buildClassDefs(colors, textColor);

	for (const node of nodes) {
		const original =
			node.dataset.original ?? (node.textContent || '').trim();
		if (!node.dataset.original) node.dataset.original = original;

		// Reset to source form so mermaid can re-process
		node.innerHTML = '';
		node.removeAttribute('data-processed');
		node.textContent = `${classDefs}\n${original}`;
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
	ensureInit(themeMode);
	const classDefs = buildClassDefs(colors, textColor);
	const { svg } = await mermaid.render(id, `${classDefs}\n${source}`);
	return svg;
}
