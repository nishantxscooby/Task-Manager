import { cookies } from "next/headers";

const TOKEN_NAME = "access_token";
const MAX_AGE = 60 * 60 * 24; // 24 hours

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

export async function setAuthCookie(token: string) {
  const c = await cookies();
  c.set(TOKEN_NAME, token, getCookieOptions());
}

export async function getAuthCookie(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(TOKEN_NAME)?.value;
}

export async function deleteAuthCookie() {
  const c = await cookies();
  c.delete(TOKEN_NAME);
}
