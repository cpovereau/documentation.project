// src/extensions/RubriqueMetadata.ts
import { Node, mergeAttributes } from '@tiptap/core'

export interface RubriqueMetadataOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rubriqueMetadata: {
      setRubriqueMetadata: (data?: string) => ReturnType
    }
  }
}

export const RubriqueMetadata = Node.create<RubriqueMetadataOptions>({
  name: 'rubriqueMetadata',

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
        tag: 'rubrique-metadata',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['rubrique-metadata', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setRubriqueMetadata:
        (data = '') =>
        ({ commands }) => {
          return commands.
