import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Favorites endpoint" });
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Favorites endpoint" });
}
