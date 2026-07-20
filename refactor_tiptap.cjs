const fs = require('fs');

const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  'import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";',
  'import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";\nimport { useEditor, EditorContent } from "@tiptap/react";\nimport StarterKit from "@tiptap/starter-kit";\nimport ImageExtension from "@tiptap/extension-image";\nimport Placeholder from "@tiptap/extension-placeholder";\nimport { Markdown } from "tiptap-markdown";'
);

// 2. Editor hook and state
content = content.replace(
  'const textareaRef = useRef<HTMLTextAreaElement>(null);',
  `const textareaRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder: "Markdown으로 기획서를 작성하세요." }),
      Markdown,
    ],
    content: draft.markdown,
    onUpdate: ({ editor }) => {
      const nextMarkdown = editor.storage.markdown.getMarkdown();
      update("markdown", nextMarkdown);
    },
  });

  useEffect(() => {
    if (editor && draft.markdown !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(draft.markdown || "");
    }
  }, [draft.markdown, editor]);`
);

// 3. handleTextareaWheel - change type to HTMLDivElement
content = content.replace(
  'const handleTextareaWheel = useCallback((e: React.WheelEvent<HTMLTextAreaElement>) => {',
  'const handleTextareaWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {'
);

// 4. handleScroll - textarea properties
content = content.replace(
  /const textarea = textareaRef\.current;\n    const editor = editorPanelRef\.current;/g,
  'const textarea = textareaRef.current;\n    const editorPanel = editorPanelRef.current;'
);
content = content.replace(/editor\.scrollTop/g, 'editorPanel.scrollTop');
content = content.replace(/editor\.getBoundingClientRect/g, 'editorPanel.getBoundingClientRect');
content = content.replace(/editor\.querySelector/g, 'editorPanel.querySelector');

// 5. rememberSelection -> remove or mock
content = content.replace(
  /function rememberSelection\(\) \{[\s\S]*?\}/g,
  'function rememberSelection() {}'
);

// 6. wrapSelection
const newWrapSelection = `
  function wrapSelection(before: string, after: string, fallback = "텍스트") {
    if (!editor) return;
    
    if (before === "**") { editor.chain().focus().toggleBold().run(); return; }
    if (before === "_") { editor.chain().focus().toggleItalic().run(); return; }
    if (before === "~~") { editor.chain().focus().toggleStrike().run(); return; }
    if (before === "\`") { editor.chain().focus().toggleCode().run(); return; }

    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ") || fallback;
    const stripped = stripColorWrap(selected);
    
    setPalette(null);
    editor.chain().focus().insertContent(\`\${before}\${stripped}\${after}\`).run();
  }
`;
content = content.replace(/function wrapSelection\(before: string, after: string, fallback = "텍스트"\) \{[\s\S]*?\}\n\n  function hasOuterWrap/g, newWrapSelection.trim() + '\n\n  function hasOuterWrap');

// 7. applyBlock
const newApplyBlock = `
  function applyBlock(kind: "heading" | "list" | "quote" | "toggle") {
    if (!editor) return;
    if (kind === "heading") { editor.chain().focus().toggleHeading({ level: 2 }).run(); return; }
    if (kind === "list") { editor.chain().focus().toggleBulletList().run(); return; }
    if (kind === "quote") { editor.chain().focus().toggleBlockquote().run(); return; }
    if (kind === "toggle") { editor.chain().focus().insertContent("> 펼쳐볼 제목\\n  안쪽 내용을 입력하세요.").run(); return; }
  }
`;
content = content.replace(/function applyBlock\(kind: "heading" \| "list" \| "quote" \| "toggle"\) \{[\s\S]*?\}\n\n  function insertYoutube/g, newApplyBlock.trim() + '\n\n  function insertYoutube');

// 8. insertYoutube
content = content.replace(
  /function insertYoutube\(\) \{[\s\S]*?function insertNote/g,
  `function insertYoutube() {
    const url = youtubeUrl.trim();
    if (!youtubeId(url)) { setYoutubeError("유튜브 영상 주소를 확인해 주세요."); return; }
    const caption = youtubeCaption.trim().replace(/[\\[\\]]/g, "") || "영상 자료";
    const syntax = \`\\n@youtube[\${caption}](\${url})\\n\`;
    if (editor) editor.chain().focus().insertContent(syntax).run();
    setYoutubeOpen(false);
    setYoutubeUrl("");
    setYoutubeCaption("");
    setYoutubeError("");
    setNotice("유튜브 영상을 현재 위치에 추가했습니다.");
  }

  function insertNote`.trim()
);

// 9. insertNote
content = content.replace(
  /function insertNote\(tone: typeof tones\[number\]\["value"\]\) \{[\s\S]*?function commitTags/g,
  `function insertNote(tone: typeof tones[number]["value"]) {
    setPalette(null);
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ") || "현장에서 꼭 기억할 내용을 적어주세요.";
    editor.chain().focus().insertContent(\`\\n:::note[\${tone}] 진행자 참고\\n\${selected}\\n:::\\n\`).run();
  }

  function commitTags`.trim()
);

// 10. JSX replacements for textarea
content = content.replace(
  /<textarea ref=\{textareaRef\} className=\{`markdown-editor \$\{fieldErrors\.markdown \? "has-error" : ""\}`\} value=\{draft\.markdown\} onChange=\{\(event\) => update\("markdown", event\.target\.value\)\} onScroll=\{handleScroll\} onWheel=\{handleTextareaWheel\} onSelect=\{rememberSelection\} onKeyUp=\{rememberSelection\} onMouseUp=\{rememberSelection\} onKeyDown=\{handleTextareaKeyDown\} spellCheck placeholder="Markdown으로 기획서를 작성하세요\." aria-label="기획서 본문 Markdown"\/>/g,
  '<div ref={textareaRef} className={`markdown-editor ${fieldErrors.markdown ? "has-error" : ""}`} onScroll={handleScroll} onWheel={handleTextareaWheel}><EditorContent editor={editor} /></div>'
);

// 11. Remove handleTextareaKeyDown
content = content.replace(
  /function handleTextareaKeyDown\(event: React\.KeyboardEvent<HTMLTextAreaElement>\) \{[\s\S]*?\}\n\n  \/\/ Strip/g,
  '// Strip'
);

// 12. Fix uploadFiles image drop insertion
content = content.replace(
  /if \(targetLine === undefined \|\| targetLine === null\) \{\n\s*const position = textareaRef\.current\?\.selectionStart \?\? nextMarkdown\.length;\n\s*targetLine = nextMarkdown\.slice\(0, position\)\.split\("\\n"\)\.length - 1;\n\s*\}/g,
  'if (!cover && editor) { editor.chain().focus().insertContent(syntax + "\\n").run(); continue; }'
);
content = content.replace(
  /nextMarkdown = insertMarkdownAtLine\(nextMarkdown, targetLine, syntax\);\n\s*targetLine \+= 3;/g,
  'if (targetLine !== undefined && targetLine !== null) { nextMarkdown = insertMarkdownAtLine(nextMarkdown, targetLine, syntax); targetLine += 3; }'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
