<script lang="ts">
	import type { IR } from '../parser/types';
	import { renderTokens } from './render-html';

	interface Props {
		ir: IR;
		// Bindable so the parent can observe the active slide (parity with DocLayout's
		// activeSlug — e.g. to coordinate re-renders). Defaults to the first slide.
		active?: number;
	}

	let { ir, active = $bindable(0) }: Props = $props();

	const slides = $derived(
		ir.tabs.map((t, i) => ({
			heading: t.heading,
			label: t.heading || `Slide ${i + 1}`,
			body: renderTokens(t.tokens)
		}))
	);

	// Keep `active` in range if the doc (and thus slide count) changes underneath us.
	$effect(() => {
		if (active > slides.length - 1) active = Math.max(0, slides.length - 1);
	});

	// Circular: stepping past either end wraps around, so the deck is an endless
	// loop you can dial through in one direction.
	function go(i: number) {
		const n = slides.length;
		if (n === 0) return;
		active = ((i % n) + n) % n;
	}

	function onKeydown(e: KeyboardEvent) {
		// Don't hijack arrows while the user is typing in the style panel.
		const t = e.target as HTMLElement | null;
		if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
		if (e.key === 'ArrowRight' || e.key === ' ') {
			go(active + 1);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft') {
			go(active - 1);
			e.preventDefault();
		} else if (e.key === 'Home') {
			go(0);
		} else if (e.key === 'End') {
			go(slides.length - 1);
		}
	}

	// Flat centred strip: position each dock item by its *circular* distance from
	// the active slide — active centred and full-size, neighbours flanking it and
	// fading out, wrapping seamlessly end-to-start. No arc; the active item is
	// marked by scale + the centre glow alone.
	// (Keep these constants in sync with DECK_NAV_JS in export/html-export.ts.)
	const DIAL_WINDOW = 4; // items shown each side of centre
	function dialStyle(i: number): string {
		const n = slides.length || 1;
		let d = i - active;
		if (d > n / 2) d -= n;
		if (d < -n / 2) d += n;
		const ad = Math.abs(d);
		const x = d * 60;
		const scale = Math.max(0.6, 1 - ad * 0.08);
		const op = ad > DIAL_WINDOW ? 0 : Math.max(0, 1 - ad / (DIAL_WINDOW + 1));
		const pe = ad > DIAL_WINDOW ? 'none' : 'auto';
		return `transform: translateX(calc(-50% + ${x}px)) scale(${scale}); opacity: ${op}; z-index: ${100 - Math.round(ad)}; pointer-events: ${pe};`;
	}

	const pct = $derived(slides.length ? ((active + 1) / slides.length) * 100 : 0);
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<svelte:window onkeydown={onKeydown} />

<div class="deck-root">
<div class="deck-progress" style:width="{pct}%"></div>

<div class="deck">
	{#each slides as slide, i (i)}
		<section class="slide" class:active={i === active} data-slide={i}>
			<div class="slide-inner">
				<div class="deck-head">
					{#if ir.title}<div class="deck-brand">{ir.title}</div>{/if}
					{#if slide.heading}<h2 class="deck-heading">{slide.heading}</h2>{/if}
				</div>
				<div class="deck-body">{@html slide.body}</div>
			</div>
		</section>
	{/each}
</div>

<button class="deck-arrow prev" onclick={() => go(active - 1)} aria-label="Previous slide">‹</button>
<button class="deck-arrow next" onclick={() => go(active + 1)} aria-label="Next slide">›</button>

<div class="deck-dock-wrap">
	<div class="deck-dock" role="group" aria-label="Slide navigation">
		{#each slides as slide, i (i)}
			<button
				class="deck-dock-item"
				class:active={i === active}
				style={dialStyle(i)}
				onclick={() => go(i)}
				aria-current={i === active}
				aria-label="Go to slide {i + 1}: {slide.label}"
				title={slide.label}
			>
				<span class="deck-dock-num">{i + 1}</span>
				<span class="deck-dock-label">{slide.label}</span>
			</button>
		{/each}
	</div>
</div>

<div class="deck-counter">{pad(active + 1)} / {pad(slides.length)}</div>
</div>
