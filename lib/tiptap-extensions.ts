import StarterKit from "@tiptap/starter-kit";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Heading } from "@tiptap/extension-heading";
import { wrappingInputRule } from "@tiptap/core";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Callout } from "@/components/extensions/Callout";
import { Toggle } from "@/components/extensions/Toggle";
import { Youtube } from "@/components/extensions/Youtube";
import { headingId } from "@/lib/markdown";
import { mergeAttributes } from "@tiptap/core";

export const CustomHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];
    const id = headingId(node.textContent);
    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id }), 0];
  },
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty || $from.parent.type.name !== "heading") return false;
        
        if ($from.parent.content.size > 0 && $from.parentOffset === $from.parent.content.size) {
          const pos = $from.after();
          return editor.chain().insertContentAt(pos, { type: "paragraph" }).focus(pos + 1).run();
        }
        return false;
      },
    };
  },
});

export const CustomBlockquote = Blockquote.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*"\s$/,
        type: this.type,
      }),
    ];
  },
});

export function getTiptapExtensions(options?: { placeholder?: string }) {
  const extensions: any[] = [
    StarterKit.configure({ heading: false, blockquote: false }),
    CustomBlockquote,
    CustomHeading,
    ImageExtension.configure({ inline: true, allowBase64: true }),
    Callout,
    Toggle,
    Youtube,
    Markdown,
  ];

  if (options?.placeholder) {
    extensions.push(Placeholder.configure({ placeholder: options.placeholder }));
  }

  return extensions;
}
