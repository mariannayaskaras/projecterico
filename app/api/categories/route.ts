import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Categories endpoint" });
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Categories endpoint" });
}
