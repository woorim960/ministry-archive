const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add states
const stateOld = `  const [rightPanelHover, setRightPanelHover] = useState(false);`;
const stateNew = `  const [rightPanelHover, setRightPanelHover] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [isResizingActive, setIsResizingActive] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizing.current) return;
      let newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth - 300;
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setPreviewWidth(newWidth);
    };
    const handlePointerUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        setIsResizingActive(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startResizing = useCallback((e: React.PointerEvent) => {
    isResizing.current = true;
    setIsResizingActive(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const workspaceStyle = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 980) return undefined;
    if (previewWidth === null) return undefined;
    if (!leftPanelOpen && !rightPanelOpen) return undefined;
    if (!leftPanelOpen) {
      return { gridTemplateColumns: \`minmax(500px, 1fr) \${previewWidth}px\` };
    }
    if (!rightPanelOpen) return undefined;
    return { gridTemplateColumns: \`230px minmax(300px, 1fr) \${previewWidth}px\` };
  }, [leftPanelOpen, rightPanelOpen, previewWidth]);`;

content = content.replace(stateOld, stateNew);

// 2. Add style to studio-workspace
const workspaceOld = `<div className={\`studio-workspace \${!leftPanelOpen ? "left-collapsed" : ""} \${!rightPanelOpen ? "right-collapsed" : ""}\`}>`;
const workspaceNew = `<div className={\`studio-workspace \${!leftPanelOpen ? "left-collapsed" : ""} \${!rightPanelOpen ? "right-collapsed" : ""}\`} style={workspaceStyle}>`;
content = content.replace(workspaceOld, workspaceNew);

// 3. Add resizer div to preview-panel
const previewPanelOld = `<section id="preview-panel" className={\`preview-panel \${mobileTab === "preview" ? "mobile-active" : ""}\`} aria-label="실제 공개 화면 미리보기" onMouseEnter={() => { setCommandbarVisible(true); lastInteractedPanel.current = "preview"; }} onWheel={() => { lastInteractedPanel.current = "preview"; }} onTouchStart={() => { lastInteractedPanel.current = "preview"; }}>`;
const previewPanelNew = `<section id="preview-panel" className={\`preview-panel \${mobileTab === "preview" ? "mobile-active" : ""}\`} style={{ position: "relative" }} aria-label="실제 공개 화면 미리보기" onMouseEnter={() => { setCommandbarVisible(true); lastInteractedPanel.current = "preview"; }} onWheel={() => { lastInteractedPanel.current = "preview"; }} onTouchStart={() => { lastInteractedPanel.current = "preview"; }}>
          <div className={\`preview-resizer \${isResizingActive ? 'is-resizing' : ''}\`} onPointerDown={startResizing} />`;
content = content.replace(previewPanelOld, previewPanelNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
