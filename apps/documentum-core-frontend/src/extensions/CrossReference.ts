// extensions/CrossReference.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface CrossReferenceOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    crossReference: {
      setCrossReference: (options: { refid: string; text?: string }) => ReturnType
    }
  }
}

export const CrossReference = Node.create<CrossReferenceOptions>({
  name: 'crossReference',

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
      refid: {
        default: '',
      },
      text: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'xref[refid]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            refid: node.getAttribute('refid'),
            text: node.textContent || '',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['xref', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), node.attrs.text]
  },

  addCommands() {
    return {
      setCrossReference:
        ({ refid, text }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { refid, text },
          })
        },
    }
  },
})
