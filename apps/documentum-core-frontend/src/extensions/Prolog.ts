// src/extensions/Prolog.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const Prolog = Node.create({
  name: 'prolog',
  group: 'block',
  content: 'block*',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      id: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'prolog',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['prolog', mergeAttributes(HTMLAttributes), 0]
  },
})
