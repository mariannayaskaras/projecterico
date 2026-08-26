import Link from "next/link";

export default function JardimPage() {
  return (
    <main className="garden-page">
      <div className="garden-header">
        <div className="garden-brand"><span>✳</span> quando me faltam palavras</div>
        <Link href="/" className="garden-link">Voltar</Link>
      </div>
      <section className="garden-intro">
        <p className="garden-eyebrow">SEU ESPAÇO DE PRESENÇA</p>
        <h1>Meu jardim</h1>
        <p>Cada pequeno cuidado é uma semente. Veja o que está florescendo em você.</p>
      </section>
      <section className="garden-visual" aria-label="Jardim em crescimento">
        <span className="garden-sun">☼</span>
        <span className="garden-flower flower-a">✿</span>
        <span className="garden-flower flower-b">❀</span>
        <span className="garden-flower flower-c">✦</span>
        <div className="garden-hills" />
      </section>
      <section className="garden-summary">
        <div><strong>7</strong><span>dias de presença</span></div>
        <div><strong>12</strong><span>flores cuidadas</span></div>
        <div><strong>3</strong><span>conquistas</span></div>
      </section>
    </main>
  );
}
