import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSidebarDocuments,
  mergeSavedDocuments,
  removeWorkingDocument,
  serverClientKey,
  upsertWorkingDocument,
} from "../lib/editor-workspace.ts";

test("keeps independent unsaved drafts while switching documents", () => {
  const first = { clientKey: "local:first", id: "", title: "첫 초안" };
  const second = { clientKey: "local:second", id: "", title: "두 번째 초안" };
  const documents = upsertWorkingDocument(upsertWorkingDocument([], first), second);

  assert.equal(documents.length, 2);
  assert.equal(documents.find((item) => item.clientKey === first.clientKey)?.title, "첫 초안");
  assert.equal(documents.find((item) => item.clientKey === second.clientKey)?.title, "두 번째 초안");
});

test("updates one working copy without overwriting another", () => {
  const first = { clientKey: "local:first", id: "", title: "수정 전" };
  const second = { clientKey: "local:second", id: "", title: "유지" };
  const documents = upsertWorkingDocument([first, second], { ...first, title: "수정 후" });

  assert.equal(documents.length, 2);
  assert.equal(documents.find((item) => item.clientKey === first.clientKey)?.title, "수정 후");
  assert.equal(documents.find((item) => item.clientKey === second.clientKey)?.title, "유지");
  assert.deepEqual(documents.map((item) => item.clientKey), ["local:first", "local:second"]);
});

test("keeps the sidebar order stable when users switch or edit documents", () => {
  const first = { clientKey: "local:first", id: "", title: "첫 번째" };
  const second = { clientKey: "local:second", id: "", title: "두 번째" };
  const third = { clientKey: "local:third", id: "", title: "세 번째" };
  const documents = upsertWorkingDocument([first, second, third], { ...second, title: "두 번째 수정" });

  assert.deepEqual(documents.map((item) => item.clientKey), ["local:first", "local:second", "local:third"]);
});

test("shows every saved document while marking its working copy", () => {
  const first = { clientKey: serverClientKey("resource-1"), id: "resource-1", title: "첫 글" };
  const second = { clientKey: serverClientKey("resource-2"), id: "resource-2", title: "둘째 글" };
  const workingCopy = { ...first, title: "첫 글 수정 중" };
  const sidebar = buildSidebarDocuments([workingCopy], [first, second]);

  assert.equal(sidebar.working.length, 0);
  assert.equal(sidebar.saved.length, 2);
  assert.equal(sidebar.saved[0].document.title, "첫 글 수정 중");
  assert.equal(sidebar.saved[0].hasUnsavedChanges, true);
  assert.equal(sidebar.saved[1].hasUnsavedChanges, false);
});

test("moves a document only after an explicit successful save", () => {
  const first = { clientKey: serverClientKey("resource-1"), id: "resource-1", title: "첫 글" };
  const second = { clientKey: serverClientKey("resource-2"), id: "resource-2", title: "둘째 글" };
  const updatedSecond = { ...second, title: "둘째 글 수정" };

  assert.deepEqual(mergeSavedDocuments([first, second], updatedSecond).map((item) => item.id), ["resource-2", "resource-1"]);
});

test("replaces the temporary copy after the first server save without duplicates", () => {
  const local = { clientKey: "local:first", id: "", title: "새 기획서" };
  const saved = { clientKey: serverClientKey("resource-1"), id: "resource-1", title: "새 기획서" };
  const working = removeWorkingDocument([local], local.clientKey, saved.clientKey);
  const serverDocuments = mergeSavedDocuments([], saved);

  assert.deepEqual(working, []);
  assert.equal(serverDocuments.length, 1);
  assert.equal(serverDocuments[0].clientKey, "server:resource-1");
});
