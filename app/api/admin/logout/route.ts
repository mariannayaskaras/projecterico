import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "../../../../lib/admin-server";

export async function POST() {
  return clearAdminSessionCookie(NextResponse.json({ ok: true }));
}
