import baseCss from '$lib/renderer/base.css?raw';
import { themes, type ThemeId } from '$lib/themes';
import type { ThemeColors, ThemeTypography } from '$lib/themes/types';

const TAB_SWITCH_JS = `(function(){
	var buttons = document.querySelectorAll('.tab-nav button[data-tab]');
	buttons.forEach(function(btn) {
		btn.addEventListener('click', function() {
			buttons.forEach(function(b) { b.classList.remove('active'); });
			document.querySelectorAll('.tab-panel').forEach(function(p) {
				p.classList.remove('active');
				p.classList.remove('first-tab');
			});
			btn.classList.add('active');
			var panel = document.getElementById(btn.dataset.tab);
			if (panel) panel.classList.add('active');
		});
	});
})();`;

function buildOverrideRule(
	colors: Partial<Record<keyof ThemeColors, string>>,
	fonts: Partial<Record<keyof ThemeTypography, string>>
): string {
	const decls: string[] = [];
	for (const [k, v] of Object.entries(colors)) decls.push(`--${k}: ${v};`);
	for (const [k, v] of Object.entries(fonts)) decls.push(`--${k}: ${v};`);
	if (decls.length === 0) return '';
	return `:root { ${decls.join(' ')} }`;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

interface ExportOptions {
	title: string;
	themeId: ThemeId;
	colorOverrides: Partial<Record<keyof ThemeColors, string>>;
	fontOverrides: Partial<Record<keyof ThemeTypography, string>>;
	layoutHtml: string; // outerHTML of .layout from the live DOM (with mermaid SVGs already in place)
}

/**
 * Build a fully self-contained HTML document from the live DOM state:
 * - Inlined base.css + active theme CSS + user overrides
 * - Google Fonts link for the active theme
 * - Vanilla tab-switch JS (no SvelteKit hydration needed)
 * - Mermaid diagrams are baked into the layoutHtml as pre-rendered SVG
 *   by the live mermaid renderer — caller is responsible for passing
 *   an up-to-date layoutHtml
 */
export function exportHtml(opts: ExportOptions): string {
	const theme = themes[opts.themeId];
	const fontsLink = theme.tokens.fontsHref
		? `<link rel="stylesheet" href="${escapeHtml(theme.tokens.fontsHref)}">`
		: '';
	const overrideRule = buildOverrideRule(opts.colorOverrides, opts.fontOverrides);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
${fontsLink}
<style>
${baseCss}
</style>
<style>
${theme.css}
</style>${overrideRule ? `\n<style>\n${overrideRule}\n</style>` : ''}
</head>
<body>
${opts.layoutHtml}
<script>
${TAB_SWITCH_JS}
</script>
</body>
</html>
`;
}
