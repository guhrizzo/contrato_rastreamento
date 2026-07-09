/* ============================================================
   SIM CARD M2M
   Fonte: DM Sans | Paleta: Preto #1a1a1a / Dourado #F5C000 / Branco
   Sem interatividade (hover states via CSS) — não precisa de
   "use client".
   ============================================================ */

interface SimBrand {
  name: string;
  className: string;
  fontSize?: string;
}

const OPERADORAS: SimBrand[] = [
  { name: "vivo", className: "brand-vivo" },
  { name: "Claro", className: "brand-claro" },
  { name: "TIM", className: "brand-tim" },
];

const MULTIOPERADORAS: SimBrand[] = [
  { name: "ARQIA", className: "brand-arqia" },
  { name: "Algar", className: "brand-algar" },
  { name: "VIRTUEYES", className: "brand-virtueyes", fontSize: "9.5px" },
];

function SimChips({ brands }: { brands: SimBrand[] }) {
  return (
    <div className="pm2m-chips">
      {brands.map((b) => (
        <div className="pm2m-sim" key={b.name}>
          <div className={`pm2m-sim-logo ${b.className}`} style={b.fontSize ? { fontSize: b.fontSize } : undefined}>
            {b.name}
          </div>
          <div className="pm2m-sim-tag">M2M</div>
          <div className="pm2m-chip" />
        </div>
      ))}
    </div>
  );
}

export default function SimCardM2M() {
  return (
    <div className="pm2m-wrap">
      <div className="pm2m-eyebrow">
        <span>SIM CARD M2M</span>
      </div>

      <div className="pm2m-grid">
        {/* CARD 1 — Operadoras */}
        <div className="pm2m-card">
          <div className="pm2m-img-wrap">
             <img src="https://protectrastreamento.com.br/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-23-at-14.19.00-e1761251542442.jpeg" alt="Operadoras" className="pm2m-img" />
          </div>
          <h3 className="pm2m-card-title">Operadoras</h3>
          <div className="pm2m-card-desc">
            <b>Sim Cards 20 MB</b> — M2M das operadoras Vivo, Claro e TIM.
          </div>
        </div>

        {/* CARD 2 — Destaque */}
        <div className="pm2m-hero">
          <div className="pm2m-hero-bg" />
          <div className="pm2m-hero-overlay" />
          <span className="pm2m-hero-badge">Dica Protect</span>
          <h3>Otimize a conectividade M2M da sua operação com nossas dicas!</h3>
          <a
            href="https://wa.me/553133718600?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20Sim%20Cards%20M2M%20da%20Protect%20Rastreamento!"
            target="_blank"
            rel="noopener noreferrer"
            className="pm2m-hero-cta"
          >
            Saiba mais
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <div className="pm2m-hero-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://protectrastreamento.com.br/wp-content/uploads/2025/01/Sem-Titulo-1.png"
              alt="Grupo Protect"
            />
          </div>
        </div>

        {/* CARD 3 — Multioperadoras */}
        <div className="pm2m-card">
          <div className="pm2m-img-wrap">
             <img src="https://protectrastreamento.com.br/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-23-at-14.19.00-e1761251572170.webp" alt="Multioperadoras" className="pm2m-img" />
          </div>
          <h3 className="pm2m-card-title">Multioperadoras</h3>
          <div className="pm2m-card-desc">
            <b>Sim Cards 20 MB</b> — Multioperadoras Arqia, Algar e Virtueyes.
          </div>
        </div>
      </div>

      <style jsx>{`
        .pm2m-img-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 26px;
        }
        .pm2m-img {
          height: 100px;
          width: auto;
          object-fit: contain;
        }
        .pm2m-wrap {
          --gold: #f5c000;
          --gold-deep: #c89400;
          --ink: #1a1a1a;
          --ink-soft: #3a3a3a;
          --gray: #6f6f6f;
          --line: #ececec;
          font-family: "DM Sans", sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 24px 60px;
          box-sizing: border-box;
        }
        .pm2m-wrap * {
          box-sizing: border-box;
        }

        .pm2m-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 40px;
        }
        .pm2m-eyebrow::before,
        .pm2m-eyebrow::after {
          content: "";
          height: 1px;
          flex: 1;
          background: linear-gradient(90deg, transparent, var(--gold) 50%, transparent);
        }
        .pm2m-eyebrow span {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 3px;
          color: var(--ink);
          white-space: nowrap;
          padding: 6px 18px;
          border: 1.5px solid var(--gold);
          border-radius: 999px;
        }

        .pm2m-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr 1fr;
          gap: 22px;
          align-items: stretch;
        }

        .pm2m-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 30px 26px 26px;
          display: flex;
          flex-direction: column;
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .pm2m-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
          box-shadow: 0 18px 40px -20px rgba(0, 0, 0, 0.18);
        }

        .pm2m-chips {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 26px;
        }

        .pm2m-sim {
          position: relative;
          width: 78px;
          height: 100px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 10px 10px 10px 2px;
          box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px 8px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pm2m-sim::after {
          content: "";
          position: absolute;
          top: -1px;
          right: -1px;
          width: 22px;
          height: 22px;
          background: #fff;
          border-left: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          border-radius: 0 10px 0 12px;
        }
        .pm2m-card:hover .pm2m-sim {
          transform: translateY(-6px);
        }

        .pm2m-sim-logo {
          font-weight: 800;
          font-size: 12.5px;
          letter-spacing: -0.2px;
          line-height: 1;
          margin-bottom: 4px;
          text-align: center;
        }
        .pm2m-sim-tag {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #9a9a9a;
        }
        .pm2m-chip {
          margin-top: auto;
          width: 34px;
          height: 24px;
          border-radius: 4px;
          background: linear-gradient(135deg, #f6d976, var(--gold) 45%, var(--gold-deep));
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        }
        .pm2m-chip::before {
          content: "";
          position: absolute;
          inset: 3px 5px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          border-radius: 2px;
          background: linear-gradient(rgba(0, 0, 0, 0.12) 1px, transparent 1px) 0 0/100% 33.3%,
            linear-gradient(90deg, rgba(0, 0, 0, 0.12) 1px, transparent 1px) 0 0/50% 100%;
        }

        .brand-vivo {
          color: #5b2e90;
        }
        .brand-claro {
          color: #da291c;
        }
        .brand-tim {
          color: #00287a;
        }
        .brand-arqia {
          color: #173b6c;
        }
        .brand-algar {
          color: #0092bc;
        }
        .brand-virtueyes {
          color: #0b2a4a;
        }

        .pm2m-card-title {
          text-align: center;
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .pm2m-card-title::after {
          content: "";
          display: block;
          width: 40px;
          height: 3px;
          background: var(--gold);
          margin: 10px auto 0;
          border-radius: 3px;
        }

        .pm2m-card-desc {
          border-top: 1px solid var(--line);
          padding-top: 18px;
          margin-top: auto;
          text-align: center;
          color: var(--ink-soft);
          font-size: 14.5px;
          line-height: 1.55;
        }
        .pm2m-card-desc :global(b) {
          color: var(--ink);
        }

        .pm2m-hero {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          min-height: 420px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 34px 30px 30px;
          isolation: isolate;
        }
        .pm2m-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url("https://protectrastreamento.com.br/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-23-at-14.19.00-e1761251572170.webp");
          background-size: cover;
          background-position: center;
          z-index: -2;
          transform: scale(1.02);
          transition: transform 0.6s ease;
        }
        .pm2m-hero:hover .pm2m-hero-bg {
          transform: scale(1.08);
        }
        .pm2m-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 26, 26, 0.15) 0%,
            rgba(26, 26, 26, 0.55) 55%,
            rgba(10, 10, 10, 0.92) 100%
          );
          z-index: -1;
        }
        .pm2m-hero-badge {
          position: absolute;
          top: 22px;
          left: 22px;
          background: var(--gold);
          color: var(--ink);
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 1.5px;
          padding: 7px 14px;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .pm2m-hero h3 {
          color: #fff;
          font-size: 27px;
          font-weight: 800;
          line-height: 1.22;
          margin: 0 0 14px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }
        .pm2m-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          background: var(--gold);
          color: var(--ink);
          font-weight: 800;
          font-size: 14px;
          padding: 12px 22px;
          border-radius: 999px;
          text-decoration: none;
          margin-bottom: 22px;
          transition: background 0.25s ease, transform 0.25s ease;
        }
        .pm2m-hero-cta:hover {
          background: #fff;
          transform: translateX(3px);
        }
        .pm2m-hero-cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.25s ease;
        }
        .pm2m-hero-cta:hover svg {
          transform: translateX(3px);
        }

        .pm2m-hero-brand {
          display: flex;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          padding-top: 16px;
        }
        .pm2m-hero-brand :global(img) {
          height: 60px;
          width: auto;
          display: block;
        }

        @media (max-width: 900px) {
          .pm2m-grid {
            grid-template-columns: 1fr;
          }
          .pm2m-hero {
            order: -1;
            min-height: 320px;
          }
        }
        @media (max-width: 480px) {
          .pm2m-wrap {
            padding: 20px 14px 40px;
          }
          .pm2m-chips {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}