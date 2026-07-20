const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const src = closestSourceNode\.src;/g,
  'const src = (closestSourceNode as HTMLImageElement).src;'
);

content = content.replace(
  /node\.tagName === 'IMG' && node\.src === src/g,
  "node.tagName === 'IMG' && (node as HTMLImageElement).src === src"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
