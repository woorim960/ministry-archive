const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldSync = /  const performSectionalSync = \(source: HTMLElement, target: HTMLElement\) => \{[\s\S]*?target\.scrollTo\(\{ top: targetScrollY \}\);\n  \};/;

const newSync = `  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    
    if (sourceMax <= 0 || targetMax <= 0) return;

    const percentage = source.scrollTop / sourceMax;
    target.scrollTo({ top: percentage * targetMax });
  };`;

content = content.replace(oldSync, newSync);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
