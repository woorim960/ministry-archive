type StorageEnv = { BUCKET?: R2Bucket };

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as StorageEnv).BUCKET;
  if (!bucket) return new Response("Not found", { status: 404 });
  const { path } = await params;
  const object = await bucket.get(path.join("/"));
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
