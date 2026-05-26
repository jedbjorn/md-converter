<script lang="ts">
	import { parse } from '$lib/parser';
	import { DocLayout } from '$lib/renderer';
	import '$lib/renderer/base.css';
	import demoSource from '$lib/fixtures/demo.md?raw';
	import { applyTheme, preloadAllFonts, type ThemeId } from '$lib/themes';
	import type { ThemeColors, ThemeTypography } from '$lib/themes/types';
	import { StyleSidebar } from '$lib/sidebar';

	const ir = parse(demoSource);

	let activeTheme = $state<ThemeId>('editorial');
	let colorOverrides = $state<Partial<Record<keyof ThemeColors, string>>>({});
	let fontOverrides = $state<Partial<Record<keyof ThemeTypography, string>>>({});
	let sidebarOpen = $state(false);

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

	function setTheme(id: ThemeId) {
		activeTheme = id;
		colorOverrides = {};
		fontOverrides = {};
	}

	function resetOverrides() {
		colorOverrides = {};
		fontOverrides = {};
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
/>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') sidebarOpen = false;
	}}
/>
