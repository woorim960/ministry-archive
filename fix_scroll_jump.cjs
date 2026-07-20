const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const performSectionalSync = \([\s\S]*?target\.scrollTo\(\{ top: targetScrollY \}\);\n  \};/m;

const newLogic = `const performSectionalSync = (source: HTMLElement, target: HTMLElement) => {
    const isSourceEditor = source.classList.contains("editor-panel");
    const editorEl = isSourceEditor ? source : target;
    const previewEl = isSourceEditor ? target : source;

    const editorHeadings = Array.from(editorEl.querySelectorAll(".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6")) as HTMLElement[];
    const previewHeadings = Array.from(previewEl.querySelectorAll(".markdown-body > div > h1, .markdown-body > div > h2, .markdown-body > div > h3, .markdown-body > div > h4, .markdown-body > div > h5, .markdown-body > div > h6")) as HTMLElement[];

    const sourceHeadings = isSourceEditor ? editorHeadings : previewHeadings;
    const targetHeadings = isSourceEditor ? previewHeadings : editorHeadings;

    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    const scrollY = source.scrollTop;

    const sourceContainerRect = source.getBoundingClientRect();
    const targetContainerRect = target.getBoundingClientRect();

    const anchors: {s: number, t: number}[] = [{ s: 0, t: 0 }];

    if (sourceHeadings.length > 0 && sourceHeadings.length === targetHeadings.length) {
      for (let i = 0; i < sourceHeadings.length; i++) {
        const s = sourceHeadings[i].getBoundingClientRect().top - sourceContainerRect.top + source.scrollTop;
        const t = targetHeadings[i].getBoundingClientRect().top - targetContainerRect.top + target.scrollTop;
        
        // 도달할 수 없는 앵커(화면 최상단으로 올릴 수 없는 마지막 영역의 제목들)는 필터링
        if (s < sourceMax && t < targetMax) {
          anchors.push({ s, t });
        }
      }
    }

    // 문서의 절대적인 끝을 마지막 앵커로 추가
    anchors.push({ s: sourceMax, t: targetMax });

    // 역주행(Backwards scroll)이나 역방향 앵커 방지를 위한 Monotonicity 검증
    let validAnchors = [anchors[0]];
    for (let i = 1; i < anchors.length; i++) {
      if (anchors[i].s > validAnchors[validAnchors.length - 1].s && anchors[i].t >= validAnchors[validAnchors.length - 1].t) {
        validAnchors.push(anchors[i]);
      } else if (i === anchors.length - 1) {
        // 마지막 앵커(sourceMax, targetMax)는 무조건 갱신하되, s값이 이전보다 작으면 강제 보정
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

    const targetScrollY = start.t + (end.t - start.t) * sectionPercentage;
    target.scrollTo({ top: targetScrollY });
  };`;

content = content.replace(regex, newLogic);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
