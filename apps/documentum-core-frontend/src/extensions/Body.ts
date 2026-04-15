// src/extensions/Body.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface BodyOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    body: {
      setBody: (content?: string) => ReturnType
    }
  }
}

export const Body = Node.create<BodyOptions>({
  name: 'body',

  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'body',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['body', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBody:
        (content = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: content ? [{ type: 'text', text: content }] : [],
          })
        },
    }
  },
})
