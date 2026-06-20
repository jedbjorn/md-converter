export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
	bg: string;
	'bg-2': string;
	'bg-3': string;
	text: string;
	'text-soft': string;
	rule: string;
	'rule-soft': string;
	accent: string;
	class1: string;
	class2: string;
	class3: string;
	class4: string;
}

export interface ThemeTypography {
	'font-display': string;
	'font-body': string;
	'font-mono': string;
}

export interface ThemeTokens {
	name: string;
	mode: ThemeMode;
	colors: ThemeColors;
	typography: ThemeTypography;
	fontsHref?: string;
}

export type ThemeId =
	| 'editorial'
	| 'bauhaus'
	| 'terminal'
	| 'atelier'
	| 'dossier'
	| 'risograph'
	| 'almanac'
	| 'neongrid'
	| 'manuscript'
	| 'expose';

export interface ThemeEntry {
	id: ThemeId;
	label: string;
	tokens: ThemeTokens;
	css: string;
}
