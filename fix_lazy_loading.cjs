const fs = require('fs');
const path = 'components/MarkdownDocument.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /loading="lazy"/g,
  'loading={editable ? undefined : "lazy"}'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
