import { redirect } from "next/navigation";

export default async function LegacyResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/documents/${slug}`);
}
