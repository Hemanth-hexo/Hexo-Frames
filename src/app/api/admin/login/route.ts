import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSessionToken, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}
