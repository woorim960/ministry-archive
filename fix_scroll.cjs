const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove Cursor-based preview sync
content = content.replace(/\/\/ ── Cursor-based preview sync[\s\S]*?}, \[draft\.markdown, selection\]\);/, '');

// Replace handleTextareaWheel and handlePreviewWheel
content = content.replace(/const handleTextareaWheel = useCallback\([\s\S]*?\}, \[\]\);/, '');
content = content.replace(/const handlePreviewWheel = useCallback\([\s\S]*?\}, \[\]\);/, '');

// Rewrite handleScroll
const newHandleScroll = `
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingRight.current) {
      isSyncingRight.current = false;
      return;
    }

    const totalScrollY = editorPanel.scrollTop;
    if (totalScrollY > lastScrollY.current + 15) {
      setCommandbarVisible(false);
    } else if (totalScrollY < lastScrollY.current - 15) {
      setCommandbarVisible(true);
    }
    lastScrollY.current = totalScrollY;

    const editorScrollHeight = editorPanel.scrollHeight - editorPanel.clientHeight;
    const percentage = editorScrollHeight > 0 ? editorPanel.scrollTop / editorScrollHeight : 0;
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    
    isSyncingLeft.current = true;
    preview.scrollTo({ top: previewScrollHeight * percentage });
  }, []);

  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }

    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    const percentage = previewScrollHeight > 0 ? preview.scrollTop / previewScrollHeight : 0;
    const editorScrollHeight = editorPanel.scrollHeight - editorPanel.clientHeight;

    isSyncingRight.current = true;
    editorPanel.scrollTo({ top: editorScrollHeight * percentage });
  }, []);
`;

content = content.replace(/\/\/ ── Scroll-based preview sync[\s\S]*?}, \[draft\.markdown\]\);/, newHandleScroll);

// Replace onScroll={handleScroll} with handleEditorScroll
content = content.replace(/onScroll={handleScroll}/g, 'onScroll={handleEditorScroll}');

// Add onScroll to previewScrollRef
content = content.replace(/className="preview-scroll" onWheel=\{handlePreviewWheel\}/, 'className="preview-scroll" onScroll={handlePreviewScroll}');
content = content.replace(/onWheel=\{handleTextareaWheel\}/, '');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
