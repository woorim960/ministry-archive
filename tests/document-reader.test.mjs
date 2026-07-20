import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("DocumentReader supports category specific layout handling", async () => {
  const source = await readFile(new URL("../components/DocumentReader.tsx", import.meta.url), "utf8");
  assert.match(source, /(!document\.docType \|\| document\.docType === "proposal")/);
  assert.match(source, /document\.docType === "meeting"/);
});

test("DocumentReader supports customMeta fields", async () => {
  const source = await readFile(new URL("../components/DocumentReader.tsx", import.meta.url), "utf8");
  assert.match(source, /document\.customMeta/);
  assert.match(source, /meta\.label/);
  assert.match(source, /meta\.value/);
});

test("Icons are exported and used for meta fields", async () => {
  const source = await readFile(new URL("../components/Icons.tsx", import.meta.url), "utf8");
  // Check if new icons exist
  assert.match(source, /export function TargetIcon/);
  assert.match(source, /export function MapPinIcon/);
  assert.match(source, /export function ActivityIcon/);
  assert.match(source, /export function LabelIcon/);
});
