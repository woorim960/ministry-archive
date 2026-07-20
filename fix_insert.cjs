const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /editor\.chain\(\)\.focus\(\)\.insertContent\("> 펼쳐볼 제목\\\\n  안쪽 내용을 입력하세요\."\)\.run\(\);/g,
  'editor.chain().focus().insertContent("<p>&gt; 펼쳐볼 제목</p><p>  안쪽 내용을 입력하세요.</p>").run();'
);

content = content.replace(
  /const syntax = `\\\\n@youtube\[\${caption}\]\(\${url}\)\\\\n`;/g,
  'const syntax = `<p>@youtube[${caption}](${url})</p>`;'
);

content = content.replace(
  /editor\.chain\(\)\.focus\(\)\.insertContent\(`\\\\n:::note\[\${tone}\] 진행자 참고\\\\n\${selected}\\\\n:::\\\\n`\)\.run\(\);/g,
  'editor.chain().focus().insertContent(`<p>:::note[${tone}] 참고</p><p>${selected}</p><p>:::</p>`).run();'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
