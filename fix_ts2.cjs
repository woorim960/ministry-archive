const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix (editor.storage.markdown as any) to (editor.storage as any).markdown
content = content.replace(/\(editor\.storage\.markdown as any\)/g, '(editor.storage as any).markdown');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
