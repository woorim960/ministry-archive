import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { resources } from "@/db/schema";
import { requireAdminApi } from "@/lib/admin-auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  
  const { slug } = await params;
  if (!slug) {
    return Response.json({ error: "문서 식별자가 없습니다." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.delete(resources).where(eq(resources.slug, slug));
    
    // In Drizzle SQLite with LibSQL/BetterSQLite3, we might not get row count simply from result
    // But we can just assume it succeeded if it didn't throw.
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "문서를 삭제하지 못했습니다." }, { status: 500 });
  }
}
