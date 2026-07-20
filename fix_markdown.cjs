const fs = require('fs');
const path = 'lib/markdown.ts';
let content = fs.readFileSync(path, 'utf8');

// The divider check is currently at the bottom:
// if (/^---+$/.test(line.trim())) {
//   push({ type: "divider", raw: line, startLine, endLine: index });
//   index += 1;
//   continue;
// }

// Let's remove it from the bottom and put it before list pattern.
content = content.replace(/    if \(\/\^---\+\$\/\.test\(line\.trim\(\)\)\) \{\n      push\(\{ type: "divider", raw: line, startLine, endLine: index \}\);\n      index \+= 1;\n      continue;\n    \}\n\n/g, '');

const insertPos = content.indexOf('const listPattern = /');
content = content.slice(0, insertPos) +
  '    if (/^---+$/.test(line.trim())) {\n' +
  '      push({ type: "divider", raw: line, startLine, endLine: index });\n' +
  '      index += 1;\n' +
  '      continue;\n' +
  '    }\n\n    ' +
  content.slice(insertPos);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
