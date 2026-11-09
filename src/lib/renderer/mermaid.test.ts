import { describe, it, expect } from 'vitest';
import { injectClassDefs } from './mermaid';

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
