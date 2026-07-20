const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const scrollTimeout = useRef<NodeJS\.Timeout>\(\);/,
  'const scrollTimeout = useRef<NodeJS.Timeout | null>(null);'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
