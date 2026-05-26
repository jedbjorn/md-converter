<script lang="ts">
	import type { IR } from '$lib/parser/types';
	import Sidebar from './Sidebar.svelte';
	import TabPanel from './TabPanel.svelte';
	import DocFooter from './DocFooter.svelte';

	interface Props {
		ir: IR;
	}

	let { ir }: Props = $props();

	// Initial-tab capture is intentional; the effect below resyncs if the IR
	// is later swapped (e.g. user uploads a new doc) to a tab set that doesn't
	// contain the current slug.
	// svelte-ignore state_referenced_locally
	let activeSlug = $state(ir.tabs[0]?.slug ?? '');

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
			<TabPanel {tab} isActive={tab.slug === activeSlug} isFirst={i === 0} />
		{/each}
		<DocFooter frontmatter={ir.frontmatter} />
	</main>
</div>
