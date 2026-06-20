<script lang="ts">
	import type { IR } from '../parser/types';
	import Sidebar from './Sidebar.svelte';
	import TabPanel from './TabPanel.svelte';
	import DocFooter from './DocFooter.svelte';

	interface Props {
		ir: IR;
		activeSlug?: string;
	}

	// activeSlug is bindable so the parent can observe tab changes
	// (e.g. to re-render mermaid when a previously-hidden tab becomes visible).
	// Defaults to the first tab's slug; parent doesn't need to seed.
	// svelte-ignore state_referenced_locally
	let { ir, activeSlug = $bindable(ir.tabs[0]?.slug ?? '') }: Props = $props();

	$effect(() => {
		if (!ir.tabs.some((t) => t.slug === activeSlug)) {
			activeSlug = ir.tabs[0]?.slug ?? '';
		}
	});

	// Up/Down step through tabs (parity with the deck's Left/Right). Clamped — a
	// document has a top and a bottom, unlike the deck's circular dial.
	function move(delta: number) {
		const i = ir.tabs.findIndex((t) => t.slug === activeSlug);
		const cur = i < 0 ? 0 : i;
		const next = Math.max(0, Math.min(ir.tabs.length - 1, cur + delta));
		activeSlug = ir.tabs[next]?.slug ?? activeSlug;
	}

	function onKeydown(e: KeyboardEvent) {
		const t = e.target as HTMLElement | null;
		if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
		if (e.key === 'ArrowDown' || e.key === 'PageDown') {
			move(1);
			e.preventDefault();
		} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
			move(-1);
			e.preventDefault();
		} else if (e.key === 'Home') {
			activeSlug = ir.tabs[0]?.slug ?? activeSlug;
		} else if (e.key === 'End') {
			activeSlug = ir.tabs[ir.tabs.length - 1]?.slug ?? activeSlug;
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="layout">
	<Sidebar title={ir.title} tabs={ir.tabs} {activeSlug} onSelect={(s) => (activeSlug = s)} />
	<main class="main">
		{#each ir.tabs as tab, i (tab.slug)}
			<TabPanel {tab} index={i} isActive={tab.slug === activeSlug} isFirst={i === 0} />
		{/each}
		<DocFooter frontmatter={ir.frontmatter} />
	</main>
</div>
