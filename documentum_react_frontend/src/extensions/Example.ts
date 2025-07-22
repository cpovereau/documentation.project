// extensions/Example.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface ExampleOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    example: {
      setExample: (options: { title?: string; content?: string }) => ReturnType
    }
  }
}

export const Example = Node.create<ExampleOptions>({
  name: 'example',
  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      title: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'example',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            title: node.getAttribute('title') ?? '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['example', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setExample:
        ({ title }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { title },
            content: [],
          })
        },
    }
  },
})
