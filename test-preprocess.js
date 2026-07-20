function preprocessMarkdown(md) {
  if (!md) return "";
  let processed = md.replace(/^:::note\s*\[(.*?)\]\s*(.*?)$/gim, '<div data-type="callout" data-tone="$1" data-title="$2">');
  processed = processed.replace(/^:::toggle\s*(.*?)$/gim, '<div data-type="toggle" data-title="$1">');
  processed = processed.replace(/^:::$/gim, '</div>');
  return processed;
}

const md = `
## Hello

:::note[blue] Title
Some *content* with markdown.
:::
`;
console.log(preprocessMarkdown(md));
