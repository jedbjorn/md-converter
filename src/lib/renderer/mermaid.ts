import mermaid from 'mermaid';
import type { ThemeColors } from '../themes/types';

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
function configure(
	colors: ThemeColors,
	textColor: string,
	themeMode: 'light' | 'dark',
	ganttWidth?: number
) {
	mermaid.initialize({
		startOnLoad: false,
		theme: themeMode === 'dark' ? 'dark' : 'base',
		securityLevel: 'strict',
		fontFamily: 'inherit',
		themeVariables: {
			lineColor: colors['text-soft'],
			textColor,
			mainBkg: colors.bg,
			edgeLabelBackground: colors.bg,
			fontSize: '15px'
		},
		...(ganttWidth ? { gantt: { useWidth: ganttWidth } } : {})
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
 * Diagram declarations whose grammar has a `classDef` statement. Every other
 * grammar (sequence, gantt, pie, …) rejects the line and mermaid draws its
 * error diagram instead, so those sources pass through untouched.
 */
const CLASSDEF_GRAMMAR =
	/^(flowchart|graph|classDiagram(-v2)?|stateDiagram(-v2)?|erDiagram|block(-beta)?|requirementDiagram|treemap(-beta)?)\b/;

/**
 * Index of the diagram-type declaration line: the first line after mermaid's
 * own `---` frontmatter and any `%%` comment or (possibly multi-line)
 * directive lines. -1 when there is none (or the frontmatter never closes).
 */
function declarationIndex(lines: string[]): number {
	let i = 0;
	if (lines[0].trim() === '---') {
		const end = lines.findIndex((line, j) => j > 0 && line.trim() === '---');
		if (end === -1) return -1;
		i = end + 1;
	}
	while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('%%'))) {
		// A `%%{ … }%%` directive may span lines; skip through its closing `}%%`.
		if (lines[i].trim().startsWith('%%{') && !lines[i].includes('}%%')) {
			while (i < lines.length && !lines[i].includes('}%%')) i++;
		}
		i++;
	}
	return i === lines.length ? -1 : i;
}

/**
 * Insert classDef lines into a mermaid source AFTER the diagram-type
 * declaration. Mermaid requires classDef to live inside a diagram context —
 * leading-position classDefs break the `flowchart`/`graph` parser in v11.x.
 * A grammar without `classDef` is returned unchanged.
 */
export function injectClassDefs(source: string, classDefs: string): string {
	const lines = source.trim().split('\n');
	const i = declarationIndex(lines);
	if (i === -1 || !CLASSDEF_GRAMMAR.test(lines[i].trim())) return lines.join('\n');
	lines.splice(i + 1, 0, classDefs);
	return lines.join('\n');
}

/** True when the source declares a gantt chart (past frontmatter and `%%` lines). */
export function isGantt(source: string): boolean {
	const lines = source.trim().split('\n');
	const i = declarationIndex(lines);
	return i !== -1 && /^gantt\b/.test(lines[i].trim());
}

export interface TickLabel {
	left: number;
	right: number;
	text: string;
}

/**
 * Which axis tick labels (ordered left to right) to keep. Mermaid's gantt axis
 * lets d3 choose ~10 ticks however narrow the chart is (and honours an
 * author's `tickInterval` however dense), so in a narrow pane its date labels
 * run into each other; sub-day ticks under a day-resolution format also repeat
 * the same date. A label that repeats the one before it is dropped, then every
 * `stride`-th remaining label is kept, with the smallest stride that leaves at
 * least `gap` px between neighbours — so the labels that stay are evenly
 * spaced. Only labels are dropped; ticks and grid lines stay where the axis
 * put them.
 */
export function tickLabelsToKeep(labels: TickLabel[], gap = 4): boolean[] {
	const distinct = labels
		.map((_, k) => k)
		.filter((k) => k === 0 || labels[k].text !== labels[k - 1].text);
	let kept = distinct.slice(0, 1);
	for (let stride = 1; stride <= distinct.length; stride++) {
		const candidate = distinct.filter((_, j) => j % stride === 0);
		const clear = candidate.every(
			(k, j) => j === 0 || labels[k].left >= labels[candidate[j - 1]].right + gap
		);
		if (clear) {
			kept = candidate;
			break;
		}
	}
	return labels.map((_, k) => kept.includes(k));
}

/**
 * Hide the gantt axis labels `tickLabelsToKeep` drops. Measures the laid-out
 * labels, so an axis inside a hidden panel (all boxes empty) is left alone;
 * the pages re-render when that panel is shown.
 */
function thinGanttAxisLabels(root: ParentNode) {
	const axes = root.querySelectorAll('svg[aria-roledescription="gantt"] g.grid');
	for (const axis of axes) {
		const texts = [...axis.querySelectorAll<SVGTextElement>('.tick text')];
		const labels = texts.map((t) => {
			const box = t.getBoundingClientRect();
			return { left: box.left, right: box.right, text: t.textContent ?? '' };
		});
		if (labels.every((l) => l.right - l.left === 0)) continue;
		tickLabelsToKeep(labels).forEach((keep, k) => {
			if (!keep) texts[k].setAttribute('visibility', 'hidden');
		});
	}
}

/**
 * Width available to a diagram inside its `.mermaid` node, or undefined when
 * the node is not laid out (a hidden tab or slide).
 */
function contentWidth(node: HTMLElement): number | undefined {
	const style = getComputedStyle(node);
	const width =
		node.clientWidth - parseFloat(style.paddingLeft || '0') - parseFloat(style.paddingRight || '0');
	return width > 0 ? Math.floor(width) : undefined;
}

async function runMermaid(nodes: HTMLElement[]) {
	try {
		await mermaid.run({ nodes });
	} catch (err) {
		console.warn('mermaid render failed', err);
	}
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

	const nodes = [...document.querySelectorAll<HTMLElement>('.mermaid')];
	const classDefs = buildClassDefs(colors, textColor);
	const gantts: HTMLElement[] = [];

	for (const node of nodes) {
		const original = node.dataset.original ?? (node.textContent || '').trim();
		if (!node.dataset.original) node.dataset.original = original;
		if (isGantt(original)) gantts.push(node);

		// Reset to source form so mermaid can re-process
		node.innerHTML = '';
		node.removeAttribute('data-processed');
		node.textContent = injectClassDefs(original, classDefs);
	}

	const others = nodes.filter((node) => !gantts.includes(node));
	if (others.length > 0) await runMermaid(others);

	// Gantt lays its time axis across the width of the svg's parent at draw
	// time. Every theme centres `.mermaid` as a flex box, which makes that
	// parent a shrink-to-fit flex item measuring 300px whatever the page width,
	// so the whole axis was squeezed into 300px and its labels overlapped. Hand
	// each gantt the width its `.mermaid` node actually has instead, one run per
	// chart since the width is site config.
	for (const node of gantts) {
		configure(colors, textColor, themeMode, contentWidth(node));
		await runMermaid([node]);
	}
	if (gantts.length > 0) {
		configure(colors, textColor, themeMode);
		thinGanttAxisLabels(document);
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
