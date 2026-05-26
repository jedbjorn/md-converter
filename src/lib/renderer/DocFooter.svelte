<script lang="ts">
	import type { Frontmatter } from '$lib/parser/types';

	interface Props {
		frontmatter: Frontmatter;
	}

	let { frontmatter }: Props = $props();

	const items = $derived(
		[
			frontmatter.date ? { key: 'date', label: 'Date', value: frontmatter.date } : null,
			frontmatter.project
				? { key: 'project', label: 'Project', value: frontmatter.project }
				: null,
			frontmatter.purpose
				? { key: 'purpose', label: 'Purpose', value: frontmatter.purpose }
				: null
		].filter((x): x is { key: string; label: string; value: string } => x !== null)
	);
</script>

{#if items.length > 0}
	<footer class="doc-footer">
		{#each items as item (item.key)}
			<div class="meta-item" data-key={item.key}>
				<div class="meta-label">{item.label}</div>
				<div class="meta-value">{item.value}</div>
			</div>
		{/each}
	</footer>
{/if}
