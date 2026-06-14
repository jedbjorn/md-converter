<script lang="ts">
	import type { Tab } from '../parser/types';

	interface Props {
		title: string;
		tabs: Tab[];
		activeSlug: string;
		onSelect: (slug: string) => void;
	}

	let { title, tabs, activeSlug, onSelect }: Props = $props();
</script>

<aside class="sidebar">
	<div class="brand">
		<div class="brand-name">{title}</div>
	</div>
	<ul class="tab-nav">
		{#each tabs as tab (tab.slug)}
			<li>
				<button
					class:active={tab.slug === activeSlug}
					data-tab={tab.slug}
					onclick={() => onSelect(tab.slug)}
				>
					<span class="tab-num"></span>{tab.heading}
				</button>
			</li>
		{/each}
	</ul>
</aside>
