const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetReplacement = `    // 1. Text-based Focal Sync (Exact Match)
    let sourceFocalOffset = 20;
    let targetFocalOffset = 20;

    if (isSourceEditor) {
      const toolbar = source.querySelector('.markdown-toolbar');
      if (toolbar) {
        const toolbarTop = toolbar.getBoundingClientRect().top - sourceContainerRect.top;
        if (toolbarTop <= 1) {
          sourceFocalOffset = toolbar.getBoundingClientRect().bottom - sourceContainerRect.top + 20;
        }
      }
    } else {
      const toolbar = target.querySelector('.markdown-toolbar');
      if (toolbar) {
        const toolbarTop = toolbar.getBoundingClientRect().top - targetContainerRect.top;
        if (toolbarTop <= 1) {
          targetFocalOffset = toolbar.getBoundingClientRect().bottom - targetContainerRect.top + 20;
        }
      }
    }

    const sourceFocalY = sourceContainerRect.top + sourceFocalOffset;`;

content = content.replace(
  /    \/\/ 1\. Text-based Focal Sync \(Exact Match\)[\s\S]*?const sourceFocalY = sourceContainerRect\.top \+ focalOffset;/,
  targetReplacement
);

content = content.replace(
  /targetScrollY = target\.scrollTop \+ targetFocalOffset - focalOffset;/g,
  'targetScrollY = target.scrollTop + targetFocalOffset - targetFocalOffset;'
);
// Wait, my regex target replacement used 'targetFocalOffset' for the calculated one, let's fix the variable names.
