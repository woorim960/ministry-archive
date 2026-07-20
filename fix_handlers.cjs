const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldEditorScroll = /  const handleEditorScroll = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/;
const newEditorScroll = `  const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "editor") return;

    const totalScrollY = editorPanel.scrollTop;
    if (totalScrollY > lastScrollY.current + 15) {
      setCommandbarVisible(false);
    } else if (totalScrollY < lastScrollY.current - 15) {
      setCommandbarVisible(true);
    }
    lastScrollY.current = totalScrollY;

    performSectionalSync(editorPanel, preview);
  }, []);`;
content = content.replace(oldEditorScroll, newEditorScroll);

const oldPreviewScroll = /  const handlePreviewScroll = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/;
const newPreviewScroll = `  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "preview") return;

    performSectionalSync(preview, editorPanel);
  }, []);`;
content = content.replace(oldPreviewScroll, newPreviewScroll);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
