<script lang="ts">
	import { parse } from '$lib/parser';
	import { DocLayout } from '$lib/renderer';
	import '$lib/renderer/base.css';
	import demoSource from '$lib/fixtures/demo.md?raw';
	import { applyTheme, preloadAllFonts, themes, type ThemeId } from '$lib/themes';
	import type { ThemeColors, ThemeTypography } from '$lib/themes/types';
	import { StyleSidebar } from '$lib/sidebar';
	import { renderMermaidAll } from '$lib/renderer/mermaid';
	import {
		exportConfig,
		parseConfig,
		downloadFile,
		pickFile,
		exportHtml
	} from '$lib/export';

	const ir = parse(demoSource);

	let activeTheme = $state<ThemeId>('editorial');
	let colorOverrides = $state<Partial<Record<keyof ThemeColors, string>>>({});
	let fontOverrides = $state<Partial<Record<keyof ThemeTypography, string>>>({});
	let sidebarOpen = $state(false);
	let toast = $state<string | null>(null);

	const COLOR_KEYS: (keyof ThemeColors)[] = [
		'bg', 'bg-2', 'bg-3', 'text', 'text-soft', 'rule', 'rule-soft',
		'accent', 'class1', 'class2', 'class3', 'class4'
	];
	const FONT_KEYS: (keyof ThemeTypography)[] = ['font-display', 'font-body', 'font-mono'];

	$effect(() => {
		preloadAllFonts();
	});

	$effect(() => {
		applyTheme(activeTheme);
	});

	$effect(() => {
		const root = document.documentElement;
		for (const key of COLOR_KEYS) {
			const v = colorOverrides[key];
			if (v) root.style.setProperty(`--${key}`, v);
			else root.style.removeProperty(`--${key}`);
		}
		for (const key of FONT_KEYS) {
			const v = fontOverrides[key];
			if (v) root.style.setProperty(`--${key}`, v);
			else root.style.removeProperty(`--${key}`);
		}
	});

	// Re-render mermaid whenever the theme or any class color changes
	$effect(() => {
		void activeTheme;
		void colorOverrides.class1;
		void colorOverrides.class2;
		void colorOverrides.class3;
		void colorOverrides.class4;
		void colorOverrides.bg;
		void colorOverrides.text;

		const theme = themes[activeTheme];
		const colors = { ...theme.tokens.colors, ...colorOverrides } as ThemeColors;
		const textColor = colorOverrides.text ?? theme.tokens.colors.text;

		// Wait for theme CSS + override style mutations to be applied first
		requestAnimationFrame(() => {
			renderMermaidAll(colors, textColor, theme.tokens.mode);
		});
	});

	function setTheme(id: ThemeId) {
		activeTheme = id;
		colorOverrides = {};
		fontOverrides = {};
	}

	function resetOverrides() {
		colorOverrides = {};
		fontOverrides = {};
	}

	function showToast(msg: string) {
		toast = msg;
		setTimeout(() => {
			if (toast === msg) toast = null;
		}, 2200);
	}

	function handleExportConfig() {
		const json = exportConfig(activeTheme, colorOverrides, fontOverrides);
		const slug = activeTheme;
		downloadFile(`md-converter-${slug}.config.json`, json, 'application/json');
		showToast('Config downloaded');
	}

	async function handleImportConfig() {
		const text = await pickFile('application/json,.json');
		if (!text) return;
		const result = parseConfig(text);
		if (!result.ok) {
			showToast(`Import failed: ${result.error}`);
			return;
		}
		activeTheme = result.config.theme;
		colorOverrides = result.config.colorOverrides;
		fontOverrides = result.config.fontOverrides;
		showToast('Config imported');
	}

	function handleExportHtml() {
		const layout = document.querySelector('.layout');
		if (!layout) {
			showToast('Nothing to export');
			return;
		}
		const html = exportHtml({
			title: ir.title,
			themeId: activeTheme,
			colorOverrides,
			fontOverrides,
			layoutHtml: layout.outerHTML
		});
		const filename = ir.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'document';
		downloadFile(`${filename}.html`, html, 'text/html');
		showToast('HTML exported');
	}
</script>

<svelte:head>
	<title>{ir.title}</title>
</svelte:head>

<DocLayout {ir} />

<StyleSidebar
	bind:themeId={activeTheme}
	bind:colorOverrides
	bind:fontOverrides
	bind:open={sidebarOpen}
	onThemeChange={setTheme}
	onClose={() => (sidebarOpen = false)}
	onReset={resetOverrides}
	onExportConfig={handleExportConfig}
	onImportConfig={handleImportConfig}
	onExportHtml={handleExportHtml}
/>

{#if toast}
	<div class="toast" role="status">{toast}</div>
{/if}

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') sidebarOpen = false;
	}}
/>

<style>
	.toast {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(20, 20, 25, 0.92);
		color: #fff;
		padding: 0.6rem 1.2rem;
		border-radius: 4px;
		z-index: 300;
		font: 500 13px ui-sans-serif, system-ui, sans-serif;
		box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
	}
</style>
