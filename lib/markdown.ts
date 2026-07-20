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
