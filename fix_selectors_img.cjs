const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldEditorQuery = '".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6"';
const newEditorQuery = '".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6, .ProseMirror img"';

const oldPreviewQuery = '".markdown-body > div > h1, .markdown-body > div > h2, .markdown-body > div > h3, .markdown-body > div > h4, .markdown-body > div > h5, .markdown-body > div > h6"';
const newPreviewQuery = '".markdown-body > div > h1, .markdown-body > div > h2, .markdown-body > div > h3, .markdown-body > div > h4, .markdown-body > div > h5, .markdown-body > div > h6, .markdown-body > div > figure.document-image > img"';

content = content.replace(oldEditorQuery, newEditorQuery);
content = content.replace(oldPreviewQuery, newPreviewQuery);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
