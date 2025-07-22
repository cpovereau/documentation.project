// src/extensions/Video.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface VideoOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: {
        ref: string
        src: string
        width?: string
        height?: string
        poster?: string
        autoplay?: boolean
        controls?: boolean
      }) => ReturnType
    }
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      ref: { default: null },
      src: { default: null },
      width: { default: '640' },
      height: { default: '360' },
      poster: { default: null },
      autoplay: {
        default: false,
        parseHTML: (element) => element.getAttribute('autoplay') === 'true',
        renderHTML: (attrs) => (attrs.autoplay ? { autoplay: 'true' } : {}),
      },
      controls: {
        default: true,
        parseHTML: (element) => element.getAttribute('controls') !== 'false',
        renderHTML: (attrs) => (attrs.controls ? { controls: 'true' } : { controls: 'false' }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video[src]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            ref: node.getAttribute('ref'),
            src: node.getAttribute('src'),
            width: node.getAttribute('width'),
            height: node.getAttribute('height'),
            poster: node.getAttribute('poster'),
            autoplay: node.getAttribute('autoplay') === 'true',
            controls: node.getAttribute('controls') !== 'false',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setVideo:
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
