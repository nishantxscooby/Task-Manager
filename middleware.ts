import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/tasks"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthPage = authPaths.some((p) => pathname === p);

  if (isProtected && !token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks", "/tasks/:path*", "/login", "/register"],
};
