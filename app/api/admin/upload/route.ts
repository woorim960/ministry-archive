import { getDb } from "@/db";
import { media } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";

type StorageEnv = { BUCKET?: R2Bucket };
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as StorageEnv).BUCKET;
  if (!bucket) return Response.json({ error: "이미지 저장소가 연결되지 않았습니다." }, { status: 503 });
  let uploadedKey = "";
  try {
    const data = await request.formData();
    const file = data.get("file");
    const alt = String(data.get("alt") ?? "").slice(0, 300);
    if (!(file instanceof File)) return Response.json({ error: "이미지를 선택해 주세요." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "이미지는 8MB 이하여야 합니다." }, { status: 400 });
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detected = detectImage(bytes);
    if (!detected || detected.mime !== file.type) return Response.json({ error: "파일 내용과 이미지 형식이 일치하지 않습니다." }, { status: 400 });
    const date = new Date();
    uploadedKey = `media/${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${detected.ext}`;
    await bucket.put(uploadedKey, file.stream(), { httpMetadata: { contentType: detected.mime }, customMetadata: { alt, originalName: file.name } });
    const db = await getDb();
    await db.insert(media).values({ id: crypto.randomUUID(), objectKey: uploadedKey, originalName: file.name, contentType: detected.mime, size: file.size, alt, uploaderEmail: auth.user.email });
    return Response.json({ url: `/api/media/${uploadedKey}`, alt, name: file.name });
  } catch (error) {
    console.error("Upload error:", error);
    if (uploadedKey) await bucket.delete(uploadedKey).catch(() => undefined);
    return Response.json({ error: "업로드하지 못했습니다. 파일은 저장되지 않았습니다." }, { status: 500 });
  }
}

function detectImage(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}
