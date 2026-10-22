"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";

type Prayer = {
  id: string;
  title: string;
  category: string;
  verse: string;
  reference: string;
  content: string;
  day_number: number | null;
  reading_minutes: number;
  sort_order: number;
  published: boolean;
};

type PrayerForm = Omit<Prayer, "id" | "day_number"> & { day_number: string };

const EMPTY_FORM: PrayerForm = {
  title: "",
  category: "",
  verse: "",
  reference: "",
  content: "",
  day_number: "",
  reading_minutes: 5,
  sort_order: 0,
  published: false,
};

async function readJson(response: Response) {
  return (await response.json().catch(() => ({}))) as { error?: string; prayers?: Prayer[] };
}

export default function AdminPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("manual");
  const [form, setForm] = useState<PrayerForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPrayers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/prayers", { cache: "no-store" });
      const body = await readJson(response);
      if (response.status === 401) {
        setAuthenticated(false);
      } else if (!response.ok) {
        setError(body.error ?? "Não foi possível carregar as orações.");
      } else {
        setPrayers(body.prayers ?? []);
        setAuthenticated(true);
        setError("");
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitialPrayers() {
      try {
        const response = await fetch("/api/admin/prayers", { cache: "no-store" });
        const body = await readJson(response);
        if (cancelled) return;
        if (response.status === 401) {
          setAuthenticated(false);
        } else if (!response.ok) {
          setError(body.error ?? "Não foi possível carregar as orações.");
        } else {
          setPrayers(body.prayers ?? []);
          setAuthenticated(true);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Não foi possível conectar ao servidor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadInitialPrayers();
    return () => { cancelled = true; };
  }, []);

  const visiblePrayers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return prayers
      .filter((prayer) => `${prayer.title} ${prayer.category} ${prayer.reference}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title, "pt-BR");
        if (sort === "day") return (a.day_number ?? 366) - (b.day_number ?? 366) || a.title.localeCompare(b.title, "pt-BR");
        return a.sort_order - b.sort_order || a.title.localeCompare(b.title, "pt-BR");
      });
  }, [prayers, query, sort]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await readJson(response);
      if (!response.ok) throw new Error(body.error ?? "Não foi possível entrar.");
      setPassword("");
      setAuthenticated(true);
      await loadPrayers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setPrayers([]);
    setNotice("");
    setError("");
    resetForm();
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM, sort_order: prayers.length * 10 });
    setEditingId(null);
  }

  function editPrayer(prayer: Prayer) {
    setEditingId(prayer.id);
    setForm({
      title: prayer.title,
      category: prayer.category,
      verse: prayer.verse,
      reference: prayer.reference,
      content: prayer.content,
      day_number: prayer.day_number === null ? "" : String(prayer.day_number),
      reading_minutes: prayer.reading_minutes,
      sort_order: prayer.sort_order,
      published: prayer.published,
    });
    setNotice("");
    document.getElementById("prayer-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function savePrayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = { ...form, day_number: form.day_number === "" ? null : Number(form.day_number) };
    try {
      const response = await fetch(editingId ? `/api/prayers/${editingId}` : "/api/prayers", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await readJson(response);
      if (!response.ok) throw new Error(body.error ?? "Não foi possível salvar a oração.");
      setNotice(editingId ? "Oração atualizada." : "Oração criada.");
      resetForm();
      await loadPrayers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a oração.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePrayer(prayer: Prayer) {
    if (!window.confirm(`Excluir “${prayer.title}”? Esta ação não pode ser desfeita.`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/prayers/${prayer.id}`, { method: "DELETE" });
      const body = await readJson(response);
      if (!response.ok) throw new Error(body.error ?? "Não foi possível excluir a oração.");
      if (editingId === prayer.id) resetForm();
      setNotice("Oração excluída.");
      await loadPrayers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível excluir a oração.");
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" href="/"><span>+</span><span>quando me faltam<strong>palavras</strong></span></Link>
        <div className="admin-topbar-actions">
          <span className="admin-area-label">ÁREA ADMINISTRATIVA</span>
          <Link className="admin-back-link" href="/">Voltar ao app <span>↗</span></Link>
          {authenticated && <button className="admin-logout" onClick={() => void signOut()}>Sair</button>}
        </div>
      </header>

      {!authenticated ? (
        <section className="admin-login-card">
          <p className="admin-eyebrow">ACESSO RESTRITO</p>
          <h1>Seu espaço de cuidado,<br /><em>bem organizado.</em></h1>
          <p className="admin-intro">Entre para gerenciar as orações da sua jornada.</p>
          {error && <p className="admin-alert" role="alert">{error}</p>}
          <form onSubmit={signIn} className="admin-login-form">
            <label htmlFor="admin-password">Senha administrativa</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="admin-primary-button" disabled={saving}>{saving ? "Entrando…" : "Entrar no painel"}<span>→</span></button>
          </form>
          <p className="admin-login-footnote">Acesso protegido por sessão segura.</p>
        </section>
      ) : (
        <div className="admin-content">
          <section className="admin-heading">
            <div><p className="admin-eyebrow">CONTEÚDO DA JORNADA</p><h1>Orações</h1><p>Crie, edite e organize as leituras da sua comunidade.</p></div>
            <button className="admin-primary-button admin-new-button" onClick={() => { resetForm(); setNotice(""); document.getElementById("prayer-form")?.scrollIntoView({ behavior: "smooth" }); }}>＋ Nova oração</button>
          </section>

          {(error || notice) && <p className={error ? "admin-alert" : "admin-notice"} role={error ? "alert" : "status"}>{error || notice}</p>}

          <section className="admin-editor" id="prayer-form">
            <div className="admin-section-heading"><div><p className="admin-eyebrow">{editingId ? "EDIÇÃO" : "NOVA LEITURA"}</p><h2>{editingId ? "Editar oração" : "Adicionar oração"}</h2></div>{editingId && <button className="admin-cancel" onClick={resetForm}>Cancelar edição</button>}</div>
            <form className="admin-prayer-form" onSubmit={savePrayer}>
              <label className="admin-field admin-field-wide">Título<input maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Quando a pressa toma conta" required /></label>
              <label className="admin-field">Categoria / tema<input maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Presença e confiança" /></label>
              <label className="admin-field">Referência bíblica<input maxLength={120} value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Salmo 46:10" /></label>
              <label className="admin-field admin-field-wide">Versículo destacado<input maxLength={500} value={form.verse} onChange={(event) => setForm({ ...form, verse: event.target.value })} placeholder="Aquietai-vos e sabei que eu sou Deus." /></label>
              <label className="admin-field admin-field-wide">Texto da oração<textarea maxLength={50000} rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Escreva o conteúdo completo da oração…" required /></label>
              <label className="admin-field">Dia da jornada <span className="admin-optional">(opcional)</span><input type="number" min="1" max="365" value={form.day_number} onChange={(event) => setForm({ ...form, day_number: event.target.value })} placeholder="1 a 365" /></label>
              <label className="admin-field">Leitura (minutos)<input type="number" min="1" max="120" value={form.reading_minutes} onChange={(event) => setForm({ ...form, reading_minutes: Number(event.target.value) })} required /></label>
              <label className="admin-field">Ordem manual<input type="number" min="0" max="999999" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} required /><small>Menor número aparece primeiro.</small></label>
              <label className="admin-publish-toggle"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span><b>Publicada</b><small>Visível para quem usa o aplicativo</small></span></label>
              <div className="admin-form-actions"><button className="admin-primary-button" disabled={saving}>{saving ? "Salvando…" : editingId ? "Salvar alterações" : "Criar oração"}<span>→</span></button></div>
            </form>
          </section>

          <section className="admin-library">
            <div className="admin-section-heading"><div><p className="admin-eyebrow">BIBLIOTECA</p><h2>Todas as orações <span className="admin-count">{prayers.length}</span></h2></div><p className="admin-published-count">{prayers.filter((prayer) => prayer.published).length} publicadas</p></div>
            <div className="admin-toolbar"><label className="admin-search"><span>⌕</span><input aria-label="Buscar orações" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título, tema ou referência" /></label><label className="admin-sort">Organizar por<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="manual">Ordem manual</option><option value="title">Título (A–Z)</option><option value="day">Dia da jornada</option></select></label></div>
            {loading ? <div className="admin-empty">Carregando orações…</div> : visiblePrayers.length === 0 ? <div className="admin-empty"><span>✳</span><b>{prayers.length ? "Nenhum resultado para essa busca." : "Sua biblioteca começa aqui."}</b><small>{prayers.length ? "Tente outro termo ou crie uma nova oração." : "Adicione a primeira oração usando o formulário acima."}</small></div> : (
              <div className="admin-prayer-list">{visiblePrayers.map((prayer) => (
                <article className="admin-prayer-row" key={prayer.id}>
                  <div className="admin-prayer-day">{prayer.day_number ? `DIA ${String(prayer.day_number).padStart(2, "0")}` : "SEM DIA"}</div>
                  <div className="admin-prayer-info"><h3>{prayer.title}</h3><p>{prayer.category || "Sem categoria"}{prayer.reference ? ` · ${prayer.reference}` : ""} · {prayer.reading_minutes} min</p></div>
                  <span className={prayer.published ? "admin-status is-published" : "admin-status"}><i />{prayer.published ? "Publicada" : "Rascunho"}</span>
                  <span className="admin-order">#{prayer.sort_order}</span>
                  <div className="admin-row-actions"><button onClick={() => editPrayer(prayer)}>Editar</button><button className="admin-delete" onClick={() => void deletePrayer(prayer)}>Excluir</button></div>
                </article>
              ))}</div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
