<script lang="ts">
	import { themes, themeIds, type ThemeId } from '../themes';
	import type { ThemeColors, ThemeTypography } from '../themes/types';
	import { FONT_OPTIONS, GROUP_LABELS, type FontOption } from './fonts';

	type ColorKey = keyof ThemeColors;
	type FontKey = keyof ThemeTypography;

	interface Props {
		themeId: ThemeId;
		colorOverrides: Partial<Record<ColorKey, string>>;
		fontOverrides: Partial<Record<FontKey, string>>;
		open: boolean;
		onThemeChange: (id: ThemeId) => void;
		onClose: () => void;
		onReset: () => void;
		onExportConfig: () => void;
		onImportConfig: () => void;
		onExportHtml: () => void;
		onDownloadGuide: () => void;
		onUploadMd: () => void;
		onCopyShareLink: () => void;
	}

	let {
		themeId = $bindable(),
		colorOverrides = $bindable(),
		fontOverrides = $bindable(),
		open = $bindable(),
		onThemeChange,
		onClose,
		onReset,
		onExportConfig,
		onImportConfig,
		onExportHtml,
		onDownloadGuide,
		onUploadMd,
		onCopyShareLink
	}: Props = $props();

	const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
		{ key: 'bg', label: 'Background' },
		{ key: 'bg-2', label: 'Background alt' },
		{ key: 'bg-3', label: 'Background elev' },
		{ key: 'text', label: 'Text' },
		{ key: 'text-soft', label: 'Text soft' },
		{ key: 'rule', label: 'Rule' },
		{ key: 'rule-soft', label: 'Rule soft' },
		{ key: 'accent', label: 'Accent' },
		{ key: 'class1', label: 'Class 1' },
		{ key: 'class2', label: 'Class 2' },
		{ key: 'class3', label: 'Class 3' },
		{ key: 'class4', label: 'Class 4' }
	];

	const FONT_FIELDS: { key: FontKey; label: string }[] = [
		{ key: 'font-display', label: 'Display font' },
		{ key: 'font-body', label: 'Body font' },
		{ key: 'font-mono', label: 'Monospace font' }
	];

	const activeTokens = $derived(themes[themeId].tokens);

	// Resolved value per token: override if set, else theme default
	function colorOf(key: ColorKey): string {
		return colorOverrides[key] ?? activeTokens.colors[key];
	}

	function fontOf(key: FontKey): string {
		return fontOverrides[key] ?? activeTokens.typography[key];
	}

	function setColor(key: ColorKey, value: string) {
		colorOverrides = { ...colorOverrides, [key]: value };
	}

	function setFont(key: FontKey, value: string) {
		fontOverrides = { ...fontOverrides, [key]: value };
	}

	function clearColor(key: ColorKey) {
		const { [key]: _drop, ...rest } = colorOverrides;
		colorOverrides = rest;
	}

	function clearFont(key: FontKey) {
		const { [key]: _drop, ...rest } = fontOverrides;
		fontOverrides = rest;
	}

	function isCustomFont(key: FontKey): boolean {
		const v = fontOf(key);
		return !FONT_OPTIONS.some((opt) => opt.value === v);
	}

	function selectChange(key: FontKey, value: string) {
		if (value === '__custom') {
			// Switch to custom mode by setting an override that doesn't match any option
			setFont(key, fontOf(key));
		} else {
			setFont(key, value);
		}
	}

	// Group font options for the <optgroup> structure
	const groupedFonts = (() => {
		const groups: Record<string, FontOption[]> = {};
		for (const opt of FONT_OPTIONS) {
			(groups[opt.group] ||= []).push(opt);
		}
		return groups;
	})();
</script>

<button class="ss-toggle" class:ss-toggle--hidden={open} onclick={() => (open = !open)}>
	Style
</button>

<aside class="ss-panel" class:ss-panel--open={open} aria-hidden={!open}>
	<header class="ss-header">
		<h2>Style</h2>
		<button class="ss-close" onclick={onClose} aria-label="Close style panel">×</button>
	</header>

	<div class="ss-actions">
		<button class="ss-btn ss-btn--primary" onclick={onUploadMd}>Upload markdown</button>
		<button class="ss-btn" onclick={onCopyShareLink}>Copy share link</button>
		<button class="ss-btn" onclick={onExportHtml}>Export HTML</button>
		<div class="ss-btn-row">
			<button class="ss-btn ss-btn--half" onclick={onExportConfig}>Export config</button>
			<button class="ss-btn ss-btn--half" onclick={onImportConfig}>Import config</button>
		</div>
		<button class="ss-btn ss-btn--ghost" onclick={onDownloadGuide}> Download Skill for AI </button>
	</div>

	<section class="ss-section">
		<h3>Theme</h3>
		<div class="ss-themes">
			{#each themeIds as id (id)}
				<button
					class="ss-theme"
					class:ss-theme--active={themeId === id}
					onclick={() => onThemeChange(id)}
				>
					<span class="ss-theme-swatch" style:background={themes[id].tokens.colors.bg}>
						<span style:background={themes[id].tokens.colors.accent}></span>
					</span>
					<span class="ss-theme-label">{themes[id].label}</span>
				</button>
			{/each}
		</div>
	</section>

	<section class="ss-section">
		<h3>Colors</h3>
		<div class="ss-fields">
			{#each COLOR_FIELDS as field (field.key)}
				{@const overridden = colorOverrides[field.key] !== undefined}
				<div class="ss-row">
					<label class="ss-label" for="ss-color-{field.key}">{field.label}</label>
					<div class="ss-input-group">
						<input
							id="ss-color-{field.key}"
							type="color"
							value={colorOf(field.key)}
							oninput={(e) => setColor(field.key, e.currentTarget.value)}
						/>
						<input
							type="text"
							class="ss-hex"
							value={colorOf(field.key)}
							oninput={(e) => setColor(field.key, e.currentTarget.value)}
						/>
						<button
							class="ss-reset"
							class:ss-reset--shown={overridden}
							onclick={() => clearColor(field.key)}
							aria-label="Reset {field.label}"
							title="Reset to theme default">↻</button
						>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="ss-section">
		<h3>Typography</h3>
		<div class="ss-fields">
			{#each FONT_FIELDS as field (field.key)}
				{@const overridden = fontOverrides[field.key] !== undefined}
				{@const custom = isCustomFont(field.key)}
				<div class="ss-row ss-row--stack">
					<label class="ss-label" for="ss-font-{field.key}">{field.label}</label>
					<div class="ss-input-group">
						<select
							id="ss-font-{field.key}"
							value={custom ? '__custom' : fontOf(field.key)}
							onchange={(e) => selectChange(field.key, e.currentTarget.value)}
						>
							{#each Object.entries(groupedFonts) as [group, opts] (group)}
								<optgroup label={GROUP_LABELS[group as FontOption['group']]}>
									{#each opts as opt (opt.value)}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</optgroup>
							{/each}
							<option value="__custom">Custom…</option>
						</select>
						<button
							class="ss-reset"
							class:ss-reset--shown={overridden}
							onclick={() => clearFont(field.key)}
							aria-label="Reset {field.label}"
							title="Reset to theme default">↻</button
						>
					</div>
					{#if custom}
						<input
							type="text"
							class="ss-font-custom"
							value={fontOf(field.key)}
							placeholder="e.g. 'My Font', serif"
							oninput={(e) => setFont(field.key, e.currentTarget.value)}
						/>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<footer class="ss-footer">
		<button class="ss-btn ss-btn--ghost" onclick={onReset}>Reset overrides</button>
		<nav class="ss-legal" aria-label="Legal">
			<a href="/privacy">Privacy</a>
			<span aria-hidden="true">·</span>
			<a href="/terms">Terms</a>
		</nav>
	</footer>
</aside>

<style>
	.ss-toggle {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 200;
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.25);
		padding: 0.5rem 1rem;
		border-radius: 3px;
		cursor: pointer;
		font:
			500 0.8rem ui-sans-serif,
			system-ui,
			sans-serif;
		letter-spacing: 0.05em;
	}
	.ss-toggle--hidden {
		display: none;
	}
	.ss-toggle:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.ss-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 340px;
		max-width: 100vw;
		height: 100vh;
		z-index: 250;
		background: #1a1a1f;
		color: #e8e4d8;
		font:
			400 13px/1.5 ui-sans-serif,
			system-ui,
			sans-serif;
		border-left: 1px solid #303034;
		box-shadow: -8px 0 24px rgba(0, 0, 0, 0.4);
		transform: translateX(100%);
		transition: transform 200ms ease;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}
	.ss-panel--open {
		transform: translateX(0);
	}

	.ss-header {
		position: sticky;
		top: 0;
		padding: 1rem 1.25rem;
		background: #1a1a1f;
		border-bottom: 1px solid #303034;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 1;
	}
	.ss-header h2 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #b0b0b8;
	}
	.ss-close {
		background: none;
		border: 0;
		color: #8a8a96;
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.25rem;
	}
	.ss-close:hover {
		color: #fff;
	}

	.ss-actions {
		padding: 1rem 1.25rem 1.25rem;
		border-bottom: 1px solid #2a2a30;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ss-section {
		padding: 1rem 1.25rem 1.25rem;
		border-bottom: 1px solid #2a2a30;
	}
	.ss-section h3 {
		margin: 0 0 0.75rem;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #6a6a76;
	}

	.ss-themes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	.ss-theme {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #232328;
		border: 1px solid #303034;
		border-radius: 3px;
		padding: 0.5rem;
		cursor: pointer;
		color: inherit;
		font: inherit;
		text-align: left;
	}
	.ss-theme:hover {
		background: #2a2a30;
	}
	.ss-theme--active {
		border-color: #6a6a76;
		background: #2a2a30;
	}
	.ss-theme-swatch {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		flex-shrink: 0;
		position: relative;
		display: inline-block;
		border: 1px solid #303034;
	}
	.ss-theme-swatch span {
		position: absolute;
		inset: 6px;
		border-radius: 50%;
		display: block;
	}
	.ss-theme-label {
		font-size: 12px;
	}

	.ss-fields {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.ss-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.ss-row--stack {
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
	}
	.ss-label {
		flex: 1;
		font-size: 12px;
		color: #b0b0b8;
	}
	.ss-input-group {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-shrink: 0;
	}
	.ss-row--stack .ss-input-group {
		width: 100%;
	}

	input[type='color'] {
		width: 28px;
		height: 24px;
		padding: 0;
		border: 1px solid #303034;
		border-radius: 3px;
		background: #232328;
		cursor: pointer;
	}
	.ss-hex {
		width: 80px;
		font:
			400 11px ui-monospace,
			monospace;
		padding: 0.25rem 0.4rem;
		background: #232328;
		color: inherit;
		border: 1px solid #303034;
		border-radius: 3px;
	}
	select {
		flex: 1;
		min-width: 0;
		font:
			400 12px ui-sans-serif,
			system-ui,
			sans-serif;
		padding: 0.3rem 0.4rem;
		background: #232328;
		color: inherit;
		border: 1px solid #303034;
		border-radius: 3px;
	}
	.ss-font-custom {
		width: 100%;
		font:
			400 12px ui-monospace,
			monospace;
		padding: 0.3rem 0.4rem;
		background: #232328;
		color: inherit;
		border: 1px solid #303034;
		border-radius: 3px;
	}
	.ss-reset {
		visibility: hidden;
		background: none;
		border: 0;
		color: #6a6a76;
		cursor: pointer;
		font-size: 14px;
		padding: 0 0.25rem;
	}
	.ss-reset--shown {
		visibility: visible;
	}
	.ss-reset:hover {
		color: #fff;
	}

	.ss-footer {
		padding: 1rem 1.25rem;
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.ss-btn-row {
		display: flex;
		gap: 0.5rem;
	}
	.ss-btn {
		width: 100%;
		background: #2a2a30;
		color: inherit;
		border: 1px solid #303034;
		padding: 0.5rem;
		border-radius: 3px;
		cursor: pointer;
		font:
			500 12px ui-sans-serif,
			system-ui,
			sans-serif;
		letter-spacing: 0.05em;
	}
	.ss-btn:hover {
		background: #34343a;
	}
	.ss-btn--half {
		flex: 1;
	}
	.ss-btn--ghost {
		background: transparent;
		color: #6a6a76;
	}
	.ss-btn--ghost:hover {
		background: #232328;
		color: #b0b0b8;
	}

	.ss-legal {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		font:
			11px ui-sans-serif,
			system-ui,
			sans-serif;
		color: #5a5a64;
		padding-top: 0.25rem;
	}
	.ss-legal a {
		color: #6a6a76;
		text-decoration: none;
	}
	.ss-legal a:hover {
		color: #b0b0b8;
		text-decoration: underline;
	}
	.ss-btn--primary {
		background: #4a6fa5;
		border-color: #5a7fb5;
		color: #fff;
	}
	.ss-btn--primary:hover {
		background: #5a7fb5;
	}
</style>
