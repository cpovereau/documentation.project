// extensions/Figure.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface FigureOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (options: {
        src: string
        alt?: string
        ref?: string
        title?: string
        width?: string
        height?: string
      }) => ReturnType
    }
  }
}

export const Figure = Node.create<FigureOptions>({
  name: 'figure',
  group: 'block',
  content: 'inline*', // image + caption text
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      ref: { default: '' },
      title: { default: '' },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[src]', // fallback HTML
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            src: node.getAttribute('src'),
            alt: node.getAttribute('alt'),
            ref: node.getAttribute('ref'),
            title: node.querySelector('figcaption')?.textContent ?? '',
            width: node.getAttribute('width'),
            height: node.getAttribute('height'),
          }
        },
      },
      {
        tag: 'figure > image[src]', // format XML
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          const parent = node.parentElement
          return {
            src: node.getAttribute('src'),
            alt: node.getAttribute('alt'),
            ref: node.getAttribute('ref'),
            title: parent?.querySelector('title')?.textContent ?? '',
            width: node.getAttribute('width'),
            height: node.getAttribute('height'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes),
      ['title', {}, node.attrs.title],
      [
        'image',
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          ref: node.attrs.ref,
          width: node.attrs.width,
          height: node.attrs.height,
        },
      ],
    ]
  },

  addCommands() {
    return {
      setFigure:
        ({ src, alt, ref, title, width, height }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src, alt, ref, title, width, height },
          })
        },
    }
  },
})
