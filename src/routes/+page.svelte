<script lang="ts">
	import { parse } from '$lib/parser';
	import { DocLayout } from '$lib/renderer';
	import '$lib/renderer/base.css';
	import demoSource from '$lib/fixtures/demo.md?raw';
	import skillSource from '../../docs/spec/themed-markdown.skill.md?raw';
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

	const STORAGE_KEY = 'md-converter-config-v1';

	let ir = $state(parse(demoSource));
	let activeSlug = $state('');

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

	// Restore from localStorage once on mount (no reactive deps → runs once)
	$effect(() => {
		if (typeof localStorage === 'undefined') return;
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;
		const result = parseConfig(stored);
		if (!result.ok) return;
		activeTheme = result.config.theme;
		colorOverrides = result.config.colorOverrides;
		fontOverrides = result.config.fontOverrides;
	});

	// Persist on every change
	$effect(() => {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				exportConfig(activeTheme, colorOverrides, fontOverrides)
			);
		} catch {
			// localStorage may be full or disabled — silently degrade
		}
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

	// Re-render mermaid whenever theme, class colors, IR, or active tab changes.
	// Tab dep covers diagrams in initially-hidden panels: mermaid measures from
	// the live DOM, so a panel that was display:none on first render produces
	// 0-sized SVG. Re-running on slug change gives those panels a render pass
	// while they're actually visible.
	$effect(() => {
		void ir;
		void activeSlug;
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

	function handleDownloadSkill() {
		downloadFile('themed-markdown.skill.md', skillSource, 'text/markdown');
		showToast('Skill downloaded');
	}

	function sizeWarning(parsed: typeof ir): string | null {
		const tabs = parsed.tabs.length;
		let mermaid = 0;
		for (const tab of parsed.tabs) {
			for (const tok of tab.tokens) if (tok.type === 'mermaid_block') mermaid++;
		}
		const flags: string[] = [];
		if (tabs >= 25) flags.push(`${tabs} sections`);
		if (mermaid >= 15) flags.push(`${mermaid} diagrams`);
		if (flags.length === 0) return null;
		return `Loaded — large doc (${flags.join(', ')}). Tab switches and theme changes may lag.`;
	}

	async function handleUploadMd() {
		const text = await pickFile('text/markdown,.md,.markdown');
		if (!text) return;
		try {
			ir = parse(text);
			showToast(sizeWarning(ir) ?? 'Markdown loaded');
		} catch (err) {
			showToast(`Parse failed: ${(err as Error).message}`);
		}
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

<DocLayout {ir} bind:activeSlug />

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
	onDownloadGuide={handleDownloadSkill}
	onUploadMd={handleUploadMd}
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
