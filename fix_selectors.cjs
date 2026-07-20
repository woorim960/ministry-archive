const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldSyncLogic = `
  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    const sourceHeadings = Array.from(source.querySelectorAll("h1, h2, h3, h4, h5, h6")) as HTMLElement[];
    const targetHeadings = Array.from(target.querySelectorAll("h1, h2, h3, h4, h5, h6")) as HTMLElement[];
`;

const newSyncLogic = `
  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    // Determine which one is editor and which one is preview based on class name
    const isSourceEditor = source.classList.contains("editor-panel");
    const editorEl = isSourceEditor ? source : target;
    const previewEl = isSourceEditor ? target : source;

    const editorHeadings = Array.from(editorEl.querySelectorAll(".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6")) as HTMLElement[];
    const previewHeadings = Array.from(previewEl.querySelectorAll(".markdown-body > div > h1, .markdown-body > div > h2, .markdown-body > div > h3, .markdown-body > div > h4, .markdown-body > div > h5, .markdown-body > div > h6")) as HTMLElement[];

    const sourceHeadings = isSourceEditor ? editorHeadings : previewHeadings;
    const targetHeadings = isSourceEditor ? previewHeadings : editorHeadings;
`;

content = content.replace(oldSyncLogic, newSyncLogic);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
