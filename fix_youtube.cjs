const fs = require('fs');
const path = 'lib/markdown.ts';
let content = fs.readFileSync(path, 'utf8');

// The current youtube regex: /^@youtube\[(.*?)\]\((.*?)\)$/
// We change it to support optional backslashes.
content = content.replace(
  /^    const youtube = line\.match\(\/\^@youtube\\\[\(\.\*\?\)\\\]\\\\\(\(\.\*\?\)\\\\\)\$\/\);/m,
  '    const youtube = line.match(/^@youtube\\\\?\\\\[(.*?)\\\\?\\\\]\\\\?\\\\((.*?)\\\\?\\\\)$/);'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
