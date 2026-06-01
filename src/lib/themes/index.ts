import editorialCss from '../../themes/editorial/styles.css?raw';
import bauhausCss from '../../themes/bauhaus/styles.css?raw';
import terminalCss from '../../themes/terminal/styles.css?raw';
import atelierCss from '../../themes/atelier/styles.css?raw';
import dossierCss from '../../themes/dossier/styles.css?raw';
import risographCss from '../../themes/risograph/styles.css?raw';
import almanacCss from '../../themes/almanac/styles.css?raw';
import neongridCss from '../../themes/neongrid/styles.css?raw';
import manuscriptCss from '../../themes/manuscript/styles.css?raw';

import editorialTokens from '../../themes/editorial/tokens.json';
import bauhausTokens from '../../themes/bauhaus/tokens.json';
import terminalTokens from '../../themes/terminal/tokens.json';
import atelierTokens from '../../themes/atelier/tokens.json';
import dossierTokens from '../../themes/dossier/tokens.json';
import risographTokens from '../../themes/risograph/tokens.json';
import almanacTokens from '../../themes/almanac/tokens.json';
import neongridTokens from '../../themes/neongrid/tokens.json';
import manuscriptTokens from '../../themes/manuscript/tokens.json';

import type { ThemeEntry, ThemeId, ThemeTokens } from './types';

export const themes: Record<ThemeId, ThemeEntry> = {
	editorial: {
		id: 'editorial',
		label: 'Editorial',
		tokens: editorialTokens as ThemeTokens,
		css: editorialCss
	},
	bauhaus: {
		id: 'bauhaus',
		label: 'Bauhaus',
		tokens: bauhausTokens as ThemeTokens,
		css: bauhausCss
	},
	terminal: {
		id: 'terminal',
		label: 'Terminal',
		tokens: terminalTokens as ThemeTokens,
		css: terminalCss
	},
	atelier: {
		id: 'atelier',
		label: 'Atelier',
		tokens: atelierTokens as ThemeTokens,
		css: atelierCss
	},
	dossier: {
		id: 'dossier',
		label: 'Dossier',
		tokens: dossierTokens as ThemeTokens,
		css: dossierCss
	},
	risograph: {
		id: 'risograph',
		label: 'Risograph',
		tokens: risographTokens as ThemeTokens,
		css: risographCss
	},
	almanac: {
		id: 'almanac',
		label: 'Almanac',
		tokens: almanacTokens as ThemeTokens,
		css: almanacCss
	},
	neongrid: {
		id: 'neongrid',
		label: 'Neon Grid',
		tokens: neongridTokens as ThemeTokens,
		css: neongridCss
	},
	manuscript: {
		id: 'manuscript',
		label: 'Manuscript',
		tokens: manuscriptTokens as ThemeTokens,
		css: manuscriptCss
	}
};

export const themeIds = Object.keys(themes) as ThemeId[];

const STYLE_ID = 'md-theme';

/**
 * Inject the active theme's CSS into <head>. Replaces any previously-injected
 * theme. Fonts are pre-loaded separately via preloadAllFonts() so the font
 * picker works across themes without per-swap network roundtrips. Browser-only.
 */
export function applyTheme(id: ThemeId): void {
	if (typeof document === 'undefined') return;
	let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
		document.head.appendChild(style);
	}
	style.textContent = themes[id].css;
}

/**
 * Inject one <link rel="stylesheet"> per theme's Google Fonts URL so every
 * face from every theme is available regardless of which theme is active.
 * Idempotent. Browser-only.
 */
export function preloadAllFonts(): void {
	if (typeof document === 'undefined') return;
	for (const theme of Object.values(themes)) {
		if (!theme.tokens.fontsHref) continue;
		const id = `md-font-${theme.id}`;
		if (document.getElementById(id)) continue;
		const link = document.createElement('link');
		link.id = id;
		link.rel = 'stylesheet';
		link.href = theme.tokens.fontsHref;
		document.head.appendChild(link);
	}
}

export type { ThemeId, ThemeEntry, ThemeTokens } from './types';
