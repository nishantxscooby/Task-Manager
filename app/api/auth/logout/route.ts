import { NextResponse } from "next/server";
import { deleteAuthCookie } from "@/lib/cookies";

export async function POST() {
  await deleteAuthCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
