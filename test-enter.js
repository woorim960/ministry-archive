import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  extensions: [StarterKit],
  content: '<h1>Heading</h1>'
});
console.log(editor.schema.nodes.heading.spec.defining);
