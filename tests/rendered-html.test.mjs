import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

let workerPromise;

function getWorker() {
  if (!workerPromise) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    workerPromise = import(workerUrl.href).then((module) => module.default);
  }
  return workerPromise;
}

async function render(pathname) {
  const worker = await getWorker();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders development preview metadata", async () => {
  const response = await render("/");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders planning markdown v2 blocks and inline styles", async () => {
  const [safetyResponse, quizResponse] = await Promise.all([
    render("/documents/sample-hint-safety"),
    render("/documents/sample-bible-quiz"),
  ]);
  assert.equal(safetyResponse.status, 200);
  assert.equal(quizResponse.status, 200);

  const safetyHtml = await safetyResponse.text();
  const quizHtml = await quizResponse.text();
  assert.match(safetyHtml, /<blockquote>/);
  assert.match(safetyHtml, /class="document-toggle"/);
  assert.match(quizHtml, /class="document-callout tone-green"/);
  assert.match(quizHtml, /class="inline-box"/);
  assert.match(quizHtml, /class="inline-color inline-blue"/);
  assert.match(quizHtml, /class="video-embed"/);
  assert.match(quizHtml, /youtube-nocookie\.com\/embed\/M7lc1UVf-VE/);
  assert.doesNotMatch(quizHtml, /class="document-cover/);

  const archiveResponse = await render("/archive");
  assert.equal(archiveResponse.status, 200);
  assert.match(await archiveResponse.text(), /\/brand\/default-document-cover\.svg/);
});

test("renders the Relay Folio brand system and metadata", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /class="relay-folio-mark is-brand/);
  assert.match(html, /class="relay-folio-mark is-monochrome/);
  assert.match(html, /rel="manifest" href="[^"]*\/manifest\.webmanifest"/);
  assert.match(html, /\/brand\/og-brand\.png/);

  const assets = [
    "relay-folio-symbol.svg",
    "relay-folio-symbol-mono.svg",
    "relay-folio-symbol-reverse.svg",
    "relay-folio-lockup.svg",
    "relay-folio-lockup-mono.svg",
    "relay-folio-lockup-reverse.svg",
    "apple-touch-icon.png",
    "app-icon-192.png",
    "app-icon-512.png",
    "og-brand.png",
    "default-document-cover.svg",
  ];
  for (const asset of assets) {
    const info = await stat(new URL(`../public/brand/${asset}`, import.meta.url));
    assert.ok(info.size > 100, `${asset} should be a non-empty brand asset`);
  }
});

test("ships the focused editor controls and inline help", async () => {
  const source = await readFile(new URL("../app/admin/AdminStudio.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /left-collapsed/);
  assert.match(source, /right-collapsed/);
  assert.match(source, /data-help=/);
  assert.match(source, /유튜브 영상 추가/);
  assert.match(source, /접고 펴는 블록을 자동으로 만듭니다/);
  assert.match(source, /toggleFocusMode/);
  assert.match(source, /WORKSPACE_VIEW_KEY/);
  assert.match(source, /WORKING_DRAFTS_KEY/);
  assert.match(source, /className="panel-header"/);
  assert.match(source, /toolbar-groups-viewport/);
  assert.match(source, /newWorkingDrafts\.map/);
  assert.match(source, /전체 기획서/);
  assert.doesNotMatch(source, /className="new-resource"/);
  assert.match(styles, /studio-workspace\.left-collapsed\.right-collapsed/);
  assert.match(styles, /\.youtube-popover/);
  assert.match(styles, /\.editor-panel\{min-width:0;max-width:100%;overflow-x:hidden;overflow-y:auto\}/);
  assert.match(styles, /\.toolbar-groups-viewport\{display:block!important;/);
});

test("makes the writing entry easy to discover", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /href="\/admin"[^>]*class="write-entry"/);
  assert.match(html, /기획서 작성/);
  assert.match(html, /class="mobile-write-entry"/);
});
