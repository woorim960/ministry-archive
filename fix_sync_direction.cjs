const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add lastInteractedPanel
content = content.replace(
  /const isSyncingRight = useRef\(false\);/,
  'const isSyncingRight = useRef(false);\n  const lastInteractedPanel = useRef<"editor" | "preview">("editor");'
);

// 2. Update handleEditorScroll
const oldEditorScroll = `  const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingRight.current) return;`;

const newEditorScroll = `  const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "editor") return;
    if (isSyncingRight.current) return;`;

content = content.replace(oldEditorScroll, newEditorScroll);

// 3. Update handlePreviewScroll
const oldPreviewScroll = `  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingLeft.current) return;`;

const newPreviewScroll = `  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "preview") return;
    if (isSyncingLeft.current) return;`;

content = content.replace(oldPreviewScroll, newPreviewScroll);

// 4. Bind events to the panels
const oldEditorPanel = `<section ref={editorPanelRef} className={\`editor-panel \${mobileTab === "write" ? "mobile-active" : ""}\`} onScroll={handleEditorScroll} onMouseEnter={() => setCommandbarVisible(false)}>`;
const newEditorPanel = `<section ref={editorPanelRef} className={\`editor-panel \${mobileTab === "write" ? "mobile-active" : ""}\`} onScroll={handleEditorScroll} onMouseEnter={() => { setCommandbarVisible(false); lastInteractedPanel.current = "editor"; }} onWheel={() => { lastInteractedPanel.current = "editor"; }} onTouchStart={() => { lastInteractedPanel.current = "editor"; }}>`;
content = content.replace(oldEditorPanel, newEditorPanel);

const oldPreviewPanel = `<section id="preview-panel" className={\`preview-panel \${mobileTab === "preview" ? "mobile-active" : ""}\`} aria-label="실제 공개 화면 미리보기" onMouseEnter={() => setCommandbarVisible(true)}>`;
const newPreviewPanel = `<section id="preview-panel" className={\`preview-panel \${mobileTab === "preview" ? "mobile-active" : ""}\`} aria-label="실제 공개 화면 미리보기" onMouseEnter={() => { setCommandbarVisible(true); lastInteractedPanel.current = "preview"; }} onWheel={() => { lastInteractedPanel.current = "preview"; }} onTouchStart={() => { lastInteractedPanel.current = "preview"; }}>`;
content = content.replace(oldPreviewPanel, newPreviewPanel);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
