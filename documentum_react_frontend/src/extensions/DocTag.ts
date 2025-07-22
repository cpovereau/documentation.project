// src/extensions/DocTag.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface DocTagOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    docTag: {
      setDocTag: (options: { type: string; value: string }) => ReturnType
    }
  }
}

export const DocTag = Node.create<DocTagOptions>({
  name: 'docTag',

  inline: true,
  group: 'inline',
  atom: false,

  selectable: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: {
        default: 'audience',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'doc-tag',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            type: node.getAttribute('type'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['doc-tag', mergeAttributes(HTMLAttributes), node.textContent || '']
  },

  addCommands() {
    return {
      setDocTag:
        ({ type, value }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type },
            content: [{ type: 'text', text: value }],
          })
        },
    }
  },
})
