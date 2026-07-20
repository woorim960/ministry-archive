const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add timeout ref
if (!content.includes('const scrollTimeout = useRef')) {
  content = content.replace(
    /const isSyncingLeft = useRef\(false\);/,
    'const isSyncingLeft = useRef(false);\n  const scrollTimeout = useRef<NodeJS.Timeout>();'
  );
}

// 2. Fix performSectionalSync to add text start anchor
const oldAnchorsInit = `const anchors: {s: number, t: number}[] = [{ s: 0, t: 0 }];`;
const newAnchorsInit = `
    const sourceTextEl = isSourceEditor ? editorEl.querySelector(".ProseMirror") : previewEl.querySelector(".markdown-body");
    const targetTextEl = isSourceEditor ? previewEl.querySelector(".markdown-body") : editorEl.querySelector(".ProseMirror");

    const sourceTextTop = sourceTextEl ? sourceTextEl.getBoundingClientRect().top - sourceContainerRect.top + source.scrollTop : 0;
    const targetTextTop = targetTextEl ? targetTextEl.getBoundingClientRect().top - targetContainerRect.top + target.scrollTop : 0;

    const anchors: {s: number, t: number}[] = [{ s: 0, t: 0 }];
    if (sourceTextTop > 0 || targetTextTop > 0) {
      anchors.push({ s: sourceTextTop, t: targetTextTop });
    }
`;
content = content.replace(oldAnchorsInit, newAnchorsInit.trim());

// 3. Fix handleEditorScroll and handlePreviewScroll to debounce flags
const oldHandlers = /const handleEditorScroll = useCallback\([\s\S]*?const handlePreviewScroll = useCallback\([\s\S]*?\}, \[\]\);/m;

const newHandlers = `const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingRight.current) return;

    const totalScrollY = editorPanel.scrollTop;
    if (totalScrollY > lastScrollY.current + 15) {
      setCommandbarVisible(false);
    } else if (totalScrollY < lastScrollY.current - 15) {
      setCommandbarVisible(true);
    }
    lastScrollY.current = totalScrollY;

    isSyncingLeft.current = true;
    performSectionalSync(editorPanel, preview);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { isSyncingLeft.current = false; }, 50);
  }, []);

  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingLeft.current) return;

    isSyncingRight.current = true;
    performSectionalSync(preview, editorPanel);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { isSyncingRight.current = false; }, 50);
  }, []);`;

content = content.replace(oldHandlers, newHandlers);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
