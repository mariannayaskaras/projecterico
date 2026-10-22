import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyAdminPassword } from "../../../../lib/admin-server";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: "Configure ADMIN_PASSWORD e um ADMIN_SESSION_SECRET com pelo menos 32 caracteres." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const password = body && typeof body === "object" && "password" in body
    ? (body as { password?: unknown }).password
    : null;
  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  try {
    return setAdminSessionCookie(NextResponse.json({ ok: true }));
  } catch {
    return NextResponse.json({ error: "A configuração da sessão administrativa está incompleta." }, { status: 503 });
  }
}
