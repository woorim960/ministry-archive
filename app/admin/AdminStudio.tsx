"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BrandMark } from "@/components/BrandMark";
import { ArrowIcon, FocusIcon, ImageIcon, PanelLeftIcon, PanelRightIcon, PlusIcon, ToggleIcon, VideoIcon } from "@/components/Icons";
import { DocumentReader } from "@/components/DocumentReader";
import { buildSidebarDocuments, createLocalClientKey, mergeSavedDocuments, removeWorkingDocument, serverClientKey, upsertWorkingDocument } from "@/lib/editor-workspace";
import { insertMarkdownAtLine, moveMarkdownBlock, youtubeId } from "@/lib/markdown";
import { slugify } from "@/lib/format";
import type { ResourceSummary } from "@/types/content";

type Draft = ResourceSummary & { isPublished: boolean; clientKey: string };
type SavePhase = "ready" | "dirty" | "saving" | "saved" | "error";
type PaletteKind = "text" | "background" | "note" | null;

const LOCAL_DRAFT_KEY = "mapo-planning-studio-draft-v2";
const WORKING_DRAFTS_KEY = "mapo-planning-studio-drafts-v3";
const WORKSPACE_VIEW_KEY = "mapo-planning-studio-view-v1";
const tones = [
  { value: "red", label: "중요" }, { value: "blue", label: "안내" }, { value: "green", label: "팁" },
  { value: "amber", label: "주의" }, { value: "violet", label: "아이디어" }, { value: "neutral", label: "메모" },
] as const;

const starterMarkdown = `## 기획 의도

이 기획이 필요한 이유와 참가자가 기억하기 바라는 메시지를 적어주세요.

## 준비

- 준비물
- 공간과 인원
- 진행 전 확인할 내용

## 진행 흐름

1. 시작
2. 핵심 활동
3. 마무리와 나눔

:::note[blue] 진행자 참고
현장에서 꼭 기억할 내용을 적어주세요.
:::
`;

function createEmptyDraft(clientKey = "local:initial"): Draft {
  return {
    clientKey, id: "", slug: "", title: "", summary: "", category: "기독교 콘텐츠 기획", audience: "", duration: "",
    participants: "", difficulty: "", coverUrl: "", tags: [], markdown: starterMarkdown, isPublished: false,
    updatedAt: new Date().toISOString(), readMinutes: 3, contentFormat: "markdown-v2",
  };
}

export function AdminStudio({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [draft, setDraft] = useState<Draft>(() => createEmptyDraft());
  const [activeKey, setActiveKey] = useState("local:initial");
  const [workingDrafts, setWorkingDrafts] = useState<Draft[]>(() => [createEmptyDraft()]);
  const [saved, setSaved] = useState<Draft[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [savePhase, setSavePhase] = useState<SavePhase>("ready");
  const [savedAt, setSavedAt] = useState("");
  const [notice, setNotice] = useState("빈 초안도 바로 저장할 수 있습니다.");
  const [uploading, setUploading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [palette, setPalette] = useState<PaletteKind>(null);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeCaption, setYoutubeCaption] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const toolbarViewportRef = useRef<HTMLDivElement>(null);
  const toolbarWheelRef = useRef<((e: WheelEvent) => void) | null>(null);
  const toolbarCallbackRef = (node: HTMLDivElement | null) => {
    // Remove from previous
    if (toolbarViewportRef.current && toolbarWheelRef.current) {
      toolbarViewportRef.current.removeEventListener("wheel", toolbarWheelRef.current);
    }
    (toolbarViewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (node) {
      function handleWheel(event: WheelEvent) {
        if (node.scrollWidth <= node.clientWidth || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
        event.preventDefault();
        node.scrollLeft += event.deltaY;
      }
      toolbarWheelRef.current = handleWheel;
      node.addEventListener("wheel", handleWheel, { passive: false });
    }
  };
  const saveInFlight = useRef(false);
  const activeKeyRef = useRef(draft.clientKey);
  const toolbarDrag = useRef({ active: false, startX: 0, startScrollLeft: 0, didDrag: false });
  const previousWorkspaceView = useRef({ left: true, right: true });
  const [workspaceViewLoaded, setWorkspaceViewLoaded] = useState(false);
  const previewDoc = useMemo<ResourceSummary>(() => ({
    ...draft,
    title: draft.title || "제목 없는 기획서",
    summary: draft.summary || "한 줄 소개를 입력하면 공개 화면과 같은 위치에 표시됩니다.",
    markdown: draft.markdown || "",
    tags: normalizeTags([...draft.tags, tagInput]),
  }), [draft, tagInput]);


  useEffect(() => {
    loadSaved();
    const recoveryTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(WORKING_DRAFTS_KEY);
        const parsed = stored ? JSON.parse(stored) as { drafts?: Draft[]; activeKey?: string } : null;
        const recovered = Array.isArray(parsed?.drafts) ? parsed.drafts.map(normalizeDraft) : [];
        if (recovered.length) {
          const active = recovered.find((item) => item.clientKey === parsed?.activeKey) || recovered[0];
          setWorkingDrafts(recovered);
          activateDraft(active, "dirty");
          setNotice(recovered.length > 1 ? `작성 중이던 초안 ${recovered.length}개를 복구했습니다.` : "작성 중이던 초안을 복구했습니다.");
        } else {
          const legacy = window.localStorage.getItem(LOCAL_DRAFT_KEY);
          if (legacy) {
            const migrated = normalizeDraft({ ...JSON.parse(legacy), clientKey: createLocalClientKey() });
            setWorkingDrafts([migrated]);
            activateDraft(migrated, "dirty");
            setNotice("이전에 작성하던 초안을 안전하게 옮겨 복구했습니다.");
            window.localStorage.removeItem(LOCAL_DRAFT_KEY);
          }
        }
      } catch { /* 손상된 로컬 초안은 무시 */ }
      setWorkspaceHydrated(true);
    }, 0);
    return () => window.clearTimeout(recoveryTimer);
  }, []);

  useEffect(() => {
    if (!workspaceHydrated) return;
    try { window.localStorage.setItem(WORKING_DRAFTS_KEY, JSON.stringify({ drafts: workingDrafts, activeKey })); } catch { /* 서버 저장은 계속 가능 */ }
  }, [activeKey, workingDrafts, workspaceHydrated]);

  useEffect(() => {
    const viewTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(WORKSPACE_VIEW_KEY);
        if (stored) {
          const view = JSON.parse(stored) as { left?: boolean; right?: boolean };
          const left = view.left !== false;
          const right = view.right !== false;
          setLeftPanelOpen(left);
          setRightPanelOpen(right);
          if (left || right) previousWorkspaceView.current = { left, right };
        }
      } catch { /* 기본 패널 구성을 사용 */ }
      setWorkspaceViewLoaded(true);
    }, 0);
    return () => window.clearTimeout(viewTimer);
  }, []);

  useEffect(() => {
    if (!workspaceViewLoaded) return;
    try { window.localStorage.setItem(WORKSPACE_VIEW_KEY, JSON.stringify({ left: leftPanelOpen, right: rightPanelOpen })); } catch { /* 다음 방문에 기본 구성을 사용 */ }
  }, [leftPanelOpen, rightPanelOpen, workspaceViewLoaded]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save("save"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function loadSaved() {
    try {
      const response = await fetch("/api/admin/resources", { cache: "no-store" });
      const data = response.ok ? await response.json() as { resources?: Draft[] } : null;
      if (Array.isArray(data?.resources)) setSaved(data.resources.map((item) => normalizeDraft({ ...item, clientKey: serverClientKey(item.id) })));
    } catch { setNotice("서버의 기획서 목록을 불러오지 못했지만 현재 글은 계속 작성할 수 있습니다."); }
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    const next = { ...draft, [key]: value, updatedAt: new Date().toISOString() };
    setDraft(next);
    setWorkingDrafts((current) => upsertWorkingDocument(current, next));
    setSavePhase("dirty");
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  function rememberSelection() {
    const textarea = textareaRef.current;
    if (textarea) setSelection({ start: textarea.selectionStart, end: textarea.selectionEnd });
  }

  // ── Cursor-based preview sync ───────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const textarea = textareaRef.current;
      const preview = previewScrollRef.current;
      if (!textarea || !preview) return;

      const source = draft.markdown || "";
      if (!source) return;

      // 현재 커서 위치 기준으로 줄 번호를 계산
      const currentStart = textarea.selectionStart;
      const textBeforeCursor = source.substring(0, currentStart);
      const cursorLine = (textBeforeCursor.match(/\n/g) || []).length + 1;

      const blocks = Array.from(preview.querySelectorAll<HTMLElement>("[data-source-line]"));
      if (blocks.length === 0) return;

      let best = blocks[0];
      for (const block of blocks) {
        if (Number(block.dataset.sourceLine) <= cursorLine) {
          best = block;
        } else {
          break;
        }
      }

      const previewRect = preview.getBoundingClientRect();
      const blockRect = best.getBoundingClientRect();

      // 화면 중앙에 오도록 스크롤 위치 계산
      const targetScrollTop = preview.scrollTop + (blockRect.top - previewRect.top) - (previewRect.height / 2) + (blockRect.height / 2);
      
      // 이미 화면 중앙 근처에 있다면 스크롤하지 않음 (타이핑 시 흔들림 방지)
      const offsetFromCenter = Math.abs((blockRect.top + blockRect.height / 2) - (previewRect.top + previewRect.height / 2));
      if (offsetFromCenter > 50) {
        preview.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [draft.markdown, selection]);

  // ── Scroll-based preview sync (Center-to-Center) ───────────────────────
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const editor = editorPanelRef.current;
    const preview = previewScrollRef.current;
    if (!textarea || !preview || !editor) return;

    const source = draft.markdown || "";
    if ((source.match(/\n/g)?.length ?? 0) < 1) return;

    const computed = window.getComputedStyle(textarea);
    const lineH = parseFloat(computed.lineHeight) || 24;
    const padTop = parseFloat(computed.paddingTop) || 30;

    let centerScrolledPast = 0;

    if (textarea.scrollTop > 0) {
      const visibleCenter = textarea.scrollTop + (textarea.clientHeight / 2);
      centerScrolledPast = Math.max(0, visibleCenter - padTop);
    } else {
      const editorRect = editor.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();
      const toolbarEl = editor.querySelector<HTMLElement>(".markdown-toolbar");
      const toolbarH = toolbarEl ? toolbarEl.getBoundingClientRect().height : 0;
      
      const visibleTop = editorRect.top + toolbarH;
      const visibleBottom = editorRect.bottom;
      const visibleCenter = (visibleTop + visibleBottom) / 2;
      
      const textStartY = textareaRect.top + padTop;
      centerScrolledPast = Math.max(0, visibleCenter - textStartY);
    }

    const centerLine = Math.floor(centerScrolledPast / lineH) + 1;

    const blocks = Array.from(preview.querySelectorAll<HTMLElement>("[data-source-line]"));
    if (blocks.length === 0) return;

    let best = blocks[0];
    for (const block of blocks) {
      if (Number(block.dataset.sourceLine) <= centerLine) {
        best = block;
      } else {
        break;
      }
    }

    const previewRect = preview.getBoundingClientRect();
    const blockRect = best.getBoundingClientRect();

    const targetScrollTop = preview.scrollTop + (blockRect.top - previewRect.top) - (previewRect.height / 2) + (blockRect.height / 2);
    
    preview.scrollTo({ top: Math.max(0, targetScrollTop) });
  }, [draft.markdown]);


  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const next = val.substring(0, start) + "  " + val.substring(end);
      update("markdown", next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
        rememberSelection();
      });
    }
  }

  // Strip any existing {{color:*|...}} or {{bg:*|...}} wrapper from text
  function stripColorWrap(text: string): string {
    return text.replace(/\{\{(?:color|bg):[^|]+\|(.+?)\}\}/g, "$1");
  }

  function wrapSelection(before: string, after: string, fallback = "텍스트") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = selection.start;
    const end = selection.end;
    const source = draft.markdown || "";
    const selected = source.slice(start, end) || fallback;

    // For color/bg effects: strip any existing color wrap first, then re-apply new one
    const isColorEffect = before.startsWith("{{color:") || before.startsWith("{{bg:");
    if (isColorEffect) {
      const stripped = stripColorWrap(selected);
      // Check if the selection already had the exact same wrapper (toggle off)
      const alreadyExact = hasOuterWrap(source, start, end, before, after) ||
        (selected.startsWith(before) && selected.endsWith(after));
      if (alreadyExact) {
        // Remove the wrapper entirely
        const clean = hasOuterWrap(source, start, end, before, after)
          ? source.slice(0, start - before.length) + stripped + source.slice(end + after.length)
          : source.slice(0, start) + stripped + source.slice(end);
        const offset = alreadyExact && hasOuterWrap(source, start, end, before, after) ? -before.length : 0;
        update("markdown", clean);
        setPalette(null);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start + offset, start + offset + stripped.length);
          setSelection({ start: start + offset, end: start + offset + stripped.length });
        });
        return;
      }
      // Strip existing color wrapper then apply new one
      const next = source.slice(0, start) + `${before}${stripped}${after}` + source.slice(end);
      update("markdown", next);
      setPalette(null);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + stripped.length);
        setSelection({ start: start + before.length, end: start + before.length + stripped.length });
      });
      return;
    }

    const hasOuter = hasOuterWrap(source, start, end, before, after);
    if (hasOuter) {
      const next = source.slice(0, start - before.length) + selected + source.slice(end + after.length);
      update("markdown", next);
      setPalette(null);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start - before.length, end - before.length);
        setSelection({ start: start - before.length, end: end - before.length });
      });
      return;
    }

    const hasInner = selected.startsWith(before) && selected.endsWith(after);
    if (hasInner) {
      const unwrapped = selected.slice(before.length, selected.length - after.length);
      const next = source.slice(0, start) + unwrapped + source.slice(end);
      update("markdown", next);
      setPalette(null);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrapped.length);
        setSelection({ start: start, end: start + unwrapped.length });
      });
      return;
    }

    const next = `${source.slice(0, start)}${before}${selected}${after}${source.slice(end)}`;
    update("markdown", next);
    setPalette(null);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
      setSelection({ start: start + before.length, end: end + before.length });
    });
  }

  function hasOuterWrap(source: string, start: number, end: number, before: string, after: string): boolean {
    return start >= before.length &&
      source.slice(start - before.length, start) === before &&
      source.slice(end, end + after.length) === after;
  }

  function applyBlock(kind: "heading" | "list" | "quote" | "toggle") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const source = draft.markdown || "";
    const start = source.lastIndexOf("\n", Math.max(0, selection.start - 1)) + 1;
    const lineEnd = source.indexOf("\n", selection.end);
    const end = lineEnd === -1 ? source.length : lineEnd;
    const selected = source.slice(start, end) || (kind === "toggle" ? "펼쳐볼 제목\n안쪽 내용을 입력하세요." : "내용");
    const prefix = kind === "heading" ? "## " : kind === "list" ? "- " : kind === "quote" ? "| " : "> ";
    const cleanLines = selected.split("\n").map((line) => line.replace(/^(?:## |- |\| |> | {2})/, ""));

    const lines = selected.split("\n");
    const isHeading = kind === "heading" && lines.every((l) => l.startsWith("## "));
    const isList = kind === "list" && lines.every((l) => l.startsWith("- "));
    const isQuote = kind === "quote" && lines.every((l) => l.startsWith("| "));
    const isToggle = kind === "toggle" && lines[0].startsWith("> ") && lines.slice(1).every((l) => l.startsWith("  "));
    const isApplied = isHeading || isList || isQuote || isToggle;

    if (isApplied) {
      const transformed = cleanLines.join("\n");
      update("markdown", `${source.slice(0, start)}${transformed}${source.slice(end)}`);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
        rememberSelection();
      });
      return;
    }

    const transformed = kind === "toggle"
      ? [`> ${cleanLines[0] || "펼쳐볼 제목"}`, ...((cleanLines.slice(1).length ? cleanLines.slice(1) : ["안쪽 내용을 입력하세요."]).map((line) => `  ${line}`))].join("\n")
      : cleanLines.map((line) => `${prefix}${line}`).join("\n");
    update("markdown", `${source.slice(0, start)}${transformed}${source.slice(end)}`);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, start + transformed.length); rememberSelection(); });
  }

  function insertYoutube() {
    const url = youtubeUrl.trim();
    if (!youtubeId(url)) { setYoutubeError("유튜브 영상 주소를 확인해 주세요."); return; }
    const caption = youtubeCaption.trim().replace(/[\[\]]/g, "") || "영상 자료";
    const syntax = `@youtube[${caption}](${url})`;
    const source = draft.markdown || "";
    const position = textareaRef.current?.selectionStart ?? selection.start ?? source.length;
    const line = source.slice(0, position).split("\n").length - 1;
    const next = insertMarkdownAtLine(source, line, syntax);
    update("markdown", next);
    setYoutubeOpen(false);
    setYoutubeUrl("");
    setYoutubeCaption("");
    setYoutubeError("");
    setNotice("유튜브 영상을 현재 위치에 추가했습니다.");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function insertNote(tone: typeof tones[number]["value"]) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const source = draft.markdown || "";
    const start = selection.start;
    const end = selection.end;
    const selected = source.slice(start, end).trim() || "현장에서 꼭 기억할 내용을 적어주세요.";
    const block = `:::note[${tone}] 진행자 참고\n${selected}\n:::`;
    update("markdown", `${source.slice(0, start)}${block}${source.slice(end)}`);
    setPalette(null);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + block.length, start + block.length); rememberSelection(); });
  }

  function commitTags(raw = tagInput) {
    const next = normalizeTags([...draft.tags, ...raw.split(/[,\n]/)]);
    if (next.length === draft.tags.length && raw.trim()) setNotice(next.length >= 5 ? "태그는 5개까지 추가할 수 있습니다." : "이미 추가된 태그입니다.");
    update("tags", next);
    setTagInput("");
  }

  function removeTag(tag: string) { update("tags", draft.tags.filter((item) => item !== tag)); }

  async function uploadFiles(files: FileList | File[], line?: number, cover = false) {
    const images = Array.from(files).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!images.length) { setNotice("JPG, PNG, WEBP 이미지만 올릴 수 있습니다."); return; }
    setUploading(true);
    setNotice(`이미지 ${images.length}개를 업로드하고 있습니다…`);
    let nextMarkdown = draft.markdown || "";
    let targetLine = line;
    for (const file of images) {
      const data = new FormData(); data.append("file", file); data.append("alt", file.name.replace(/\.[^.]+$/, ""));
      try {
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        const result = await response.json() as { error?: string; url?: string; alt?: string };
        if (!response.ok || !result.url) { setNotice(result.error || "이미지를 올리지 못했습니다. 다시 시도해 주세요."); continue; }
        if (cover) { update("coverUrl", result.url); break; }
        const syntax = `![${result.alt || "이미지 설명"}](${result.url} "이미지 설명") {wide}`;
        if (targetLine === undefined) {
          const position = textareaRef.current?.selectionStart ?? nextMarkdown.length;
          targetLine = nextMarkdown.slice(0, position).split("\n").length - 1;
        }
        nextMarkdown = insertMarkdownAtLine(nextMarkdown, targetLine, syntax);
        targetLine += 3;
      } catch { setNotice("네트워크 문제로 이미지를 올리지 못했습니다. 작성 내용은 그대로 보관됩니다."); }
    }
    if (!cover) update("markdown", nextMarkdown);
    setUploading(false);
    setNotice("이미지를 원하는 위치에 추가했습니다. 캡션과 설명을 확인해 주세요.");
  }

  function validatePublish() {
    const errors: Record<string, string> = {};
    if (!draft.title.trim()) errors.title = "공개할 기획서의 제목을 입력해 주세요.";
    if (!draft.summary.trim()) errors.summary = "누가 참고하면 좋은지 한 줄로 소개해 주세요.";
    if (!(draft.markdown || "").trim()) errors.markdown = "기획서 본문을 입력해 주세요.";
    setFieldErrors(errors);
    if (errors.title) titleRef.current?.focus();
    else if (errors.markdown) textareaRef.current?.focus();
    if (Object.keys(errors).length) setNotice(`공개하려면 ${Object.keys(errors).length}가지를 확인해 주세요.`);
    return Object.keys(errors).length === 0;
  }

  async function save(mode: "save" | "publish") {
    if (saveInFlight.current || uploading) return false;
    if (mode === "publish" && !validatePublish()) return false;
    const savingKey = draft.clientKey;
    const committedTags = normalizeTags([...draft.tags, tagInput]);
    const publishState = mode === "publish" ? true : draft.isPublished;
    const savingDraft = { ...draft, tags: committedTags };
    setWorkingDrafts((current) => upsertWorkingDocument(current, savingDraft));
    const payload = { ...savingDraft, slug: draft.slug || slugify(draft.title), isPublished: publishState, contentFormat: "markdown-v2" };
    saveInFlight.current = true;
    setSavePhase("saving");
    setNotice(mode === "publish" ? "공개 준비를 확인하고 있습니다…" : "저장하고 있습니다…");
    try {
      const response = await fetch("/api/admin/resources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string; resource?: Draft };
      if (!response.ok || !result.resource) {
        setSavePhase("error"); setNotice(result.error || "저장하지 못했습니다. 내용은 이 기기에 보관했습니다."); return false;
      }
      const resource = normalizeDraft({ ...result.resource, clientKey: serverClientKey(result.resource.id), tags: normalizeTags(result.resource.tags || []), isPublished: publishState });
      setWorkingDrafts((current) => removeWorkingDocument(current, savingKey, resource.clientKey));
      setSaved((current) => mergeSavedDocuments(current, resource));
      if (activeKeyRef.current === savingKey) { activateDraft(resource, "saved"); setTagInput(""); }
      const time = new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(new Date());
      setSavedAt(time); setNotice(mode === "publish" ? "기획서가 공개되었습니다." : publishState ? "저장한 내용이 공개 글에 반영되었습니다." : "초안이 저장되었습니다.");
      if (mode === "publish") {
        window.location.href = `/documents/${resource.slug}`;
      }
      return true;
    } catch {
      if (activeKeyRef.current === savingKey) setSavePhase("error");
      setNotice("저장하지 못했습니다. 내용은 이 기기에 안전하게 보관했습니다."); return false;
    } finally { saveInFlight.current = false; }
  }

  function requestNewDraft() { startNewDraft(); }
  function startNewDraft() {
    stashCurrentDraft();
    const untouched = (!draft.id && isUntouchedDraft(draft)) ? draft : workingDrafts.find((item) => !item.id && isUntouchedDraft(item));
    const next = untouched || createEmptyDraft(createLocalClientKey());
    if (!untouched) setWorkingDrafts((current) => upsertWorkingDocument(current, next));
    activateDraft(next, untouched?.clientKey === draft.clientKey ? savePhase : "ready");
    setTagInput(""); setFieldErrors({}); setMobileTab("write"); setMobileLibraryOpen(false);
    setNotice(untouched ? "비어 있는 새 초안을 열었습니다." : "새 기획서를 만들었습니다. 작성 내용은 이 기기에 자동 보관됩니다.");
    requestAnimationFrame(() => titleRef.current?.focus());
  }
  function openSaved(item: Draft) {
    stashCurrentDraft();
    const working = workingDrafts.find((candidate) => candidate.clientKey === item.clientKey);
    activateDraft(working || item, working ? "dirty" : "saved");
    setTagInput(""); setFieldErrors({}); setMobileLibraryOpen(false);
    setNotice(working ? "이 기기에 보관된 수정 내용을 열었습니다." : "저장된 기획서를 열었습니다.");
  }
  function openWorking(item: Draft) {
    stashCurrentDraft();
    activateDraft(item, isUntouchedDraft(item) ? "ready" : "dirty");
    setTagInput(""); setFieldErrors({}); setMobileLibraryOpen(false);
    setNotice(item.id ? "저장 전 수정 내용을 다시 열었습니다." : "작성 중인 초안을 다시 열었습니다.");
  }
  function activateDraft(next: Draft, phase: SavePhase) {
    activeKeyRef.current = next.clientKey;
    setActiveKey(next.clientKey);
    setDraft(next);
    setSavePhase(phase);
  }
  function stashCurrentDraft() {
    const current = { ...draft, tags: normalizeTags([...draft.tags, tagInput]) };
    if (!draft.id || savePhase === "dirty" || savePhase === "error") setWorkingDrafts((items) => upsertWorkingDocument(items, current));
    return current;
  }

  /**
   * Finds the bounds of a {{color:...|...}} or {{bg:...|...}} wrapper that
   * either contains the current selection, or that the selection sits inside.
   */
  function findColorWrap(source: string, start: number, end: number, type: "color" | "bg"): { wrapStart: number; wrapEnd: number; innerText: string } | null {
    const prefix = type === "color" ? "{{color:" : "{{bg:";

    // Case A: selection is entirely INSIDE a wrapper (most common after applying)
    // e.g. source = "...{{color:red|foo}}..." and selection = {start: X+14, end: X+17} pointing at "foo"
    const textBefore = source.slice(0, start);
    const lastOpenIdx = textBefore.lastIndexOf(prefix);
    if (lastOpenIdx !== -1) {
      const pipeIdx = source.indexOf("|", lastOpenIdx);
      if (pipeIdx !== -1 && pipeIdx < start) {
        // There's an opening marker before our selection; check for closing }}
        const closeIdx = source.indexOf("}}", end);
        // Make sure there is no new {{ between our selection end and the found }}
        if (closeIdx !== -1 && !source.slice(end, closeIdx).includes("{{")) {
          const innerText = source.slice(pipeIdx + 1, closeIdx);
          return { wrapStart: lastOpenIdx, wrapEnd: closeIdx + 2, innerText };
        }
      }
    }

    // Case B: selection itself fully wraps the pattern e.g. user selected the whole "{{color:red|foo}}"
    const sel = source.slice(start, end);
    const fullRe = new RegExp(`^\\{\\{${type}:[^|]+\\|(.+?)\\}\\}$`);
    const fullMatch = sel.match(fullRe);
    if (fullMatch) return { wrapStart: start, wrapEnd: end, innerText: fullMatch[1] };

    // Case C: selection contains a wrapper somewhere inside it
    if (new RegExp(`\\{\\{${type}:[^|]+\\|`).test(sel)) {
      const innerText = sel.replace(/\{\{(?:color|bg):[^|]+\|(.+?)\}\}/g, "$1");
      return { wrapStart: start, wrapEnd: end, innerText };
    }

    return null;
  }

  function handlePaletteColor() {
    const source = draft.markdown || "";
    const { start, end } = selection;
    if (start !== end) {
      const wrap = findColorWrap(source, start, end, "color");
      if (wrap) {
        const next = source.slice(0, wrap.wrapStart) + wrap.innerText + source.slice(wrap.wrapEnd);
        update("markdown", next);
        setPalette(null);
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(wrap.wrapStart, wrap.wrapStart + wrap.innerText.length);
          setSelection({ start: wrap.wrapStart, end: wrap.wrapStart + wrap.innerText.length });
        });
        return;
      }
    }
    setPalette(palette === "text" ? null : "text");
  }

  function handlePaletteBg() {
    const source = draft.markdown || "";
    const { start, end } = selection;
    if (start !== end) {
      const wrap = findColorWrap(source, start, end, "bg");
      if (wrap) {
        const next = source.slice(0, wrap.wrapStart) + wrap.innerText + source.slice(wrap.wrapEnd);
        update("markdown", next);
        setPalette(null);
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(wrap.wrapStart, wrap.wrapStart + wrap.innerText.length);
          setSelection({ start: wrap.wrapStart, end: wrap.wrapStart + wrap.innerText.length });
        });
        return;
      }
    }
    setPalette(palette === "background" ? null : "background");
  }

  function startToolbarDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    toolbarDrag.current = { active: true, startX: event.clientX, startScrollLeft: event.currentTarget.scrollLeft, didDrag: false };
    event.currentTarget.classList.add("is-dragging");
  }
  function moveToolbarDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!toolbarDrag.current.active) return;
    const diff = event.clientX - toolbarDrag.current.startX;
    if (Math.abs(diff) > 4) {
      toolbarDrag.current.didDrag = true;
      event.currentTarget.scrollLeft = toolbarDrag.current.startScrollLeft - diff;
    }
  }
  function endToolbarDrag(event: ReactPointerEvent<HTMLDivElement>) {
    toolbarDrag.current.active = false;
    event.currentTarget.classList.remove("is-dragging");
  }
  function handleToolbarClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (toolbarDrag.current.didDrag) {
      toolbarDrag.current.didDrag = false;
      event.stopPropagation();
      event.preventDefault();
    }
  }

  const focusMode = !leftPanelOpen && !rightPanelOpen;
  function toggleFocusMode() {
    if (focusMode) {
      setLeftPanelOpen(previousWorkspaceView.current.left);
      setRightPanelOpen(previousWorkspaceView.current.right);
      return;
    }
    previousWorkspaceView.current = { left: leftPanelOpen, right: rightPanelOpen };
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  }

  const statusText = savePhase === "dirty" ? "저장되지 않은 변경사항" : savePhase === "saving" ? "저장 중…" : savePhase === "saved" ? `${savedAt ? `${savedAt}에 ` : ""}저장됨` : savePhase === "error" ? "저장 실패 · 기기에 보관됨" : "작성 준비됨";
  const sidebarDocuments = buildSidebarDocuments(workingDrafts, saved);
  const newWorkingDrafts = sidebarDocuments.working;
  const savedDocuments = sidebarDocuments.saved;

  return (
    <main id="main-content" className="admin-studio">
      <header className="studio-topbar">
        <Link href="/" className="studio-brand"><BrandMark size={27} variant="reverse"/><span><b>구세군 마포영문</b>기획서 관리</span></Link>
        <div className={`studio-status state-${savePhase}`}><span/>{statusText}{savePhase === "error" && <button onClick={() => void save("save")}>다시 시도</button>}</div>
        <div className="studio-user"><b>{userName}</b><span>{userEmail}</span></div>
      </header>

      <div className="studio-commandbar">
        <button type="button" className="mobile-library-button" aria-expanded={mobileLibraryOpen} aria-controls="saved-panel" onClick={() => setMobileLibraryOpen(true)}><PanelLeftIcon size={18}/><span>기획서</span></button>
        <div className="workspace-view-controls" role="group" aria-label="편집 화면 패널 보기">
          <button type="button" className="has-tip focus-mode-control" data-help={focusMode ? "이전에 보던 패널 구성을 다시 엽니다." : "목록과 미리보기를 한 번에 접고 편집창만 봅니다."} aria-label={focusMode ? "집중 모드 종료" : "집중 모드 시작"} aria-pressed={focusMode} onClick={toggleFocusMode}><FocusIcon size={17}/><span>{focusMode ? "복원" : "집중"}</span></button>
        </div>
        <div className="mobile-editor-tabs"><button className={mobileTab === "write" ? "active" : ""} onClick={() => setMobileTab("write")}>작성</button><button className={mobileTab === "preview" ? "active" : ""} onClick={() => setMobileTab("preview")}>미리보기</button></div>
        <div className="studio-actions"><button type="button" onClick={() => void save("save")} disabled={uploading || savePhase === "saving"}>{draft.isPublished ? "저장 및 반영" : "저장"}</button><button className="publish-button" type="button" onClick={() => void save("publish")} disabled={uploading || savePhase === "saving"}>{draft.isPublished ? "공개됨" : "공개하기"} <ArrowIcon size={17}/></button></div>
      </div>

      <div className="mobile-save-state"><span className={`state-${savePhase}`}/><b>{statusText}</b><small>{notice}</small></div>

      <div className={`studio-workspace ${leftPanelOpen ? "" : "left-collapsed"} ${rightPanelOpen ? "" : "right-collapsed"}`}>
        {!leftPanelOpen && <button type="button" className="panel-reopen panel-reopen-left" aria-label="기획서 목록 열기" aria-controls="saved-panel" aria-expanded="false" onClick={() => setLeftPanelOpen(true)}><PanelLeftIcon size={19}/></button>}
        {!rightPanelOpen && <button type="button" className="panel-reopen panel-reopen-right" aria-label="미리보기 열기" aria-controls="preview-panel" aria-expanded="false" onClick={() => setRightPanelOpen(true)}><PanelRightIcon size={19}/></button>}
        {mobileLibraryOpen && <button type="button" className="mobile-library-scrim" aria-label="기획서 목록 닫기" onClick={() => setMobileLibraryOpen(false)}/>}
        <aside id="saved-panel" className={`saved-panel ${mobileLibraryOpen ? "mobile-open" : ""}`}>
          <div className="panel-header"><span>기획서 <b>{newWorkingDrafts.length + savedDocuments.length}</b></span><button type="button" aria-label="기획서 목록 접기" aria-controls="saved-panel" aria-expanded="true" onClick={() => { setLeftPanelOpen(false); setMobileLibraryOpen(false); }}><PanelLeftIcon size={19}/></button></div>
          <button type="button" className="panel-new-resource" onClick={requestNewDraft}><PlusIcon size={17}/>새 기획서</button>
          {newWorkingDrafts.length > 0 && <div className="panel-section-heading"><span>작성 중</span><b>{newWorkingDrafts.length}</b></div>}
          {newWorkingDrafts.map((item) => <button type="button" className={`document-row working ${draft.clientKey === item.clientKey ? "selected" : ""}`} onClick={() => openWorking(item)} key={item.clientKey}><small><i/>저장 안 됨</small><strong>{item.title || "제목 없는 기획서"}</strong><span>{item.updatedAt?.slice(0, 10)}</span></button>)}
          {savedDocuments.length > 0 && <div className="panel-section-heading"><span>전체 기획서</span><b>{savedDocuments.length}</b></div>}
          {savedDocuments.map(({ document: item, savedDocument, hasUnsavedChanges }) => <button type="button" className={`document-row ${hasUnsavedChanges ? "working" : ""} ${draft.clientKey === item.clientKey ? "selected" : ""}`} onClick={() => openSaved(item)} key={item.clientKey}><small>{hasUnsavedChanges ? <><i/>수정 중</> : savedDocument.isPublished ? "공개" : "초안"}</small><strong>{item.title || "제목 없는 기획서"}</strong><span>{savedDocument.updatedAt?.slice(0, 10)}</span></button>)}
        </aside>

        <section ref={editorPanelRef} className={`editor-panel ${mobileTab === "write" ? "mobile-active" : ""}`} onScroll={handleScroll}>
          <div className="editor-metadata">
            <label className={fieldErrors.title ? "has-error" : ""}><span>제목</span><input ref={titleRef} value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="기획서 제목"/>{fieldErrors.title && <small>{fieldErrors.title}</small>}</label>
            <label className={fieldErrors.summary ? "has-error" : ""}><span>한 줄 소개</span><textarea value={draft.summary} onChange={(event) => update("summary", event.target.value)} placeholder="누가, 무엇을 위해 참고하면 좋은 기획인지 한 문장으로 설명해 주세요." rows={2}/>{fieldErrors.summary && <small>{fieldErrors.summary}</small>}</label>
            <div className="tag-cover-row">
              <div className="tag-editor"><span>태그 · 최대 5개</span><div className="tag-input-shell">{draft.tags.map((tag) => <button type="button" className="tag-chip" onClick={() => removeTag(tag)} key={tag}><span>#{tag}</span><i aria-hidden="true">×</i><span className="sr-only">{tag} 태그 삭제</span></button>)}{draft.tags.length < 5 && <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onBlur={() => tagInput.trim() && commitTags()} onPaste={(event) => { const pasted = event.clipboardData.getData("text"); if (/[,\n]/.test(pasted)) { event.preventDefault(); commitTags(pasted); } }} onKeyDown={(event) => { if (event.nativeEvent.isComposing) return; if (event.key === "Enter" || event.key === ",") { event.preventDefault(); commitTags(); } else if (event.key === "Backspace" && !tagInput && draft.tags.length) removeTag(draft.tags[draft.tags.length - 1]); }} placeholder={draft.tags.length ? "태그 추가" : "입력 후 Enter"} aria-label="태그 입력"/>}</div><small>{draft.tags.length}/5 · Enter 또는 쉼표로 추가</small></div>
              <div className="cover-upload"><span>대표 이미지</span><label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files && uploadFiles(event.target.files, undefined, true)}/><b>{draft.coverUrl ? "이미지 바꾸기" : "이미지 선택"}</b></label>{draft.coverUrl ? <button type="button" onClick={() => update("coverUrl", "")}>이미지 제거</button> : <small>목록에는 기본 이미지가 표시되며 상세 글에서는 생략됩니다.</small>}</div>
            </div>
          </div>



          <div className="markdown-toolbar" role="toolbar" aria-label="기획서 서식">
            <div className="toolbar-guide"><b>{selection.end > selection.start ? "선택한 글자에 효과를 적용합니다." : "글자를 드래그한 뒤 효과를 선택하세요."}</b><small>각 버튼에 마우스를 올리면 사용법이 표시됩니다.</small></div>
            <div ref={toolbarCallbackRef} className="toolbar-groups-viewport" aria-label="서식 도구 가로 스크롤" onPointerDown={startToolbarDrag} onPointerMove={moveToolbarDrag} onPointerUp={endToolbarDrag} onPointerCancel={endToolbarDrag} onClickCapture={handleToolbarClickCapture}><div className="toolbar-groups">
              <div className="toolbar-group toolbar-text-group"><span>글자 효과</span>
                <button type="button" className="has-tip format-strong" data-help="선택한 글자를 굵게 강조합니다. 문법: **글자**" title="선택한 글자를 굵게 강조합니다." onMouseDown={(event) => event.preventDefault()} onClick={() => wrapSelection("**", "**")}>B</button>
                <button type="button" className="has-tip format-em" data-help="선택한 글자를 기울여 표시합니다. 문법: _글자_" title="선택한 글자를 기울여 표시합니다." onMouseDown={(event) => event.preventDefault()} onClick={() => wrapSelection("_", "_")}>I</button>
                <button type="button" className="has-tip format-strike" data-help="선택한 글자에 취소선을 긋습니다. 문법: ~~글자~~" title="선택한 글자에 취소선을 긋습니다." onMouseDown={(event) => event.preventDefault()} onClick={() => wrapSelection("~~", "~~")}>S</button>
                <button type="button" className="has-tip" data-help="선택한 글자를 붉은 박스로 강조합니다. 문법: `글자`" title="선택한 글자를 붉은 박스로 강조합니다." onMouseDown={(event) => event.preventDefault()} onClick={() => wrapSelection("`", "`")}>강조</button>
                <button type="button" className="has-tip" data-help="선택한 글자의 색을 지정합니다." title="선택한 글자의 색을 지정합니다." onMouseDown={(event) => event.preventDefault()} onClick={handlePaletteColor}>글자색</button>
                <button type="button" className="has-tip" data-help="선택한 글자 뒤에 배경색을 넣습니다." title="선택한 글자 뒤에 배경색을 넣습니다." onMouseDown={(event) => event.preventDefault()} onClick={handlePaletteBg}>배경색</button>
              </div>
              <div className="toolbar-group toolbar-block-group"><span>문단</span>
                <button type="button" className="has-tip" data-help="현재 문단을 큰 제목으로 바꿉니다. 문법: ## 제목" title="현재 문단을 큰 제목으로 바꿉니다." onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlock("heading")}>제목</button>
                <button type="button" className="has-tip" data-help="선택한 여러 줄을 목록으로 바꿉니다. 문법: - 항목" title="선택한 여러 줄을 목록으로 바꿉니다." onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlock("list")}>목록</button>
                <button type="button" className="has-tip" data-help="현재 문단을 인용문으로 바꿉니다. 각 줄 앞에 |가 붙습니다." title="현재 문단을 인용문으로 바꿉니다." onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlock("quote")}>인용</button>
                <button type="button" className="has-tip toggle-tool" data-help={"접고 펴는 블록을 자동으로 만듭니다.\n> 펼쳐볼 제목\n  안쪽 내용 (앞에 공백 2칸)"} title="첫 줄에 > 제목을 쓰고, 다음 줄부터 두 칸 들여쓰기해 내용을 작성합니다." onMouseDown={(event) => event.preventDefault()} onClick={() => applyBlock("toggle")}><ToggleIcon size={16}/>접기·펼치기</button>
              </div>
              <div className="toolbar-group toolbar-insert-group"><span>삽입</span>
                <button type="button" className="has-tip" data-help="색상을 선택해 진행자 전용 참고 상자를 넣습니다." title="진행자 참고 상자를 추가합니다." onMouseDown={(event) => event.preventDefault()} onClick={() => setPalette(palette === "note" ? null : "note")}>진행자 참고</button>
                <label className="toolbar-image has-tip" data-help="이미지를 현재 커서 위치에 넣습니다. 여러 장을 선택할 수 있습니다." title="이미지를 현재 커서 위치에 넣습니다."><input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files && uploadFiles(event.target.files)}/><ImageIcon size={16}/>이미지</label>
                <button type="button" className="has-tip" data-help="유튜브 링크를 넣으면 공개 글에서 바로 재생할 수 있습니다." title="유튜브 영상을 추가합니다." aria-expanded={youtubeOpen} aria-controls="youtube-insert-panel" onClick={() => { setYoutubeOpen((value) => !value); setYoutubeError(""); }}><VideoIcon size={16}/>유튜브</button>
              </div>
            </div></div>
            {youtubeOpen && <form id="youtube-insert-panel" className="youtube-popover" onSubmit={(event) => { event.preventDefault(); insertYoutube(); }}><b>유튜브 영상 추가</b><p>영상 주소를 붙여 넣으면 현재 커서 위치에 들어갑니다.</p><label><span>유튜브 링크</span><input type="url" value={youtubeUrl} onChange={(event) => { setYoutubeUrl(event.target.value); setYoutubeError(""); }} placeholder="https://youtu.be/…" autoFocus/></label><label><span>영상 설명 · 선택</span><input value={youtubeCaption} onChange={(event) => setYoutubeCaption(event.target.value)} placeholder="예: 행사 진행 영상"/></label>{youtubeError && <small>{youtubeError}</small>}<div><button type="button" onClick={() => { setYoutubeOpen(false); setYoutubeError(""); }}>취소</button><button type="submit" className="primary">영상 넣기</button></div></form>}
            {palette && <div className={`format-palette palette-${palette}`}><b>{palette === "text" ? "글자 색" : palette === "background" ? "배경 색" : "진행자 참고 색상"}</b>{tones.map((tone) => <button type="button" key={tone.value} onMouseDown={(event) => event.preventDefault()} onClick={() => palette === "note" ? insertNote(tone.value) : wrapSelection(`{{${palette === "text" ? "color" : "bg"}:${tone.value}|`, "}}") }><i className={`swatch tone-${tone.value}`}/><span>{tone.label}</span></button>)}</div>}
          </div>

          <div className="markdown-editor-wrap" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.files.length) uploadFiles(event.dataTransfer.files); }}>
            <textarea ref={textareaRef} className={`markdown-editor ${fieldErrors.markdown ? "has-error" : ""}`} value={draft.markdown} onChange={(event) => update("markdown", event.target.value)} onScroll={handleScroll} onSelect={rememberSelection} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onKeyDown={handleTextareaKeyDown} spellCheck placeholder="Markdown으로 기획서를 작성하세요." aria-label="기획서 본문 Markdown"/>
            {fieldErrors.markdown && <small className="editor-error">{fieldErrors.markdown}</small>}
            <div className="drop-guidance"><span>이미지를 문장 사이에 끌어 놓으세요.</span><small>JPG · PNG · WEBP, 최대 8MB</small></div>
          </div>
        </section>

        <section id="preview-panel" className={`preview-panel ${mobileTab === "preview" ? "mobile-active" : ""}`} aria-label="실제 공개 화면 미리보기">
          <div className="preview-label"><span>실제 공개 화면<small>내용과 스타일이 그대로 공개됩니다.</small></span><button type="button" aria-label="미리보기 접기" aria-controls="preview-panel" aria-expanded="true" onClick={() => setRightPanelOpen(false)}><PanelRightIcon size={19}/></button></div>
          <div ref={previewScrollRef} className="preview-scroll"><DocumentReader document={previewDoc} preview onDropAt={(files, line) => uploadFiles(files, line)} onMoveBlock={(fromStart, fromEnd, targetLine) => update("markdown", moveMarkdownBlock(draft.markdown || "", fromStart, fromEnd, targetLine))}/></div>
        </section>
      </div>

    </main>
  );
}

function normalizeTags(values: unknown[]) {
  const unique = new Map<string, string>();
  values.flatMap((value) => String(value ?? "").split(/[,\n]/)).map((tag) => tag.replace(/^#+/, "").trim().replace(/\s+/g, " ").slice(0, 20)).filter(Boolean).forEach((tag) => {
    const key = tag.toLocaleLowerCase("ko-KR");
    if (!unique.has(key) && unique.size < 5) unique.set(key, tag);
  });
  return [...unique.values()];
}

function normalizeDraft(value: Partial<Draft> & Pick<Draft, "id">): Draft {
  const base = createEmptyDraft(value.clientKey || (value.id ? serverClientKey(value.id) : createLocalClientKey()));
  return { ...base, ...value, tags: normalizeTags(value.tags || []), markdown: value.markdown || "" } as Draft;
}

function isUntouchedDraft(value: Draft) {
  return !value.id && !value.title.trim() && !value.summary.trim() && !value.audience.trim() && !value.duration.trim() && !value.participants?.trim() && !value.coverUrl && value.tags.length === 0 && (value.markdown || "").trim() === starterMarkdown.trim();
}
