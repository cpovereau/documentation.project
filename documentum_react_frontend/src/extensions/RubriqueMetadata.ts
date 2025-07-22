// src/extensions/RubriqueMetadata.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const RubriqueMetadata = Node.create({
  name: 'rubriqueMetadata',

  group: 'block',
  atom: true,
  selectable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      auteur: {
        default: '',
      },
      dateCreation: {
        default: '',
      },
      dateModification: {
        default: '',
      },
      audience: {
        default: 'générique',
      },
      fonctionnalite: {
        default: '',
      },
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
    return ['rubrique-metadata', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const container = document.createElement('div')
      container.className = 'text-sm text-muted-foreground bg-gray-100 px-4 py-2 rounded border border-gray-300 my-2'

      const rows = [
        `Auteur : ${HTMLAttributes.auteur || 'N/A'}`,
        `Date création : ${HTMLAttributes.dateCreation || 'N/A'}`,
        `Dernière modif : ${HTMLAttributes.dateModification || 'N/A'}`,
        `Audience : ${HTMLAttributes.audience || 'générique'}`,
        `Fonctionnalité : ${HTMLAttributes.fonctionnalite || 'N/A'}`,
      ]

      container.innerHTML = rows.map(row => `<div>${row}</div>`).join('')
      return {
        dom: container,
      }
    }
  },
})
