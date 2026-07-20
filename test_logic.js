function getFocalOffset(containerRect, toolbarRect) {
  if (!toolbarRect) return 20;
  const toolbarTop = toolbarRect.top - containerRect.top;
  if (toolbarTop <= 1) {
    return toolbarRect.bottom - containerRect.top + 20;
  }
  return 20;
}

console.log("Not sticky (top of doc):", getFocalOffset({top: 0}, {top: 300, bottom: 400}));
console.log("Sticky (scrolled down):", getFocalOffset({top: 0}, {top: 0, bottom: 100}));
