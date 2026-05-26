import type Token from 'markdown-it/lib/token.mjs';

export type ClassName = 'class1' | 'class2' | 'class3' | 'class4';

export interface Frontmatter {
	title: string;
	tags: string[];
	date?: string;
	project?: string;
	purpose?: string;
}

export interface Tab {
	heading: string;
	slug: string;
	tokens: Token[];
}

export interface StatCard {
	cls: ClassName;
	value: string;
	label: string;
	description?: string;
}

export interface LinearStep {
	text: string;
	cls?: ClassName;
}

export interface IR {
	frontmatter: Frontmatter;
	title: string;
	tabs: Tab[];
}
