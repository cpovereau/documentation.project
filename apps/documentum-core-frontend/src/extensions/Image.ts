// extensions/Image.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: {
        src: string
        alt?: string
        ref?: string
        width?: string
        height?: string
        float?: 'left' | 'right' | 'none'
        role?: string
      }) => ReturnType
    }
  }
}

export const Image = Node.create<ImageOptions>({
  name: 'image',

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      ref: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      float: {
        default: null,
      },
      role: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'image[src]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          if (!this.options.allowBase64 && node.getAttribute('src')?.startsWith('data:')) return false
          return {
            src: node.getAttribute('src'),
            alt: node.getAttribute('alt'),
            ref: node.getAttribute('ref'),
            width: node.getAttribute('width'),
            height: node.getAttribute('height'),
            float: node.getAttribute('float'),
            role: node.getAttribute('role'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['image', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },
})
