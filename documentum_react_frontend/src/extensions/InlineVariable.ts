// src/extensions/InlineVariable.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface InlineVariableOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineVariable: {
      insertVariable: (name: string) => ReturnType
    }
  }
}

export const InlineVariable = Node.create<InlineVariableOptions>({
  name: 'inlineVariable',

  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      name: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'variable[name]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            name: node.getAttribute('name'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'variable',
      mergeAttributes(HTMLAttributes, { name: node.attrs.name }),
    ]
  },

  addCommands() {
    return {
      insertVariable:
        (name) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { name },
          })
        },
    }
  },
})
