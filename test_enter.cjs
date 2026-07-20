const { Editor } = require('@tiptap/core');
const StarterKit = require('@tiptap/starter-kit').default;
const Heading = require('@tiptap/extension-heading').default;

const CustomHeading = Heading.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type.name !== 'heading') {
          return false;
        }

        if ($from.parent.content.size > 0 && $from.parentOffset === $from.parent.content.size) {
          const pos = $from.after();
          return editor.chain().insertContentAt(pos, { type: 'paragraph' }).focus(pos + 1).run();
        }
        return false;
      }
    }
  }
});

const editor = new Editor({
  extensions: [
    StarterKit.configure({ heading: false }),
    CustomHeading
  ],
  content: '<h1>Hello</h1>'
});

console.log('Before Enter:', editor.getHTML());
editor.commands.focus('end');
editor.commands.keyboardShortcut('Enter');
console.log('After Enter:', editor.getHTML());
