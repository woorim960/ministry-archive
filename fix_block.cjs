const fs = require('fs');
const path = 'lib/markdown.ts';
let content = fs.readFileSync(path, 'utf8');

const oldToggle = `    if (/^>/.test(line)) {
      const title = line.replace(/^>\\s?/, "").trim() || "펼쳐보기";
      const toggleLines: string[] = [];
      index += 1;
      while (index < lines.length) {
        if (/^>/.test(lines[index])) { toggleLines.push(lines[index].replace(/^>\\s?/, "")); index += 1; continue; }
        if (/^(?: {2,}|\\t)/.test(lines[index])) { toggleLines.push(lines[index].replace(/^(?: {2}|\\t)/, "")); index += 1; continue; }
        if (!lines[index].trim() && index + 1 < lines.length && /^(?: {2,}|\\t|>)/.test(lines[index + 1])) { toggleLines.push(""); index += 1; continue; }
        break;
      }
      push({ type: "toggle", raw: lines.slice(startLine, index).join("\\n"), startLine, endLine: index - 1, title, text: toggleLines.join("\\n").trim() || "내용이 없습니다." });
      continue;
    }`;

const newToggle = `    if (/^>/.test(line)) {
      const isQuote = (index + 1 >= lines.length) || /^>/.test(lines[index + 1]) || (!/^ {2}/.test(lines[index + 1]) && lines[index+1].trim() !== "");
      
      if (isQuote) {
        const quoteLines: string[] = [];
        quoteLines.push(line.replace(/^>\\s?/, ""));
        index += 1;
        while (index < lines.length) {
          if (/^>/.test(lines[index])) { quoteLines.push(lines[index].replace(/^>\\s?/, "")); index += 1; continue; }
          if (!lines[index].trim() && index + 1 < lines.length && /^>/.test(lines[index + 1])) { quoteLines.push(""); index += 1; continue; }
          break;
        }
        push({ type: "quote", raw: lines.slice(startLine, index).join("\\n"), startLine, endLine: index - 1, text: quoteLines.join("\\n") });
        continue;
      } else {
        const title = line.replace(/^>\\s?/, "").trim() || "펼쳐보기";
        const toggleLines: string[] = [];
        index += 1;
        while (index < lines.length) {
          if (/^(?: {2,}|\\t)/.test(lines[index])) { toggleLines.push(lines[index].replace(/^(?: {2}|\\t)/, "")); index += 1; continue; }
          if (!lines[index].trim() && index + 1 < lines.length && /^(?: {2,}|\\t)/.test(lines[index + 1])) { toggleLines.push(""); index += 1; continue; }
          break;
        }
        push({ type: "toggle", raw: lines.slice(startLine, index).join("\\n"), startLine, endLine: index - 1, title, text: toggleLines.join("\\n").trim() || "내용이 없습니다." });
        continue;
      }
    }`;

content = content.replace(oldToggle, newToggle);
fs.writeFileSync(path, content, 'utf8');
console.log("Done");
