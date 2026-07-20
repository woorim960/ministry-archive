import { parseMarkdown } from "../lib/markdown.ts";

const markdown = '![테스트이미지](/api/media/media/2026-07/test.jpg "테스트") {wide}';
const parsed = parseMarkdown(markdown);
console.log(JSON.stringify(parsed, null, 2));
