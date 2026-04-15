// src/extensions/Shortdesc.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface ShortdescOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    shortdesc: {
      setShortdesc: (text: string) => ReturnType
    }
  }
}

export const Shortdesc = Node.create<ShortdescOptions>({
  name: 'shortdesc',

  group: 'block',
  content: 'inline*',
  defining: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'shortdesc',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['shortdesc', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setShortdesc:
        (text: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text }],
          })
        },
    }
  },
})
