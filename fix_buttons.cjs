const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(/PanelLeftIcon, PanelRightIcon,/, 'PanelLeftIcon, PanelRightIcon, PanelLeftOpenIcon, PanelRightOpenIcon,');

// Replace icons on reopen buttons
content = content.replace(
  /className="panel-reopen panel-reopen-left"([^>]+><)PanelLeftIcon/g,
  'className="panel-reopen panel-reopen-left"$1PanelLeftOpenIcon'
);

content = content.replace(
  /className="panel-reopen panel-reopen-right"([^>]+><)PanelRightIcon/g,
  'className="panel-reopen panel-reopen-right"$1PanelRightOpenIcon'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
