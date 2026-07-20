const fs = require('fs');
const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// Replace .markdown-editor styling to apply to .ProseMirror
content = content.replace(/\.markdown-editor\{/g, '.markdown-editor, .ProseMirror{');
content = content.replace(/\.markdown-editor::-webkit-scrollbar\{/g, '.markdown-editor::-webkit-scrollbar, .ProseMirror::-webkit-scrollbar{');

// Add ProseMirror specifics
const pmCSS = `
.ProseMirror {
  min-height: 100%;
  outline: none;
}
.ProseMirror p { margin: 0 0 12px; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
  margin: 24px 0 12px;
  font-weight: 700;
}
.ProseMirror h1 { font-size: 28px; }
.ProseMirror h2 { font-size: 23px; }
.ProseMirror h3 { font-size: 19px; }
.ProseMirror ul, .ProseMirror ol {
  padding-left: 20px;
  margin: 0 0 12px;
}
.ProseMirror blockquote {
  border-left: 3px solid var(--line-dark);
  padding-left: 14px;
  margin: 16px 0;
  color: var(--muted);
}
.ProseMirror img {
  max-width: 100%;
  border-radius: 6px;
  margin: 16px 0;
}
`;

content += pmCSS;

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
