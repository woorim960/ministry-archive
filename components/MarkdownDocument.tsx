/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { headingId, parseMarkdown, youtubeId } from "@/lib/markdown";

function inline(text: string): ReactNode[] {
  const output: ReactNode[] = [];
  let cursor = 0;
  let token = 0;
  while (cursor < text.length) {
    const start = text.indexOf("{{", cursor);
    if (start === -1) { output.push(...inlineBasic(text.slice(cursor), `tail-${token}`)); break; }
    if (start > cursor) output.push(...inlineBasic(text.slice(cursor, start), `plain-${token}`));
    const end = findCustomEnd(text, start);
    if (end === -1) { output.push(...inlineBasic(text.slice(start), `open-${token}`)); break; }
    const raw = text.slice(start + 2, end - 2);
    const separator = raw.indexOf("|");
    const header = separator > -1 ? raw.slice(0, separator) : "";
    const content = separator > -1 ? raw.slice(separator + 1) : raw;
    const custom = header.match(/^(color|bg):(red|blue|green|amber|violet|neutral)$/);
    if (custom) output.push(<span key={`custom-${token}`} className={`inline-${custom[1]} inline-${custom[2]}`}>{inline(content)}</span>);
    else output.push(...inlineBasic(text.slice(start, end), `invalid-${token}`));
    cursor = end;
    token += 1;
  }
  return output;
}

function inlineBasic(text: string, prefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|~~[^~]+~~|_[^_\n]+_|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${prefix}-${index}`}>{inline(part.slice(2, -2))}</strong>;
    if (part.startsWith("~~") && part.endsWith("~~")) return <del key={`${prefix}-${index}`}>{inline(part.slice(2, -2))}</del>;
    if (part.startsWith("_") && part.endsWith("_")) return <em key={`${prefix}-${index}`}>{inline(part.slice(1, -1))}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code className="inline-box" key={`${prefix}-${index}`}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeLink(link[2]);
      return href ? <a key={`${prefix}-${index}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{link[1]}</a> : <span key={`${prefix}-${index}`}>{link[1]}</span>;
    }
    return <span key={`${prefix}-${index}`}>{part}</span>;
  });
}

function findCustomEnd(text: string, start: number) {
  let depth = 0;
  for (let index = start; index < text.length - 1; index += 1) {
    const pair = text.slice(index, index + 2);
    if (pair === "{{") { depth += 1; index += 1; continue; }
    if (pair === "}}") { depth -= 1; index += 1; if (depth === 0) return index + 1; }
  }
  return -1;
}

function inlineLines(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => <span key={index}>{inline(line)}{index < lines.length - 1 && <br/>}</span>);
}

export function MarkdownDocument({ markdown, editable, onDropAt, onMoveBlock }: {
  markdown: string;
  editable?: boolean;
  onDropAt?: (files: FileList, line: number) => void;
  onMoveBlock?: (fromStart: number, fromEnd: number, targetLine: number) => void;
}) {
  const blocks = parseMarkdown(markdown);

  const dropZone = (line: number, key: string) => editable ? (
    <div
      className="editor-drop-zone"
      key={key}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
      onDrop={(event) => {
        event.preventDefault();
        const from = event.dataTransfer.getData("application/x-mapomarkdown-block");
        if (from && onMoveBlock) {
          const [start, end] = from.split(":").map(Number);
          onMoveBlock(start, end, line);
        } else if (event.dataTransfer.files.length && onDropAt) onDropAt(event.dataTransfer.files, line);
      }}
    ><span>이 위치에 이미지 놓기</span></div>
  ) : null;

  return (
    <div className="markdown-body">
      {dropZone(0, "drop-start")}
      {blocks.map((block, index) => {
        let content: ReactNode;
        if (block.type === "heading") {
          const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5";
          content = <Tag id={headingId(block.text || "")}>{block.text}</Tag>;
        } else if (block.type === "paragraph") {
          content = <p>{inlineLines(block.text || "")}</p>;
        } else if (block.type === "quote") {
          content = <blockquote>{inlineLines(block.text || "")}</blockquote>;
        } else if (block.type === "toggle") {
          content = <details className="document-toggle"><summary><span>{inline(block.title || "펼쳐보기")}</span><i aria-hidden="true"/></summary><div><p>{inlineLines(block.text || "")}</p></div></details>;
        } else if (block.type === "callout") {
          content = <aside className={`document-callout tone-${block.tone || "blue"}`}><span>진행자 참고</span>{block.title && block.title !== "진행자 참고" ? <h3>{block.title}</h3> : null}<p>{inlineLines(block.text || "")}</p></aside>;
        } else if (block.type === "list") {
          if (block.listItems && block.listItems.length > 0) {
            const nestedTree = buildNestedList(block.listItems);
            content = renderNestedList(nestedTree, Boolean(block.ordered), block.id);
          } else {
            const List = block.ordered ? "ol" : "ul";
            content = <List>{block.items?.map((item, i) => <li key={`${item}-${i}`} className={block.checked?.[i] !== null ? "check-item" : ""}>{block.checked?.[i] !== null && <span aria-hidden="true" className={block.checked?.[i] ? "checked" : ""}/>}<span>{inline(item)}</span></li>)}</List>;
          }
        } else if (block.type === "table") {
          content = <div className="table-scroll"><table><thead><tr>{block.rows?.[0]?.map((cell) => <th key={cell}>{inline(cell)}</th>)}</tr></thead><tbody>{block.rows?.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>;
        } else if (block.type === "image") {
          const src = safeImage(block.src || "");
          content = src ? <figure className={`document-image ${block.width || "content"}`}><img src={src} alt={block.alt || ""} loading="lazy"/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure> : <p className="embed-error">이미지 주소를 확인해 주세요.</p>;
        } else if (block.type === "youtube") {
          const id = youtubeId(block.url || "");
          content = id ? <figure className="video-embed"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={block.caption || "YouTube 영상"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure> : <p className="embed-error">YouTube 링크를 확인해 주세요.</p>;
        } else if (block.type === "code") {
          content = <pre><code>{block.text}</code></pre>;
        } else {
          content = <hr/>;
        }

        return (
          <div
            className={`markdown-block markdown-${block.type}`}
            key={block.id}
            data-source-line={block.startLine}
            draggable={editable && block.type === "image"}
            onDragStart={editable && block.type === "image" ? (event) => {
              event.dataTransfer.setData("application/x-mapomarkdown-block", `${block.startLine}:${block.endLine}`);
              event.dataTransfer.effectAllowed = "move";
            } : undefined}
          >
            {editable && block.type === "image" && <span className="image-drag-handle">이미지 이동</span>}
            {content}
            {dropZone(block.endLine + 1, `drop-${index}`)}
          </div>
        );
      })}
    </div>
  );
}

function safeLink(value: string) {
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try { const url = new URL(value); return ["https:", "mailto:"].includes(url.protocol) ? value : ""; } catch { return ""; }
}

function safeImage(value: string) {
  if (value.startsWith("/media/") || value.startsWith("/api/media/")) return value;
  return "";
}

type NestedListItem = {
  text: string;
  checked: boolean | null;
  children: NestedListItem[];
};

function buildNestedList(listItems: Array<{ text: string; depth: number; checked: boolean | null }>) {
  const root: NestedListItem[] = [];
  const stack: Array<{ item: NestedListItem; depth: number }> = [];

  for (const item of listItems) {
    const nested: NestedListItem = { text: item.text, checked: item.checked, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(nested);
    } else {
      stack[stack.length - 1].item.children.push(nested);
    }
    stack.push({ item: nested, depth: item.depth });
  }
  return root;
}

function renderNestedList(items: NestedListItem[], ordered: boolean, parentIndex: string): ReactNode {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List>
      {items.map((item, i) => {
        const key = `${parentIndex}-${i}`;
        return (
          <li key={key} className={item.checked !== null ? "check-item" : ""}>
            {item.checked !== null && (
              <span aria-hidden="true" className={item.checked ? "checked" : ""} />
            )}
            <span>{inline(item.text)}</span>
            {item.children.length > 0 && renderNestedList(item.children, ordered, key)}
          </li>
        );
      })}
    </List>
  );
}
