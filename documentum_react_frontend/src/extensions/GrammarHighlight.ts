import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const GrammarHighlight = Extension.create({
  name: 'grammarHighlight',

  addState() {
    return {
      init: () => DecorationSet.empty,
      apply: (tr: import('@tiptap/pm/state').Transaction, old: DecorationSet) => {
        const errors = tr.getMeta('grammarHighlightErrors');

        if (errors) {
          const decorations = errors.map((error: any) =>
            Decoration.inline(error.from, error.to, {
              class: 'grammar-error',
              'data-message': error.message,
              'data-suggestions': (error.replacements || []).join(','),
            })
          );
          return DecorationSet.create(tr.doc, decorations);
        }

        return old.map(tr.mapping, tr.doc);
      },
    };
  },

  props() {
    return {
      decorations(state: import('@tiptap/pm/state').EditorState) {
        return this.getState()(state);
      },
    };
  },
});
