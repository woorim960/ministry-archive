const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
  <div class="ProseMirror">
    <h1>Heading 1</h1>
    <p>Some text</p>
    <p><img src="test.jpg"></p>
    <h2>Heading 2</h2>
  </div>
`);
const document = dom.window.document;

const editorHeadings = Array.from(document.querySelectorAll(".ProseMirror > h1, .ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4, .ProseMirror > h5, .ProseMirror > h6, .ProseMirror img"));
console.log("Found:", editorHeadings.length);
