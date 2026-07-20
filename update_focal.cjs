const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `    // 1. Text-based Focal Sync (Exact Match)
    const focalOffset = 100; // 100px from top
    const sourceFocalY = sourceContainerRect.top + focalOffset;`;

const newLogic = `    // 1. Text-based Focal Sync (Exact Match)
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

content = content.replace(oldLogic, newLogic);

const oldTargetCalc = `      const targetFocalOffset = targetRect.top - targetContainerRect.top + (targetRect.height * percentage);
      targetScrollY = target.scrollTop + targetFocalOffset - focalOffset;`;

const newTargetCalc = `      const targetFocalPoint = targetRect.top - targetContainerRect.top + (targetRect.height * percentage);
      targetScrollY = target.scrollTop + targetFocalPoint - targetFocalOffset;`;

content = content.replace(oldTargetCalc, newTargetCalc);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
