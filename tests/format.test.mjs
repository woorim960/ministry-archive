import assert from "node:assert/strict";
import test from "node:test";
import { slugify } from "../lib/format.ts";

test("slugify correctly formats normal text", () => {
  assert.equal(slugify("Hello World 2024"), "hello-world-2024");
  assert.equal(slugify("구세군 마포영문 프로젝트"), "구세군-마포영문-프로젝트");
});

test("slugify handles strings containing only non-alphanumeric or non-hangul characters", () => {
  // Only consonants (자음) which get stripped out
  assert.equal(slugify("ㅅㄷㄴㅅ"), "");
  
  // Only special characters
  assert.equal(slugify("!@#$%^"), "");
});

test("slugify handles undefined or null gracefully without throwing an error", () => {
  assert.equal(slugify(undefined), "");
  assert.equal(slugify(null), "");
  assert.equal(slugify(""), "");
});
