import { describe, it, expect } from 'vitest';
import { injectClassDefs, isGantt, tickLabelsToKeep } from './mermaid';

const DEFS = 'classDef class1 fill:#fff;';

describe('injectClassDefs', () => {
	it.each([
		['graph LR\n  A --> B:::class1'],
		['flowchart TD\n  A --> B'],
		['classDiagram\n  class Doc'],
		['stateDiagram-v2\n  [*] --> Draft'],
		['erDiagram\n  A ||--o{ B : has'],
		['block\n  columns 2\n  a b'],
		['block-beta\n  columns 2\n  a b'],
		['requirementDiagram\n  requirement r1 {\n  id: 1\n  }'],
		['treemap\n  "Root"\n    "Leaf": 10'],
		['treemap-beta\n  "Root"\n    "Leaf": 10']
	])('injects after the declaration of a classDef grammar: %s', (source) => {
		const [declaration, ...rest] = source.split('\n');
		expect(injectClassDefs(source, DEFS)).toBe([declaration, DEFS, ...rest].join('\n'));
	});

	it.each([
		['sequenceDiagram\n  A->>B: hi'],
		['gantt\n  dateFormat YYYY-MM-DD\n  Spec :a1, 2026-11-01, 3d'],
		['pie title Coverage\n  "covered" : 80'],
		['journey\n  title Day']
	])('leaves a grammar without classDef untouched: %s', (source) => {
		expect(injectClassDefs(source, DEFS)).toBe(source);
	});

	it('finds the declaration after mermaid frontmatter and %% lines', () => {
		const source =
			'---\ntitle: Flow\n---\n%%{init: {"theme": "base"}}%%\n%% note\ngraph LR\n  A --> B';
		expect(injectClassDefs(source, DEFS)).toBe(
			'---\ntitle: Flow\n---\n%%{init: {"theme": "base"}}%%\n%% note\ngraph LR\n' +
				DEFS +
				'\n  A --> B'
		);
	});

	it('skips the continuation lines of a multi-line directive', () => {
		const directive = '%%{init: {\n  "theme": "base",\n  "flowchart": {"curve": "basis"}\n}}%%';
		expect(injectClassDefs(`${directive}\ngraph LR\n  A --> B`, DEFS)).toBe(
			`${directive}\ngraph LR\n${DEFS}\n  A --> B`
		);
		const pieSource = `%%{init: {\n  "pie": {"textPosition": 0.5}\n}}%%\npie\n  "a" : 1`;
		expect(injectClassDefs(pieSource, DEFS)).toBe(pieSource);
	});

	it('does not mistake a frontmatter title for the declaration', () => {
		const source = '---\ntitle: graph of sales\n---\npie\n  "a" : 1';
		expect(injectClassDefs(source, DEFS)).toBe(source);
	});

	it('appends to a declaration-only source', () => {
		expect(injectClassDefs('  graph LR  ', DEFS)).toBe(`graph LR\n${DEFS}`);
	});
});

describe('isGantt', () => {
	it.each([
		['gantt\n  dateFormat YYYY-MM-DD'],
		['  gantt  '],
		['---\ntitle: Plan\n---\n%%{init: {"gantt": {"barHeight": 20}}}%%\ngantt\n  section A'],
		['%%{init: {\n  "gantt": {"topAxis": true}\n}}%%\ngantt\n  section A']
	])('recognises a gantt declaration: %s', (source) => {
		expect(isGantt(source)).toBe(true);
	});

	it.each([
		['graph LR\n  A --> B'],
		['---\ntitle: gantt of work\n---\npie\n  "a" : 1'],
		['%% gantt\nsequenceDiagram\n  A->>B: hi'],
		['ganttish\n  x'],
		['---\ntitle: never closed\ngantt']
	])('rejects a non-gantt source: %s', (source) => {
		expect(isGantt(source)).toBe(false);
	});
});

describe('tickLabelsToKeep', () => {
	// Labels 50px wide, one every `step` px from 0.
	const axis = (texts: string[], step: number) =>
		texts.map((text, k) => ({ left: k * step, right: k * step + 50, text }));
	const days = (n: number) =>
		Array.from({ length: n }, (_, k) => `2026-11-${String(k + 1).padStart(2, '0')}`);

	it('keeps every label when they already clear each other', () => {
		expect(tickLabelsToKeep(axis(days(5), 60))).toEqual([true, true, true, true, true]);
	});

	it('keeps the smallest even stride of labels that clears the gap', () => {
		// 30px apart: every 2nd label is 60px apart, clear of the 50px label + 4px gap.
		expect(tickLabelsToKeep(axis(days(7), 30))).toEqual([
			true,
			false,
			true,
			false,
			true,
			false,
			true
		]);
		// 20px apart: every 2nd (40px) still collides; every 3rd (60px) clears.
		expect(tickLabelsToKeep(axis(days(7), 20))).toEqual([
			true,
			false,
			false,
			true,
			false,
			false,
			true
		]);
	});

	it('drops a label that repeats the previous one before choosing the stride', () => {
		const halfDays = ['2026-11-01', '2026-11-01', '2026-11-02', '2026-11-02', '2026-11-03'];
		expect(tickLabelsToKeep(axis(halfDays, 60))).toEqual([true, false, true, false, true]);
	});

	it('leaves kept neighbours at least the gap apart', () => {
		const labels = axis(days(12), 13);
		const keep = tickLabelsToKeep(labels);
		const kept = labels.filter((_, k) => keep[k]);
		expect(kept.length).toBeGreaterThan(1);
		for (let j = 1; j < kept.length; j++) {
			expect(kept[j].left).toBeGreaterThanOrEqual(kept[j - 1].right + 4);
		}
	});

	it('keeps only the first label when no two fit, and handles an empty axis', () => {
		const crowded = [
			{ left: 0, right: 50, text: 'a' },
			{ left: 10, right: 60, text: 'b' }
		];
		expect(tickLabelsToKeep(crowded)).toEqual([true, false]);
		expect(tickLabelsToKeep([])).toEqual([]);
	});
});
