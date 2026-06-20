// Layout is orthogonal to theme: theme = colors/fonts, layout = how the IR is
// arranged. It rides in the URL as `?l=` exactly like theme's `?t=`, so a shared
// link reproduces both the styling and the view. URL-only — not persisted.

export type LayoutId = 'doc' | 'deck';

export const layouts: { id: LayoutId; label: string }[] = [
	{ id: 'doc', label: 'Doc' },
	{ id: 'deck', label: 'Deck' }
];

export const DEFAULT_LAYOUT: LayoutId = 'doc';

/** Narrow an untrusted string (e.g. a `?l=` URL param) to a built-in LayoutId. */
export function isLayoutId(value: string | null | undefined): value is LayoutId {
	return value === 'doc' || value === 'deck';
}
