import { NextResponse } from "next/server";
import { adminRequired, getAdminSupabase, isAdminRequest } from "../../../../lib/admin-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminRequired();

  try {
    const { data, error } = await getAdminSupabase()
      .from("prayers")
      .select("id, title, category, verse, reference, content, day_number, reading_minutes, sort_order, published, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ prayers: data ?? [] });
  } catch (error) {
    console.error("Falha ao listar orações para administração:", error);
    return NextResponse.json({ error: "Não foi possível carregar as orações. Verifique a configuração do Supabase." }, { status: 503 });
  }
}
