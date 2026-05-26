import editorialCss from '../../themes/editorial/styles.css?raw';
import bauhausCss from '../../themes/bauhaus/styles.css?raw';
import terminalCss from '../../themes/terminal/styles.css?raw';
import atelierCss from '../../themes/atelier/styles.css?raw';
import dossierCss from '../../themes/dossier/styles.css?raw';

import editorialTokens from '../../themes/editorial/tokens.json';
import bauhausTokens from '../../themes/bauhaus/tokens.json';
import terminalTokens from '../../themes/terminal/tokens.json';
import atelierTokens from '../../themes/atelier/tokens.json';
import dossierTokens from '../../themes/dossier/tokens.json';

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
	}
};

export const themeIds = Object.keys(themes) as ThemeId[];

const STYLE_ID = 'md-theme';
const FONTS_ID = 'md-theme-fonts';

/**
 * Inject the active theme's CSS + Google Fonts link into <head>.
 * Replaces any previously-injected theme. Browser-only.
 */
export function applyTheme(id: ThemeId): void {
	if (typeof document === 'undefined') return;
	const entry = themes[id];

	let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
		document.head.appendChild(style);
	}
	style.textContent = entry.css;

	let link = document.getElementById(FONTS_ID) as HTMLLinkElement | null;
	if (entry.tokens.fontsHref) {
		if (!link) {
			link = document.createElement('link');
			link.id = FONTS_ID;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}
		if (link.href !== entry.tokens.fontsHref) link.href = entry.tokens.fontsHref;
	} else if (link) {
		link.remove();
	}
}

export type { ThemeId, ThemeEntry, ThemeTokens } from './types';
