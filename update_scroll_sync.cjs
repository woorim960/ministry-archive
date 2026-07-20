const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add RAF state at the top of AdminStudio component
if (!content.includes('scrollTargetY')) {
  content = content.replace(
    /const scrollTimeout = useRef<NodeJS\.Timeout \| null>\(null\);/,
    'const scrollTimeout = useRef<NodeJS.Timeout | null>(null);\n  const scrollTargetY = useRef<number | null>(null);\n  const rafId = useRef<number | null>(null);'
  );
}

// 2. Add lerpScroll function inside component
const lerpFunction = `
  const lerpScroll = useCallback((container: HTMLElement) => {
    if (scrollTargetY.current === null) return;
    const currentY = container.scrollTop;
    const diff = scrollTargetY.current - currentY;
    
    if (Math.abs(diff) < 1) {
      container.scrollTo({ top: scrollTargetY.current });
      scrollTargetY.current = null;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }
    
    container.scrollTo({ top: currentY + diff * 0.15 });
    rafId.current = requestAnimationFrame(() => lerpScroll(container));
  }, []);

  const smoothScrollTo = useCallback((container: HTMLElement, targetY: number) => {
    scrollTargetY.current = targetY;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => lerpScroll(container));
  }, [lerpScroll]);
`;

if (!content.includes('const lerpScroll')) {
  content = content.replace(
    /const performSectionalSync = \(source: HTMLElement, target: HTMLElement\) => \{/,
    lerpFunction.trim() + '\n\n  const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {'
  );
}

// 3. Update performSectionalSync to use Text-based focal sync + fallback to proportional
const oldPerformSectionalSync = /const performSectionalSync = \(source: HTMLElement, target: HTMLElement\) => \{[\s\S]*?target\.scrollTo\(\{ top: targetScrollY \}\);\n  \};/m;

const newPerformSectionalSync = `const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
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

    // 1. Text-based Focal Sync (Exact Match)
    const focalOffset = 100; // 100px from top
    const sourceFocalY = sourceContainerRect.top + focalOffset;
    
    const sourceQuery = isSourceEditor ? ".ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror img, .ProseMirror li" : ".markdown-body p, .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body img, .markdown-body li";
    const targetQuery = isSourceEditor ? ".markdown-body p, .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body img, .markdown-body li" : ".ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror img, .ProseMirror li";

    const sourceNodes = Array.from(source.querySelectorAll(sourceQuery));
    const targetNodes = Array.from(target.querySelectorAll(targetQuery));

    let closestSourceNode = null;
    let minDistance = Infinity;

    for (const node of sourceNodes) {
      const rect = node.getBoundingClientRect();
      if (rect.height === 0) continue;
      // We want the node that covers the focal point, or is closest to it
      const distance = Math.max(0, sourceFocalY - rect.bottom, rect.top - sourceFocalY);
      if (distance < minDistance) {
        minDistance = distance;
        closestSourceNode = node;
      }
    }

    let matchingTargetNode = null;
    if (closestSourceNode && minDistance < 200) {
      if (closestSourceNode.tagName === 'IMG') {
        const src = closestSourceNode.src;
        matchingTargetNode = targetNodes.find(node => node.tagName === 'IMG' && node.src === src);
      } else {
        const text = closestSourceNode.textContent?.trim() || "";
        if (text.length > 3) {
          const snippet = text.substring(0, 30);
          matchingTargetNode = targetNodes.find(node => node.textContent && node.textContent.includes(snippet));
        }
      }
    }

    if (closestSourceNode && matchingTargetNode) {
      const sourceRect = closestSourceNode.getBoundingClientRect();
      const targetRect = matchingTargetNode.getBoundingClientRect();
      const percentage = (sourceFocalY - sourceRect.top) / (sourceRect.height || 1);
      
      const targetFocalOffset = targetRect.top - targetContainerRect.top + (targetRect.height * percentage);
      targetScrollY = target.scrollTop + targetFocalOffset - focalOffset;
    } else {
      // 2. Fallback to Proportional Anchors
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
    }

    // Apply exact boundary constraints
    targetScrollY = Math.max(0, Math.min(targetMax, targetScrollY));
    
    // Smooth scroll instead of instant jump
    smoothScrollTo(target, targetScrollY);
  };`;

content = content.replace(oldPerformSectionalSync, newPerformSectionalSync);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
