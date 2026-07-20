const fs = require('fs');
const path = '/Users/woorim/.gemini/antigravity-ide/brain/2e1381e5-0ff2-4fc0-bc37-da6f40a5d77a/task.md';

const content = `- \`[x]\` Implement sectional scroll sync in \`AdminStudio.tsx\`
  - \`[x]\` Add \`syncScroll\` utility function inside \`AdminStudio.tsx\`
  - \`[x]\` Update \`handleEditorScroll\` to use \`syncScroll\`
  - \`[x]\` Update \`handlePreviewScroll\` to use \`syncScroll\`
- \`[x]\` Verify changes and test scroll behavior
`;

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
