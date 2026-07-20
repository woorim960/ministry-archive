const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace everything from `const isSyncingLeft = useRef(false);` down to the end of `smoothScrollTo`
const startRegex = /  const isSyncingLeft = useRef\(false\);/;
const endRegex = /  const smoothScrollTo = useCallback[^]+?\}, \[lerpScroll\]\);\n/;

content = content.replace(new RegExp(startRegex.source + '[\\s\\S]*?' + endRegex.source), '  const lastInteractedPanel = useRef<"editor" | "preview">("editor");\n');

const performSectionalSyncOld = /  const performSectionalSync = \(source: HTMLElement, target: HTMLElement\) => \{[\s\S]*?\/\/ Smooth scroll instead of instant jump\n    smoothScrollTo\(target, targetScrollY\);\n  \};/;

const performSectionalSyncNew = `  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    const isSourceEditor = source.classList.contains("editor-panel");
    const editorEl = isSourceEditor ? source : target;
    const previewEl = isSourceEditor ? target : source;

    const sourceContainerRect = source.getBoundingClientRect();
    const targetContainerRect = target.getBoundingClientRect();

    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    const scrollY = source.scrollTop;
    
    if (sourceMax <= 0 || targetMax <= 0) return;

    let targetScrollY = 0;

    const sourceTextEl = isSourceEditor ? editorEl.querySelector(".ProseMirror") : previewEl.querySelector(".markdown-body");
    const targetTextEl = isSourceEditor ? previewEl.querySelector(".markdown-body") : editorEl.querySelector(".ProseMirror");

    const sourceTextTop = sourceTextEl ? sourceTextEl.getBoundingClientRect().top - sourceContainerRect.top + source.scrollTop : 0;
    const targetTextTop = targetTextEl ? targetTextEl.getBoundingClientRect().top - targetContainerRect.top + target.scrollTop : 0;

    const anchors = [{ s: 0, t: 0 }];
    if (sourceTextTop > 0 || targetTextTop > 0) anchors.push({ s: sourceTextTop, t: targetTextTop });

    const editorHeadings = Array.from(editorEl.querySelectorAll(".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6, .ProseMirror img"));
    const previewHeadings = Array.from(previewEl.querySelectorAll(".markdown-body > div > h1, .markdown-body > div > h2, .markdown-body > div > h3, .markdown-body > div > h4, .markdown-body > div > h5, .markdown-body > div > h6, .markdown-body > div > figure.document-image > img"));

    const sHeads = isSourceEditor ? editorHeadings : previewHeadings;
    const tHeads = isSourceEditor ? previewHeadings : editorHeadings;

    if (sHeads.length > 0 && sHeads.length === tHeads.length) {
      for (let i = 0; i < sHeads.length; i++) {
        const s = sHeads[i].getBoundingClientRect().top - sourceContainerRect.top + source.scrollTop;
        const t = tHeads[i].getBoundingClientRect().top - targetContainerRect.top + target.scrollTop;
        if (s < sourceMax && t < targetMax) anchors.push({ s, t });
      }
    }

    anchors.push({ s: sourceMax, t: targetMax });

    let validAnchors = [anchors[0]];
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].s > validAnchors[validAnchors.length - 1].s && anchors[i].t >= validAnchors[validAnchors.length - 1].t) {
        validAnchors.push(anchors[i]);
      } else if (i === anchors.length - 1) {
        validAnchors.push({
          s: Math.max(anchors[i].s, validAnchors[validAnchors.length - 1].s + 1),
          t: Math.max(anchors[i].t, validAnchors[validAnchors.length - 1].t)
        });
      }
    }

    let start = validAnchors[0];
    let end = validAnchors[validAnchors.length - 1];
    for (let i = 0; i < validAnchors.length - 1; i++) {
      if (scrollY >= validAnchors[i].s && scrollY <= validAnchors[i + 1].s) {
        start = validAnchors[i];
        end = validAnchors[i + 1];
        break;
      }
    }

    const sectionHeight = end.s - start.s;
    let sectionPercentage = sectionHeight > 0 ? (scrollY - start.s) / sectionHeight : 0;
    sectionPercentage = Math.max(0, Math.min(1, sectionPercentage));
    targetScrollY = start.t + (end.t - start.t) * sectionPercentage;
    
    targetScrollY = Math.max(0, Math.min(targetMax, targetScrollY));
    target.scrollTo({ top: targetScrollY });
  };`;

content = content.replace(performSectionalSyncOld, performSectionalSyncNew);

const editorScrollOld = `  const handleEditorScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "editor") return;
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
  }, []);`;

const editorScrollNew = `  const handleEditorScroll = useCallback(() => {
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

content = content.replace(editorScrollOld, editorScrollNew);

const previewScrollOld = `  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "preview") return;
    if (isSyncingLeft.current) return;

    isSyncingRight.current = true;
    performSectionalSync(preview, editorPanel);
  }, []);`;

const previewScrollNew = `  const handlePreviewScroll = useCallback(() => {
    const editorPanel = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!editorPanel || !preview) return;

    if (lastInteractedPanel.current !== "preview") return;

    performSectionalSync(preview, editorPanel);
  }, []);`;

content = content.replace(previewScrollOld, previewScrollNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
