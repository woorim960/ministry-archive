const fs = require('fs');
const path = 'components/MarkdownDocument.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldWrapper = `        return (
          <div
            className={\`markdown-block markdown-\${block.type}\`}
            key={block.id}
            data-source-line={block.startLine}
            draggable={editable && block.type === "image"}
            onDragStart={editable && block.type === "image" ? (event) => {
              event.dataTransfer.setData("application/x-mapomarkdown-block", \`\${block.startLine}:\${block.endLine}\`);
              event.dataTransfer.effectAllowed = "move";
            } : undefined}
          >
            {editable && block.type === "image" && <span className="image-drag-handle">이미지 이동</span>}
            {content}
            {dropZone(block.endLine + 1, \`drop-\${index}\`)}
          </div>
        );`;

const newWrapper = `        return (
          <div
            className={\`markdown-block markdown-\${block.type}\`}
            key={block.id}
            data-source-line={block.startLine}
          >
            {content}
          </div>
        );`;

content = content.replace(oldWrapper, newWrapper);
fs.writeFileSync(path, content, 'utf8');
console.log("Done");
