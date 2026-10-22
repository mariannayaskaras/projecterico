import { NextResponse } from "next/server";
import { adminRequired, getAdminSupabase, getPublicSupabase, isAdminRequest, parsePrayerInput } from "../../../../lib/admin-server";

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });

  try {
    const { data, error } = await getPublicSupabase()
      .from("prayers")
      .select("id, title, category, verse, reference, content, day_number, reading_minutes, sort_order, published")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });
    return NextResponse.json({ prayer: data });
  } catch (error) {
    console.error("Falha ao carregar oração:", error);
    return NextResponse.json({ error: "Não foi possível carregar esta oração." }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isAdminRequest(request)) return adminRequired();
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const prayer = parsePrayerInput(body);
  if (!prayer) return NextResponse.json({ error: "Confira os campos e os limites informados." }, { status: 400 });

  try {
    const { data, error } = await getAdminSupabase().from("prayers").update(prayer).eq("id", id).select().maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });
    return NextResponse.json({ prayer: data });
  } catch (error) {
    console.error("Falha ao atualizar oração:", error);
    return NextResponse.json({ error: "Não foi possível atualizar. Verifique se o número do dia já está em uso." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isAdminRequest(request)) return adminRequired();
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });

  try {
    const { data, error } = await getAdminSupabase().from("prayers").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Oração não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Falha ao excluir oração:", error);
    return NextResponse.json({ error: "Não foi possível excluir esta oração." }, { status: 503 });
  }
}
