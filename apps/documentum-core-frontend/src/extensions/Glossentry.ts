// extensions/Glossentry.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface GlossentryOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    glossentry: {
      setGlossentry: (options: { termid: string; term: string; definition: string }) => ReturnType
    }
  }
}

export const Glossentry = Node.create<GlossentryOptions>({
  name: 'glossentry',
  group: 'block',
  content: 'text*',
  selectable: true,
  defining: true,
  atom: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      termid: {
        default: '',
      },
      term: {
        default: '',
      },
      definition: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'glossentry[termid]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            termid: node.getAttribute('termid'),
            term: node.getAttribute('term'),
            definition: node.getAttribute('definition'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['glossentry', mergeAttributes(HTMLAttributes)]
  },

  addCommands() {
    return {
      setGlossentry:
        ({ termid, term, definition }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { termid, term, definition },
          })
        },
    }
  },
})
