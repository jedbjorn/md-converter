// Curated list of font families available in the style sidebar.
// All faces here are loaded by at least one bundled theme via
// preloadAllFonts(), so picking any of them works across all themes.

export interface FontOption {
	label: string;
	value: string;
	group: 'display' | 'sans' | 'serif' | 'mono' | 'system';
}

export const FONT_OPTIONS: FontOption[] = [
	// Display / serif
	{ label: 'Fraunces', value: "'Fraunces', serif", group: 'display' },
	{ label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif", group: 'display' },
	{ label: 'DM Serif Display', value: "'DM Serif Display', serif", group: 'display' },
	// Display / sans
	{ label: 'Archivo', value: "'Archivo', sans-serif", group: 'display' },
	{ label: 'Syne', value: "'Syne', sans-serif", group: 'display' },

	// Body / serif
	{ label: 'Source Serif 4', value: "'Source Serif 4', serif", group: 'serif' },

	// Body / sans
	{ label: 'DM Sans', value: "'DM Sans', sans-serif", group: 'sans' },
	{ label: 'IBM Plex Sans', value: "'IBM Plex Sans', sans-serif", group: 'sans' },
	{ label: 'Manrope', value: "'Manrope', sans-serif", group: 'sans' },

	// Mono
	{ label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", group: 'mono' },
	{ label: 'IBM Plex Mono', value: "'IBM Plex Mono', monospace", group: 'mono' },

	// System fallbacks
	{ label: 'System sans', value: 'system-ui, sans-serif', group: 'system' },
	{ label: 'System serif', value: 'Georgia, serif', group: 'system' },
	{ label: 'System mono', value: 'ui-monospace, monospace', group: 'system' }
];

export const GROUP_LABELS: Record<FontOption['group'], string> = {
	display: 'Display',
	serif: 'Serif',
	sans: 'Sans-serif',
	mono: 'Monospace',
	system: 'System'
};
