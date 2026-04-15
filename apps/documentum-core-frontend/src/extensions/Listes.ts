// extensions/Listes.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block',
  content: 'listItem+',
  parseHTML() {
    return [
      { tag: 'ol' },
      { tag: 'orderedlist' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['orderedlist', mergeAttributes(HTMLAttributes), 0]
  },
})

export const BulletList = Node.create({
  name: 'bulletList',
  group: 'block',
  content: 'listItem+',
  parseHTML() {
    return [
      { tag: 'ul' },
      { tag: 'itemizedlist' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['itemizedlist', mergeAttributes(HTMLAttributes), 0]
  },
})

export const ListItem = Node.create({
  name: 'listItem',
  content: 'paragraph block*',
  defining: true,
  parseHTML() {
    return [
      { tag: 'li' },
      { tag: 'listitem' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['listitem', mergeAttributes(HTMLAttributes), 0]
  },
})
