"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";
import { useEffect } from "react";

export function MarkdownDocument({ markdown, editable = false, className }: { markdown: string; editable?: boolean; className?: string }) {
  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content: markdown,
    editable: editable,
    editorProps: {
      attributes: {
        class: `markdown-body ${className || ""}`.trim(),
      },
    },
  });

  useEffect(() => {
    if (editor && (editor.storage as any).markdown.getMarkdown() !== markdown) {
      editor.commands.setContent(markdown);
    }
  }, [markdown, editor]);

  return <EditorContent editor={editor} className={editable ? "markdown-editor" : "markdown-viewer"} />;
}
