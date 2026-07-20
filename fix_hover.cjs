const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add state variables
const stateHook = `  const [leftPanelHover, setLeftPanelHover] = useState(false);
  const [rightPanelHover, setRightPanelHover] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!leftPanelOpen) {
        if (e.clientX < 12) setLeftPanelHover(true);
        else if (e.clientX > 280) setLeftPanelHover(false);
      }
      if (!rightPanelOpen) {
        if (window.innerWidth - e.clientX < 12) setRightPanelHover(true);
        else if (window.innerWidth - e.clientX > Math.max(500, window.innerWidth * 0.45)) setRightPanelHover(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [leftPanelOpen, rightPanelOpen]);

  const isLeftVisible = leftPanelOpen || leftPanelHover;
  const isRightVisible = rightPanelOpen || rightPanelHover;
`;

content = content.replace(/  const \[leftPanelOpen, setLeftPanelOpen\] = useState\(true\);\n  const \[rightPanelOpen, setRightPanelOpen\] = useState\(true\);/, '  const [leftPanelOpen, setLeftPanelOpen] = useState(true);\n  const [rightPanelOpen, setRightPanelOpen] = useState(true);\n' + stateHook);

// Replace leftPanelOpen with isLeftVisible in the studio-workspace className
content = content.replace(/className=\{\`studio-workspace \$\{leftPanelOpen \? "" : "left-collapsed"\} \$\{rightPanelOpen \? "" : "right-collapsed"\}\`\}/, 'className={`studio-workspace ${isLeftVisible ? "" : "left-collapsed"} ${isRightVisible ? "" : "right-collapsed"}`}');

// Also update the focusMode variable
content = content.replace(/const focusMode = !leftPanelOpen && !rightPanelOpen;/, 'const focusMode = !isLeftVisible && !isRightVisible;');

// Add ID to preview-panel
content = content.replace(/<aside className="preview-panel"/, '<aside id="preview-panel" className="preview-panel"');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
