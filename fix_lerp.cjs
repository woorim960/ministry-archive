const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLerp = `    if (Math.abs(diff) < 1) {
      container.scrollTo({ top: scrollTargetY.current });
      scrollTargetY.current = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }`;

const newLerp = `    if (Math.abs(diff) < 1) {
      container.scrollTo({ top: scrollTargetY.current });
      scrollTargetY.current = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isSyncingLeft.current = false;
        isSyncingRight.current = false;
      }, 50);
      return;
    }`;

content = content.replace(oldLerp, newLerp);

// Remove the timeout from handleEditorScroll
const oldEditorScrollTimeout = `    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { isSyncingLeft.current = false; }, 50);`;
content = content.replace(oldEditorScrollTimeout, '');

// Remove the timeout from handlePreviewScroll
const oldPreviewScrollTimeout = `    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { isSyncingRight.current = false; }, 50);`;
content = content.replace(oldPreviewScrollTimeout, '');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
