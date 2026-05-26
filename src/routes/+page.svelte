<script lang="ts">
	import { parse } from '$lib/parser';
	import { DocLayout } from '$lib/renderer';
	import '$lib/renderer/base.css';
	import demoSource from '$lib/fixtures/demo.md?raw';
	import { themes, themeIds, applyTheme, type ThemeId } from '$lib/themes';

	const ir = parse(demoSource);

	let active = $state<ThemeId>('editorial');

	$effect(() => {
		applyTheme(active);
	});
</script>

<svelte:head>
	<title>{ir.title}</title>
</svelte:head>

<div class="theme-picker">
	{#each themeIds as id (id)}
		<button class:is-active={active === id} onclick={() => (active = id)}>
			{themes[id].label}
		</button>
	{/each}
</div>

<DocLayout {ir} />

<style>
	.theme-picker {
		position: fixed;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 100;
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 4px;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.75rem;
	}
	.theme-picker button {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.25);
		padding: 0.25rem 0.5rem;
		border-radius: 2px;
		cursor: pointer;
		font: inherit;
	}
	.theme-picker button.is-active {
		background: #fff;
		color: #000;
	}
</style>
