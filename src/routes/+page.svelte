<script lang="ts">
	import { parse } from '$lib/parser';
	import { DocLayout } from '$lib/renderer';
	import '$lib/renderer/base.css';
	import demoSource from '$lib/fixtures/demo.md?raw';

	const ir = parse(demoSource);
</script>

<svelte:head>
	<title>{ir.title}</title>
</svelte:head>

<DocLayout {ir} />
