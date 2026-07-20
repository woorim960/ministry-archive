const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(path, content, 'utf8');
}

// 1. lib/markdown.ts
replaceFile('lib/markdown.ts', [
  // Allow optional escaping of brackets
  [/const noteDirective = line\.match\(\/\^:::note\\\[\(red\|rose\|blue\|green\|amber\|violet\|neutral\|gray\|slate\)\\\]\\s\*\(\.\*\)\$\/i\);/g, 'const noteDirective = line.match(/^:::note\\\\?\\\\[(red|rose|blue|green|amber|violet|neutral|gray|slate)\\\\?\\\\]\\\\s*(.*)$/i);'],
  [/title: noteDirective\[2\]\.trim\(\) \|\| "진행자 참고",/g, 'title: noteDirective[2].trim() || "참고",'],
  [/const title = note\[2\]\.trim\(\) \|\| "진행자 참고";/g, 'const title = note[2].trim() || "참고";'],
  [/\(legacyNote\[1\]\?\.toLowerCase\(\) \|\| "blue"\}\] \$\{legacyNote\[2\]\.trim\(\) \|\| "진행자 참고"/g, '(legacyNote[1]?.toLowerCase() || "blue"}] ${legacyNote[2].trim() || "참고"']
]);

// 2. components/MarkdownDocument.tsx
replaceFile('components/MarkdownDocument.tsx', [
  [/<span>진행자 참고<\/span>/g, '<span>참고</span>'],
  [/block\.title !== "진행자 참고"/g, 'block.title !== "참고"']
]);

// 3. app/admin/AdminStudio.tsx
replaceFile('app/admin/AdminStudio.tsx', [
  [/진행자 참고 상자를/g, '참고 상자를'],
  [/진행자 참고 색상/g, '참고 색상'],
  [/:::note\[blue\] 진행자 참고/g, ':::note[blue] 참고'],
  [/진행자 전용 참고/g, '참고']
]);

console.log("Done");
