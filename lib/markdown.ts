import type { MarkdownBlock } from "@/types/content";

function isBlockStart(line: string) {
  return /^(#{1,5})\s+/.test(line) || /^```/.test(line) || /^:::note\\?\[/.test(line) || /^:::toggle/.test(line) || /^\\?>/.test(line) || /^(?:\s*[-*]\s+|\s*\d+\.\s+)/.test(line) || /^---+$/.test(line) || /^!\\?\[/.test(line) || /^@youtube\\?\[/.test(line) || /^\|/.test(line);
}

export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  const push = (block: Omit<MarkdownBlock, "id">) => {
    blocks.push({ ...block, id: `md-${block.startLine}-${blocks.length}` });
  };

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const startLine = index;

    const heading = line.match(/^(#{1,5})\s+(.+)$/);
    if (heading) {
      push({ type: "heading", raw: line, startLine, endLine: index, level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) { codeLines.push(lines[index]); index += 1; }
      if (index < lines.length) index += 1;
      push({ type: "code", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, text: codeLines.join("\n") });
      continue;
    }

    const image = line.match(/^!\[(.*?)\]\((\S+?)(?:\s+"(.*?)")?\)\s*(?:\{(content|wide|full)\})?$/);
    if (image) {
      push({ type: "image", raw: line, startLine, endLine: index, alt: image[1], src: image[2], caption: image[3], width: (image[4] as MarkdownBlock["width"]) || "content" });
      index += 1;
      continue;
    }

    const youtube = line.match(/^@youtube\\?\[(.*?)\\?\]\\?\((.*?)\\?\)$/);
    if (youtube) {
      push({ type: "youtube", raw: line, startLine, endLine: index, caption: youtube[1], url: youtube[2] });
      index += 1;
      continue;
    }

    const noteDirective = line.match(/^:::note\\?\[(red|rose|blue|green|amber|violet|neutral|gray|slate)\\?\]\s*(.*)$/i);
    if (noteDirective) {
      const closing = lines.findIndex((candidate, candidateIndex) => candidateIndex > index && candidate.replace(/\\/g, "").trim() === ":::");
      if (closing !== -1) {
        const toneAlias = noteDirective[1].toLowerCase();
        const tone = toneAlias === "rose" ? "red" : ["gray", "slate"].includes(toneAlias) ? "neutral" : toneAlias;
        push({
          type: "callout", raw: lines.slice(startLine, closing + 1).join("\n"), startLine, endLine: closing,
          title: noteDirective[2].trim() || "참고", text: lines.slice(index + 1, closing).join("\n").trim(), tone: tone as MarkdownBlock["tone"],
        });
        index = closing + 1;
        continue;
      }
    }

    const toggleDirective = line.match(/^:::toggle\s*(.*)$/i);
    if (toggleDirective) {
      const closing = lines.findIndex((candidate, candidateIndex) => candidateIndex > index && candidate.replace(/\\/g, "").trim() === ":::");
      if (closing !== -1) {
        push({
          type: "toggle", raw: lines.slice(startLine, closing + 1).join("\n"), startLine, endLine: closing,
          title: toggleDirective[1].trim() || "펼쳐보기", text: lines.slice(index + 1, closing).join("\n").trim() || "내용이 없습니다."
        });
        index = closing + 1;
        continue;
      }
    }

    const note = line.match(/^>\s*\[!NOTE(?::(red|blue|green|amber|violet|neutral))?\]\s*(.*)$/i);
    if (note) {
      const title = note[2].trim() || "참고";
      const noteLines: string[] = [];
      index += 1;
      while (index < lines.length && /^>/.test(lines[index])) { noteLines.push(lines[index].replace(/^>\s?/, "")); index += 1; }
      push({ type: "callout", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, title, text: noteLines.join("\n"), tone: (note[1]?.toLowerCase() as MarkdownBlock["tone"]) || "blue" });
      continue;
    }

    if (/^\\?>/.test(line)) {
      const isQuote = (index + 1 >= lines.length) || /^\\?>/.test(lines[index + 1]) || (!/^ {2}/.test(lines[index + 1]) && lines[index+1].trim() !== "");
      
      if (isQuote) {
        const quoteLines: string[] = [];
        quoteLines.push(line.replace(/^\\?>\s?/, ""));
        index += 1;
        while (index < lines.length) {
          if (/^\\?>/.test(lines[index])) { quoteLines.push(lines[index].replace(/^\\?>\s?/, "")); index += 1; continue; }
          if (!lines[index].trim() && index + 1 < lines.length && /^\\?>/.test(lines[index + 1])) { quoteLines.push(""); index += 1; continue; }
          break;
        }
        push({ type: "quote", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, text: quoteLines.join("\n") });
        continue;
      } else {
        const title = line.replace(/^\\?>\s?/, "").trim() || "펼쳐보기";
        const toggleLines: string[] = [];
        index += 1;
        while (index < lines.length) {
          if (/^(?: {2,}|\t)/.test(lines[index])) { toggleLines.push(lines[index].replace(/^(?: {2}|\t)/, "")); index += 1; continue; }
          if (!lines[index].trim() && index + 1 < lines.length && /^(?: {2,}|\t)/.test(lines[index + 1])) { toggleLines.push(""); index += 1; continue; }
          break;
        }
        push({ type: "toggle", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, title, text: toggleLines.join("\n").trim() || "내용이 없습니다." });
        continue;
      }
    }

            if (/^---+$/.test(line.trim())) {
      push({ type: "divider", raw: line, startLine, endLine: index });
      index += 1;
      continue;
    }

    const listPattern = /^(\s*)([-*]|\d+\.)\s*(.*)$/;
    if (listPattern.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      const checked: Array<boolean | null> = [];
      const listItems: Array<{ text: string; depth: number; checked: boolean | null }> = [];
      while (index < lines.length) {
        const currentLine = lines[index];
        const match = currentLine.match(listPattern);
        if (!match) break;
        const indentStr = match[1] || "";
        const spaceCount = indentStr.replace(/\t/g, "  ").length;
        const depth = Math.floor(spaceCount / 2);
        const content = match[3] || "";
        const check = content.match(/^\[([ xX])\]\s+(.*)$/);
        const itemText = check ? check[2] : content;
        const isChecked = check ? check[1].toLowerCase() === "x" : null;
        items.push(itemText);
        checked.push(isChecked);
        listItems.push({ text: itemText, depth, checked: isChecked });
        index += 1;
      }
      push({ type: "list", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, ordered, items, checked, listItems });
      continue;
    }

    if (/^\|/.test(line) && index + 1 < lines.length && /^\|?\s*:?-+/.test(lines[index + 1])) {
      const rows: string[][] = [];
      const parseRow = (value: string) => value.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      rows.push(parseRow(line));
      index += 2;
      while (index < lines.length && /^\|/.test(lines[index])) { rows.push(parseRow(lines[index])); index += 1; }
      push({ type: "table", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, rows });
      continue;
    }

    if (/^\|(?:\s|$)/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^\|(?:\s|$)/.test(lines[index])) { quoteLines.push(lines[index].replace(/^\|\s?/, "")); index += 1; }
      push({ type: "quote", raw: lines.slice(startLine, index).join("\n"), startLine, endLine: index - 1, text: quoteLines.join("\n") });
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) { paragraph.push(lines[index]); index += 1; }
    push({ type: "paragraph", raw: paragraph.join("\n"), startLine, endLine: index - 1, text: paragraph.join("\n") });
  }

  return blocks;
}

export function headingId(text: string) {
  return `section-${text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) return "";
    const parts = parsed.pathname.split("/").filter(Boolean);
    const routeIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
    const id = host === "youtu.be" ? parts[0] || "" : routeIndex > -1 ? parts[routeIndex + 1] || "" : parsed.searchParams.get("v") || "";
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
  } catch { return ""; }
}

export function insertMarkdownAtLine(markdown: string, lineIndex: number, content: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const safeIndex = Math.max(0, Math.min(lineIndex, lines.length));
  lines.splice(safeIndex, 0, "", content, "");
  return lines.join("\n").replace(/\n{4,}/g, "\n\n\n");
}

export function moveMarkdownBlock(markdown: string, fromStart: number, fromEnd: number, targetLine: number) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const removed = lines.splice(fromStart, fromEnd - fromStart + 1);
  const adjustedTarget = targetLine > fromEnd ? targetLine - removed.length : targetLine;
  lines.splice(Math.max(0, adjustedTarget), 0, "", ...removed, "");
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function upgradeMarkdownV1(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let inFence = false;
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (/^```/.test(line)) { inFence = !inFence; output.push(line); index += 1; continue; }
    const legacyNote = !inFence ? line.match(/^>\s*\[!NOTE(?::(red|blue|green|amber|violet|neutral))?\]\s*(.*)$/i) : null;
    if (legacyNote) {
      output.push(`:::note[${legacyNote[1]?.toLowerCase() || "blue"}] ${legacyNote[2].trim() || "진행자 참고"}`);
      index += 1;
      while (index < lines.length && /^>/.test(lines[index])) { output.push(lines[index].replace(/^>\s?/, "")); index += 1; }
      output.push(":::");
      continue;
    }
    if (!inFence && /^>/.test(line)) { output.push(line.replace(/^>/, "|")); index += 1; continue; }
    output.push(line);
    index += 1;
  }
  return output.join("\n");
}
