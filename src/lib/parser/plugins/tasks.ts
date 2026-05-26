import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

const TASK_RE = /^\[([ xX])\]\s+/;

interface ListItemTaskMeta {
	task: true;
	done: boolean;
}

/**
 * Detect task list items (`- [ ]` / `- [x]`) and annotate the token stream:
 *   list_item_open.meta = { task: true, done: boolean }
 *   bullet_list_open.meta = { taskList: true } when any of its direct items are tasks
 * The `[ ]` / `[x]` marker is stripped from the inline content so renderers
 * can emit just the checkbox markup.
 */
export function tasksPlugin(md: MarkdownIt): void {
	md.core.ruler.after('block', 'task-lists', (state) => {
		const tokens = state.tokens;
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type !== 'bullet_list_open') continue;
			const listOpen = tokens[i];

			// Find matching close at same nesting depth
			let depth = 0;
			let listCloseIdx = -1;
			for (let j = i; j < tokens.length; j++) {
				if (tokens[j].type === 'bullet_list_open') depth++;
				else if (tokens[j].type === 'bullet_list_close') {
					depth--;
					if (depth === 0) {
						listCloseIdx = j;
						break;
					}
				}
			}
			if (listCloseIdx === -1) continue;

			let anyTask = false;
			// Walk direct children list_item_open at depth 1 inside the list
			let itemDepth = 0;
			for (let k = i + 1; k < listCloseIdx; k++) {
				const t = tokens[k];
				if (t.type === 'bullet_list_open' || t.type === 'ordered_list_open') itemDepth++;
				else if (t.type === 'bullet_list_close' || t.type === 'ordered_list_close')
					itemDepth--;
				else if (t.type === 'list_item_open' && itemDepth === 0) {
					// Expect: list_item_open → paragraph_open → inline → ...
					const para = tokens[k + 1];
					const inline = tokens[k + 2];
					if (para?.type !== 'paragraph_open' || inline?.type !== 'inline') continue;
					const m = inline.content.match(TASK_RE);
					if (!m) continue;
					anyTask = true;
					const done = m[1].toLowerCase() === 'x';
					const meta: ListItemTaskMeta = { task: true, done };
					t.meta = { ...(t.meta ?? {}), ...meta };
					inline.content = inline.content.replace(TASK_RE, '');
					if (inline.children) {
						const first = inline.children[0];
						if (first?.type === 'text') {
							first.content = first.content.replace(TASK_RE, '');
							if (first.content.length === 0) inline.children.shift();
						}
					}
				}
			}

			if (anyTask) {
				listOpen.meta = { ...(listOpen.meta ?? {}), taskList: true };
			}
		}
		return true;
	});
}
