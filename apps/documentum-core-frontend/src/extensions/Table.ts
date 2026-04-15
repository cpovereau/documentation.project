import {
  Table,
  TableHeader,
  TableCell,
  TableRow,
} from '@tiptap/extension-table';

export const CustomTable = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'xml:id': {
        default: null,
        parseHTML: element => element.getAttribute('xml:id'),
        renderHTML: attributes => {
          if (!attributes['xml:id']) {
            return {}
          }
          return {
            'xml:id': attributes['xml:id'],
          }
        },
      },
      role: {
        default: 'table',
        parseHTML: element => element.getAttribute('role'),
        renderHTML: attributes => {
          if (!attributes.role) {
            return {}
          }
          return {
            role: attributes.role,
          }
        },
      },
    }
  },
})

export const CustomTableRow = TableRow.extend({
  content: '(tableHeader | tableCell)*',
})

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          return {
            align: attributes.align || 'center',
          }
        },
      },
    }
  },
})

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          return {
            align: attributes.align || 'left',
          }
        },
      },
    }
  },
})
