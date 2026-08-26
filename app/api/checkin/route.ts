import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Check-in endpoint" });
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Check-in endpoint" });
}
