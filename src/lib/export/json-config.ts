import type { ThemeColors, ThemeTypography } from '../themes/types';
import type { ThemeId } from '../themes';
import { themeIds } from '../themes';

export interface SavedConfig {
	version: 1;
	theme: ThemeId;
	colorOverrides: Partial<Record<keyof ThemeColors, string>>;
	fontOverrides: Partial<Record<keyof ThemeTypography, string>>;
}

export function exportConfig(
	theme: ThemeId,
	colorOverrides: Partial<Record<keyof ThemeColors, string>>,
	fontOverrides: Partial<Record<keyof ThemeTypography, string>>
): string {
	const config: SavedConfig = {
		version: 1,
		theme,
		colorOverrides,
		fontOverrides
	};
	return JSON.stringify(config, null, 2);
}

export type ParseResult =
	| { ok: true; config: SavedConfig }
	| { ok: false; error: string };

const COLOR_KEYS: (keyof ThemeColors)[] = [
	'bg', 'bg-2', 'bg-3', 'text', 'text-soft', 'rule', 'rule-soft',
	'accent', 'class1', 'class2', 'class3', 'class4'
];
const FONT_KEYS: (keyof ThemeTypography)[] = ['font-display', 'font-body', 'font-mono'];

export function parseConfig(json: string): ParseResult {
	let data: unknown;
	try {
		data = JSON.parse(json);
	} catch (err) {
		return { ok: false, error: `Not valid JSON: ${(err as Error).message}` };
	}
	if (typeof data !== 'object' || data === null) {
		return { ok: false, error: 'Config must be an object' };
	}
	const obj = data as Record<string, unknown>;
	if (obj.version !== 1) {
		return { ok: false, error: `Unsupported version ${String(obj.version)}` };
	}
	if (typeof obj.theme !== 'string' || !themeIds.includes(obj.theme as ThemeId)) {
		return { ok: false, error: `Unknown theme: ${String(obj.theme)}` };
	}

	const colorOverrides: Partial<Record<keyof ThemeColors, string>> = {};
	if (obj.colorOverrides && typeof obj.colorOverrides === 'object') {
		const co = obj.colorOverrides as Record<string, unknown>;
		for (const key of COLOR_KEYS) {
			const v = co[key];
			if (typeof v === 'string' && v.length > 0) colorOverrides[key] = v;
		}
	}

	const fontOverrides: Partial<Record<keyof ThemeTypography, string>> = {};
	if (obj.fontOverrides && typeof obj.fontOverrides === 'object') {
		const fo = obj.fontOverrides as Record<string, unknown>;
		for (const key of FONT_KEYS) {
			const v = fo[key];
			if (typeof v === 'string' && v.length > 0) fontOverrides[key] = v;
		}
	}

	return {
		ok: true,
		config: { version: 1, theme: obj.theme as ThemeId, colorOverrides, fontOverrides }
	};
}

/**
 * Trigger a browser file download with the given filename + content.
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Read a user-selected file as text. Returns null on cancel.
 */
export function pickFile(accept: string): Promise<string | null> {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = accept;
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) {
				resolve(null);
				return;
			}
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => resolve(null);
			reader.readAsText(file);
		};
		input.click();
	});
}
