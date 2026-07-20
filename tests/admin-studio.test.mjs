import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("AdminStudio has enter key handler for delete modal", async () => {
  const source = await readFile(new URL("../app/admin/AdminStudio.tsx", import.meta.url), "utf8");
  assert.match(source, /e\.key === "Enter"/);
  assert.match(source, /executeDelete\(\)/);
});

test("AdminStudio validatePublish handles undefined title and summary safely", async () => {
  const source = await readFile(new URL("../app/admin/AdminStudio.tsx", import.meta.url), "utf8");
  // Check if string casting is used before .trim()
  assert.match(source, /!String\(draft\.title \|\| ""\)\.trim\(\)/);
  assert.match(source, /!String\(draft\.summary \|\| ""\)\.trim\(\)/);
});

test("AdminStudio contains custom meta support", async () => {
  const source = await readFile(new URL("../app/admin/AdminStudio.tsx", import.meta.url), "utf8");
  assert.match(source, /customMeta/);
});
