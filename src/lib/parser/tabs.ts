import type Token from 'markdown-it/lib/token.mjs';
import type { Tab } from './types';

export function slugify(text: string): string {
	const base = text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return base || 'tab';
}

export interface SplitResult {
	docTitle: string | null;
	tabs: Tab[];
}

/**
 * Walk the token stream and split into per-tab token sub-streams.
 *
 * Rules:
 * - First H1 (if any) is captured as docTitle; its tokens are dropped from output
 * - Each H2 opens a new tab; its heading text becomes the tab heading; H2 tokens are dropped
 * - Content before the first H2 (preamble) is dropped — per spec, all content lives under H2 sections
 * - If no H2 ever appears, a single default tab carries all remaining tokens
 */
export function splitTabs(tokens: Token[]): SplitResult {
	let docTitle: string | null = null;
	const tabs: Tab[] = [];
	let currentTab: Tab | null = null;
	const preambleHadH2 = tokens.some((t) => t.type === 'heading_open' && t.tag === 'h2');

	for (let i = 0; i < tokens.length; i++) {
		const t = tokens[i];

		if (t.type === 'heading_open' && t.tag === 'h1') {
			if (docTitle === null) {
				const inline = tokens[i + 1];
				if (inline?.type === 'inline') docTitle = inline.content;
			}
			i += 2; // skip open + inline + close
			continue;
		}

		if (t.type === 'heading_open' && t.tag === 'h2') {
			const inline = tokens[i + 1];
			const heading = inline?.type === 'inline' ? inline.content : '';
			currentTab = { heading, slug: slugify(heading), tokens: [] };
			tabs.push(currentTab);
			i += 2;
			continue;
		}

		if (!preambleHadH2) {
			// No H2 in the doc — collect everything into a single default tab
			if (!currentTab) {
				currentTab = { heading: '', slug: 'main', tokens: [] };
				tabs.push(currentTab);
			}
			currentTab.tokens.push(t);
		} else if (currentTab) {
			currentTab.tokens.push(t);
		}
	}

	return { docTitle, tabs };
}
