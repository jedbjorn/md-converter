import { describe, it, expect } from 'vitest';
import { exportConfig, parseConfig } from './json-config';

describe('exportConfig', () => {
	it('produces a stable shape with version 1', () => {
		const json = exportConfig('editorial', { accent: '#ff00ff' }, { 'font-body': 'sans' });
		const parsed = JSON.parse(json);
		expect(parsed.version).toBe(1);
		expect(parsed.theme).toBe('editorial');
		expect(parsed.colorOverrides).toEqual({ accent: '#ff00ff' });
		expect(parsed.fontOverrides).toEqual({ 'font-body': 'sans' });
	});

	it('omits nothing — empty overrides serialize as empty objects', () => {
		const parsed = JSON.parse(exportConfig('bauhaus', {}, {}));
		expect(parsed.colorOverrides).toEqual({});
		expect(parsed.fontOverrides).toEqual({});
	});
});

describe('parseConfig — accepts valid input', () => {
	it('round-trips an exported config', () => {
		const json = exportConfig('terminal', { accent: '#abc' }, { 'font-mono': 'm' });
		const result = parseConfig(json);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.config.theme).toBe('terminal');
		expect(result.config.colorOverrides.accent).toBe('#abc');
		expect(result.config.fontOverrides['font-mono']).toBe('m');
	});

	it('accepts a config with no overrides', () => {
		const result = parseConfig(JSON.stringify({ version: 1, theme: 'atelier' }));
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.config.colorOverrides).toEqual({});
		expect(result.config.fontOverrides).toEqual({});
	});
});

describe('parseConfig — rejects bad input', () => {
	it('rejects invalid JSON', () => {
		const r = parseConfig('{not json');
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.error).toMatch(/Not valid JSON/);
	});

	it('rejects non-object payloads', () => {
		const r = parseConfig('"a string"');
		expect(r.ok).toBe(false);
	});

	it('rejects unknown version', () => {
		const r = parseConfig(JSON.stringify({ version: 2, theme: 'editorial' }));
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.error).toMatch(/Unsupported version/);
	});

	it('rejects unknown theme id', () => {
		const r = parseConfig(JSON.stringify({ version: 1, theme: 'invalid' }));
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.error).toMatch(/Unknown theme/);
	});
});

describe('parseConfig — filters unknown keys', () => {
	it('drops color keys that are not in the canonical schema', () => {
		const r = parseConfig(
			JSON.stringify({
				version: 1,
				theme: 'editorial',
				colorOverrides: { accent: '#fff', bogus: '#000' }
			})
		);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.config.colorOverrides.accent).toBe('#fff');
		expect('bogus' in r.config.colorOverrides).toBe(false);
	});

	it('drops font keys that are not in the canonical schema', () => {
		const r = parseConfig(
			JSON.stringify({
				version: 1,
				theme: 'editorial',
				fontOverrides: { 'font-body': 'ok', 'font-bogus': 'no' }
			})
		);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.config.fontOverrides['font-body']).toBe('ok');
		expect('font-bogus' in r.config.fontOverrides).toBe(false);
	});

	it('drops non-string values', () => {
		const r = parseConfig(
			JSON.stringify({
				version: 1,
				theme: 'editorial',
				colorOverrides: { accent: 42, text: null }
			})
		);
		expect(r.ok).toBe(true);
		if (!r.ok) return;
		expect(r.config.colorOverrides).toEqual({});
	});
});
