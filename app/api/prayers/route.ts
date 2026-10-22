import { NextResponse } from "next/server";
import { adminRequired, getAdminSupabase, getPublicSupabase, isAdminRequest, parsePrayerInput } from "../../../lib/admin-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getPublicSupabase()
      .from("prayers")
      .select("id, title, category, verse, reference, content, day_number, reading_minutes, sort_order, published")
      .eq("published", true)
      .order("day_number", { ascending: true, nullsFirst: false })
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ prayers: data ?? [] });
  } catch (error) {
    console.error("Falha ao listar orações publicadas:", error);
    return NextResponse.json({ error: "Não foi possível carregar as orações." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return adminRequired();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const prayer = parsePrayerInput(body);
  if (!prayer) return NextResponse.json({ error: "Confira os campos e os limites informados." }, { status: 400 });

  try {
    const { data, error } = await getAdminSupabase().from("prayers").insert(prayer).select().single();
    if (error) throw error;
    return NextResponse.json({ prayer: data }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar oração:", error);
    return NextResponse.json({ error: "Não foi possível salvar. Verifique se o número do dia já está em uso." }, { status: 503 });
  }
}
