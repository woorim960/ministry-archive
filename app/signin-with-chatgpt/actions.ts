"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const returnTo = formData.get("returnTo")?.toString() || "/";

  // Check process.env directly for ADMIN_PASSWORD, fallback to admin1234
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "admin@ministry.local", {
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    redirect(returnTo);
  } else {
    redirect(`/signin-with-chatgpt?error=1&return_to=${encodeURIComponent(returnTo)}`);
  }
}
