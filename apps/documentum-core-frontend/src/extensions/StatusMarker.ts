// src/extensions/StatusMarker.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface StatusMarkerOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    statusMarker: {
      setStatusMarker: (status: 'ajour' | 'arevoir' | 'modifie') => ReturnType
    }
  }
}

export const StatusMarker = Node.create<StatusMarkerOptions>({
  name: 'statusMarker',

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
      status: {
        default: 'ajour',
      },
    }
  },

  parseHTML() {
    return [] // rien n’est exporté : purement visuel/editor-only
  },

  renderHTML() {
    return ['span', { 'data-status-marker': true }, 0]
  },

  addCommands() {
    return {
      setStatusMarker:
        (status) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { status },
          })
        },
    }
  },
})
