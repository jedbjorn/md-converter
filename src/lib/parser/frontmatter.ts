import yaml from 'js-yaml';
import type { Frontmatter } from './types';

export interface FrontmatterResult {
	frontmatter: Frontmatter;
	body: string;
}

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function extractFrontmatter(source: string): FrontmatterResult {
	const match = source.match(FM_RE);
	if (!match) {
		throw new Error('Frontmatter: missing leading --- block');
	}

	const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
	const body = source.slice(match[0].length);

	if (typeof data.title !== 'string' || data.title.length === 0) {
		throw new Error('Frontmatter: `title` is required and must be a string');
	}
	if (!Array.isArray(data.tags)) {
		throw new Error('Frontmatter: `tags` is required and must be an array');
	}

	const frontmatter: Frontmatter = {
		title: data.title,
		tags: data.tags.map(String)
	};
	if (typeof data.date === 'string') frontmatter.date = data.date;
	else if (data.date instanceof Date)
		frontmatter.date = data.date.toISOString().slice(0, 10);
	if (typeof data.project === 'string') frontmatter.project = data.project;
	if (typeof data.purpose === 'string') frontmatter.purpose = data.purpose;

	return { frontmatter, body };
}
