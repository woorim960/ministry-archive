const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const syncLogic = `
  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    const sourceHeadings = Array.from(source.querySelectorAll("h1, h2, h3, h4, h5, h6")) as HTMLElement[];
    const targetHeadings = Array.from(target.querySelectorAll("h1, h2, h3, h4, h5, h6")) as HTMLElement[];

    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    const scrollY = source.scrollTop;

    // Fallback: Use global percentage if heading counts mismatch or no headings exist
    if (sourceHeadings.length === 0 || sourceHeadings.length !== targetHeadings.length) {
      const percentage = sourceMax > 0 ? scrollY / sourceMax : 0;
      target.scrollTo({ top: targetMax * percentage });
      return;
    }

    // Edge case: absolute bottom
    if (scrollY >= sourceMax - 2) {
      target.scrollTo({ top: targetMax });
      return;
    }

    const sourceContainerRect = source.getBoundingClientRect();
    const targetContainerRect = target.getBoundingClientRect();

    const sourceTops = sourceHeadings.map(el => el.getBoundingClientRect().top - sourceContainerRect.top + source.scrollTop);
    const targetTops = targetHeadings.map(el => el.getBoundingClientRect().top - targetContainerRect.top + target.scrollTop);

    let startSourceY = 0;
    let endSourceY = sourceTops[0];
    let startTargetY = 0;
    let endTargetY = targetTops[0];
    let sectionFound = false;

    if (scrollY <= sourceTops[0]) {
      sectionFound = true;
    } else {
      for (let i = 0; i < sourceTops.length - 1; i++) {
        if (scrollY > sourceTops[i] && scrollY <= sourceTops[i + 1]) {
          startSourceY = sourceTops[i];
          endSourceY = sourceTops[i + 1];
          startTargetY = targetTops[i];
          endTargetY = targetTops[i + 1];
          sectionFound = true;
          break;
        }
      }
    }

    if (!sectionFound) {
      startSourceY = sourceTops[sourceTops.length - 1];
      endSourceY = sourceMax;
      startTargetY = targetTops[targetTops.length - 1];
      endTargetY = targetMax;
    }

    const sectionHeight = endSourceY - startSourceY;
    let sectionPercentage = sectionHeight > 0 ? (scrollY - startSourceY) / sectionHeight : 0;
    sectionPercentage = Math.max(0, Math.min(1, sectionPercentage));

    const targetScrollY = startTargetY + (endTargetY - startTargetY) * sectionPercentage;
    target.scrollTo({ top: targetScrollY });
  };

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

    isSyncingLeft.current = true;
    performSectionalSync(editorPanel, preview);
  }, []);

  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }

    isSyncingRight.current = true;
    performSectionalSync(preview, editorPanel);
  }, []);
`;

// Replace handleEditorScroll and handlePreviewScroll
const regex = /const handleEditorScroll = useCallback\([\s\S]*?const handlePreviewScroll = useCallback\([\s\S]*?\}, \[\]\);/m;
content = content.replace(regex, syncLogic.trim());

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
