import MarkdownIt from 'markdown-it';
import { extractFrontmatter } from './frontmatter';
import { calloutsPlugin } from './plugins/callouts';
import { statsPlugin } from './plugins/stats';
import { linearPlugin } from './plugins/linear';
import { mermaidPlugin } from './plugins/mermaid';
import { splitTabs } from './tabs';
import type { IR } from './types';

export function createParser(): MarkdownIt {
	const md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: false,
		breaks: false
	});
	md.use(calloutsPlugin);
	md.use(statsPlugin);
	md.use(linearPlugin);
	md.use(mermaidPlugin);
	return md;
}

const sharedParser = createParser();

export function parse(source: string): IR {
	const { frontmatter, body } = extractFrontmatter(source);
	const tokens = sharedParser.parse(body, {});
	const { docTitle, tabs } = splitTabs(tokens);
	return {
		frontmatter,
		title: docTitle ?? frontmatter.title,
		tabs
	};
}

export { extractFrontmatter, splitTabs };
export * from './types';
