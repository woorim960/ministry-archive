const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use simple string replacement for the reopen buttons to ensure we get it right
content = content.replace(
  /<button type="button" className="panel-reopen panel-reopen-left"([^]*?)<PanelLeftIcon/g,
  '<button type="button" className="panel-reopen panel-reopen-left"$1<PanelLeftOpenIcon'
);

content = content.replace(
  /<button type="button" className="panel-reopen panel-reopen-right"([^]*?)<PanelRightIcon/g,
  '<button type="button" className="panel-reopen panel-reopen-right"$1<PanelRightOpenIcon'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
