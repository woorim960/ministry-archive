const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. (editor.storage.markdown as any)
content = content.replace(/editor\.storage\.markdown\.getMarkdown/g, '(editor.storage.markdown as any).getMarkdown');

// 2. Cursor-based preview sync `selectionStart` -> `editor.state.selection.from`
content = content.replace(
  /const currentStart = textarea\.selectionStart;/g,
  'const currentStart = editor ? editor.state.selection.from : 0;'
);

// 3. node possibly null
content = content.replace(
  /if \(node\.scrollWidth <= node\.clientWidth/g,
  'if (!node || node.scrollWidth <= node.clientWidth'
);

// 4. Handle setSelectionRange in focus function
content = content.replace(
  /textarea\.setSelectionRange\(start, end\);/g,
  ''
);
content = content.replace(
  /textarea\.setSelectionRange\(start \+ block\.length, start \+ block\.length\);/g,
  ''
);

// 5. titleRef focus
content = content.replace(
  /else if \(errors\.markdown\) textareaRef\.current\?\.focus\(\);/g,
  'else if (errors.markdown) editor?.commands.focus();'
);

// 6. insertYoutube focus
content = content.replace(
  /requestAnimationFrame\(\(\) => textareaRef\.current\?\.focus\(\)\);/g,
  'requestAnimationFrame(() => editor?.commands.focus());'
);

// 7. editorPanel possibly null in handleScroll
content = content.replace(
  /const editorRect = editorPanel\.getBoundingClientRect\(\);/g,
  'const editorRect = editorPanel!.getBoundingClientRect();'
);
content = content.replace(
  /const toolbarEl = editorPanel\.querySelector<HTMLElement>\("\.markdown-toolbar"\);/g,
  'const toolbarEl = editorPanel!.querySelector<HTMLElement>(".markdown-toolbar");'
);

// 8. totalScrollY editorPanel possibly null
content = content.replace(
  /const totalScrollY = editorPanel\.scrollTop \+ textarea\.scrollTop;/g,
  'const totalScrollY = editorPanel!.scrollTop + textarea.scrollTop;'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
