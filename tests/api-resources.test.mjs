import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("POST API has slug fallback logic to prevent empty slugs", async () => {
  const source = await readFile(new URL("../app/api/admin/resources/route.ts", import.meta.url), "utf8");
  assert.match(source, /if \(!slug\) slug = `draft-\$\{id\.slice\(0, 8\)\}`/);
});

test("DELETE API uses decodeURIComponent for slug decoding", async () => {
  const source = await readFile(new URL("../app/api/admin/resources/[slug]/route.ts", import.meta.url), "utf8");
  assert.match(source, /const decodedSlug = decodeURIComponent\(slug\)/);
});
