"use client";

import { useState } from "react";

const moods = ["Em paz", "Cansada", "Ansiosa", "Triste"];
const prayers = [
  { day: "DIA 26", title: "Quando a pressa toma conta", theme: "Presença e confiança", time: "6 min" },
  { day: "DIA 27", title: "O valor de permanecer", theme: "Perseverança", time: "5 min" },
  { day: "DIA 28", title: "Uma pausa para agradecer", theme: "Gratidão", time: "4 min" },
];

export default function Home() {
  const [active, setActive] = useState("Hoje");
  const [mood, setMood] = useState("Em paz");
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="product-shell">
      <aside className="product-sidebar">
        <div className="product-logo"><span>+</span><div>quando me faltam<strong>palavras</strong></div></div>
        <div className="sidebar-rule" />
        <nav className="product-nav" aria-label="Navegação">
          {[{ label: "Hoje", icon: "◷" }, { label: "365 orações", icon: "▤" }, { label: "Meu jardim", icon: "❋" }, { label: "Caderno", icon: "□" }].map((item) => (
            <button key={item.label} className={active === item.label ? "nav-active" : ""} onClick={() => setActive(item.label)}><span>{item.icon}</span>{item.label}</button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <button className="ai-link" onClick={() => setChatOpen(true)}><span>✦</span><div><b>Conversar</b><small>Um espaço seguro para você</small></div><i>↗</i></button>
        <div className="user-row"><span className="user-avatar">M</span><div><b>Maria</b><small>7 dias de presença</small></div><button aria-label="Opções">•••</button></div>
      </aside>

      <section className="product-main">
        <header className="product-header"><span className="mobile-logo">+ palavras</span><span className="header-date">QUARTA, 26 DE AGOSTO DE 2026</span><button className="header-icon" aria-label="Notificações">♧<i /></button></header>
        <div className="page-heading"><div><p className="overline">BOM DIA, MARIA</p><h1>Um pouco de presença<br /><em>para o seu dia.</em></h1><p className="heading-note">Você está no dia 26 da sua jornada.</p></div><div className="streak"><span>✦</span><b>7</b><small>dias<br />seguidos</small></div></div>

        <div className="today-layout">
          <section className="daily-reading">
            <div className="reading-top"><span className="overline">ORAÇÃO DO DIA <b>·</b> DIA 26 DE 365</span><span className="reading-time">○ 6 min de leitura</span></div>
            <div className="reading-title"><div><p className="reading-theme">PRESENÇA E CONFIANÇA</p><h2>Quando a pressa<br />toma conta</h2></div><button className="save-reading" aria-label="Salvar oração">♡</button></div>
            <div className="reading-divider" /><p className="reading-verse">“Aquietai-vos e sabei que eu sou Deus.”</p><p className="reading-ref">SALMO 46:10</p>
            <button className="open-reading">Começar a leitura <span>→</span></button>
          </section>
          <section className="checkin-card"><div className="card-number">01 <span>/ 03</span></div><p className="overline">ANTES DE COMEÇAR</p><h2>Como você chega<br />hoje?</h2><div className="mood-options">{moods.map((item) => <button key={item} className={mood === item ? "mood-selected" : ""} onClick={() => setMood(item)}><span>{item === "Em paz" ? "◒" : item === "Cansada" ? "◡" : item === "Ansiosa" ? "◌" : "⌁"}</span>{item}</button>)}</div><button className="checkin-button" onClick={() => setChecked(true)}>{checked ? "Presença registrada ✓" : "Registrar como estou"}</button></section>
        </div>

        <div className="lower-grid">
          <section className="journal-card"><div className="section-title"><div><p className="overline">CADERNO DE HOJE</p><h2>O que ficou em você?</h2></div><span className="pen-icon">✎</span></div><p className="journal-prompt">Escreva uma palavra, uma pergunta ou simplesmente deixe o que você sente descansar aqui.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Comece a escrever..." /><div className="journal-footer"><span>{note.length > 0 ? `${note.length} caracteres` : "Privado para você"}</span><button disabled={!note}>Guardar nota <span>→</span></button></div></section>
          <section className="garden-summary-card"><div className="section-title"><div><p className="overline">MEU JARDIM</p><h2>Florescendo com você</h2></div><button className="link-button" onClick={() => setActive("Meu jardim")}>Ver jardim →</button></div><div className="garden-mini"><span className="mini-sun">☼</span><span className="mini-flower flower-one">✿</span><span className="mini-flower flower-two">❀</span><span className="mini-flower flower-three">✦</span><div className="mini-hill" /></div><div className="garden-stats"><div><b>12</b><span>flores cuidadas</span></div><div><b>3</b><span>conquistas</span></div><div><b>40%</b><span>até a próxima</span></div></div></section>
        </div>

        <section className="library-section"><div className="section-title"><div><p className="overline">CONTINUE SUA JORNADA</p><h2>Outras orações</h2></div><button className="link-button" onClick={() => setActive("365 orações")}>Ver as 365 →</button></div><div className="prayer-list">{prayers.map((prayer) => <button className="prayer-item" key={prayer.day}><span className="prayer-day">{prayer.day}</span><span><b>{prayer.title}</b><small>{prayer.theme}</small></span><time>{prayer.time}</time><strong>↗</strong></button>)}</div></section>
      </section>
      {chatOpen && <div className="chat-overlay" role="dialog" aria-modal="true"><div className="chat-panel"><button className="close-chat" onClick={() => setChatOpen(false)} aria-label="Fechar">×</button><p className="overline">UM ESPAÇO SEGURO</p><h2>Conversar com alguém</h2><p>Este agente foi pensado para escutar sem julgamentos e acompanhar o que você está vivendo.</p><div className="chat-placeholder">Por onde você gostaria de começar?</div><button className="checkin-button" onClick={() => setChatOpen(false)}>Voltar para o meu dia</button></div></div>}
    </main>
  );
}
