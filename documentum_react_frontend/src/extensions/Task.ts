// src/extensions/Task.ts
import { Node, mergeAttributes } from '@tiptap/core';

const Task = Node.create({
  name: 'task',
  group: 'block',
  content: 'block*',
  draggable: true,
  parseHTML() {
    return [{ tag: 'task' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['task', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertTask:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: 'task',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Nouveau bloc Task...' }] },
            ],
          }),
    };
  },
});

export default Task;