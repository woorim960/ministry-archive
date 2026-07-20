const fs = require('fs');
const path = 'lib/markdown.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /candidate\.trim\(\) === ":::"/g,
  'candidate.replace(/\\\\/g, "").trim() === ":::"'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
