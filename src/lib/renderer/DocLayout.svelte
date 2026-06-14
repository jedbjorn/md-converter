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
</script>

<div class="layout">
	<Sidebar title={ir.title} tabs={ir.tabs} {activeSlug} onSelect={(s) => (activeSlug = s)} />
	<main class="main">
		{#each ir.tabs as tab, i (tab.slug)}
			<TabPanel {tab} index={i} isActive={tab.slug === activeSlug} isFirst={i === 0} />
		{/each}
		<DocFooter frontmatter={ir.frontmatter} />
	</main>
</div>
