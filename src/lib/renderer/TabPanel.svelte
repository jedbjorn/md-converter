<script lang="ts">
	import type { Tab } from '$lib/parser/types';
	import { renderTokens } from './render-html';

	interface Props {
		tab: Tab;
		isActive: boolean;
		isFirst: boolean;
	}

	let { tab, isActive, isFirst }: Props = $props();

	const body = $derived(renderTokens(tab.tokens));
</script>

<article
	class="tab-panel"
	class:active={isActive}
	class:first-tab={isFirst}
	id={tab.slug}
	data-tab={tab.slug}
>
	{#if tab.heading}
		<h1 class="doc-tab-heading">{tab.heading}</h1>
	{/if}
	{@html body}
</article>
