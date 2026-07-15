"use client";
/* ============================================================
   SIM CARD M2M
   Fonte: DM Sans | Paleta: Preto #1a1a1a / Dourado #F5C000 / Branco
   Interativo — o usuário seleciona operadoras e envia via WhatsApp.
   ============================================================ */

import { useState } from "react";

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

const WHATSAPP_NUMBER = "553133718600";

function SimChips({
  brands,
  selected,
  onToggle,
}: {
  brands: SimBrand[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div className="pm2m-chips">
      {brands.map((b) => {
        const isSelected = selected.has(b.name);
        return (
          <button
            type="button"
            className={`pm2m-sim ${isSelected ? "pm2m-sim--selected" : ""}`}
            key={b.name}
            onClick={() => onToggle(b.name)}
            aria-pressed={isSelected}
            aria-label={`Selecionar ${b.name}`}
          >
            {/* Checkmark */}
            <span className="pm2m-sim-check" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#f5c000" />
                <path
                  d="M6 10.5l2.5 2.5 5.5-5.5"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className={`pm2m-sim-logo ${b.className}`}
              style={b.fontSize ? { fontSize: b.fontSize } : undefined}
            >
              {b.name}
            </span>
            <span className="pm2m-sim-tag">M2M</span>
            <span className="pm2m-chip" />
          </button>
        );
      })}
    </div>
  );
}

export default function SimCardM2M() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const hasSelection = selected.size > 0;

  const whatsappUrl = (() => {
    if (!hasSelection) return "#";
    const names = [...selected].join(", ");
    const msg = `Olá, vim pelo site e tenho interesse nos Sim Cards M2M das operadoras: ${names}. Gostaria de mais informações!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  })();

  return (
    <div className="pm2m-wrap">
      <div className="pm2m-eyebrow">
        <span>SIM CARD M2M</span>
      </div>

      {/* Dica de seleção */}
      <p className="pm2m-select-hint">
        Toque nas operadoras de seu interesse para solicitar via WhatsApp
      </p>

      <div className="pm2m-grid">
        {/* CARD 1 — Operadoras */}
        <div className="pm2m-card">
          <div className="pm2m-img-wrap">
             <img src="https://protectrastreamento.com.br/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-23-at-14.19.00-e1761251542442.jpeg" alt="Operadoras" className="pm2m-img" />
          </div>
          <h3 className="pm2m-card-title">Operadoras</h3>
          <SimChips brands={OPERADORAS} selected={selected} onToggle={toggle} />
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
          <SimChips brands={MULTIOPERADORAS} selected={selected} onToggle={toggle} />
          <div className="pm2m-card-desc">
            <b>Sim Cards 20 MB</b> — Multioperadoras Arqia, Algar e Virtueyes.
          </div>
        </div>
      </div>

      {/* Botão WhatsApp — aparece quando há seleção */}
      <div className={`pm2m-wa-bar ${hasSelection ? "pm2m-wa-bar--visible" : ""}`}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pm2m-wa-btn"
          aria-disabled={!hasSelection}
          tabIndex={hasSelection ? 0 : -1}
        >
          <svg className="pm2m-wa-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>
            Solicitar via WhatsApp
            {hasSelection && (
              <span className="pm2m-wa-count">
                {selected.size} {selected.size === 1 ? "selecionada" : "selecionadas"}
              </span>
            )}
          </span>
        </a>
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
          margin-bottom: 16px;
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

        .pm2m-select-hint {
          text-align: center;
          color: var(--gray);
          font-size: 14px;
          margin: 0 0 32px;
          line-height: 1.4;
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

        /* ---- SIM card selecionável ---- */
        .pm2m-sim {
          position: relative;
          width: 78px;
          height: 100px;
          background: #fff;
          border: 2px solid var(--line);
          border-radius: 10px 10px 10px 2px;
          box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px 8px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          /* Reset button styles */
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          outline: none;
        }
        .pm2m-sim:focus-visible {
          box-shadow: 0 0 0 3px rgba(245, 192, 0, 0.4);
        }
        .pm2m-sim::after {
          content: "";
          position: absolute;
          top: -2px;
          right: -2px;
          width: 22px;
          height: 22px;
          background: #fff;
          border-left: 2px solid var(--line);
          border-bottom: 2px solid var(--line);
          border-radius: 0 10px 0 12px;
          transition: border-color 0.3s ease;
        }
        .pm2m-sim:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
          box-shadow: 0 10px 24px -8px rgba(245, 192, 0, 0.25);
        }
        .pm2m-sim:hover::after {
          border-color: var(--gold);
        }

        /* Estado selecionado */
        .pm2m-sim--selected {
          border-color: var(--gold) !important;
          box-shadow: 0 0 0 3px rgba(245, 192, 0, 0.18), 0 8px 20px -6px rgba(245, 192, 0, 0.3) !important;
          transform: translateY(-4px) scale(1.04);
        }
        .pm2m-sim--selected::after {
          border-color: var(--gold) !important;
        }

        /* Checkmark */
        .pm2m-sim-check {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 20px;
          height: 20px;
          z-index: 2;
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }
        .pm2m-sim-check :global(svg) {
          width: 100%;
          height: 100%;
          display: block;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
        }
        .pm2m-sim--selected .pm2m-sim-check {
          opacity: 1;
          transform: scale(1);
        }

        .pm2m-card:hover .pm2m-sim:not(.pm2m-sim--selected) {
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

        /* ---- Botão WhatsApp ---- */
        .pm2m-wa-bar {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.35s ease,
                      margin-top 0.35s ease;
          margin-top: 0;
        }
        .pm2m-wa-bar--visible {
          max-height: 100px;
          opacity: 1;
          margin-top: 32px;
        }
        .pm2m-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #25d366;
          color: #fff;
          font-family: "DM Sans", sans-serif;
          font-weight: 800;
          font-size: 16px;
          padding: 14px 32px;
          border-radius: 999px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 24px -4px rgba(37, 211, 102, 0.4);
        }
        .pm2m-wa-btn:hover {
          background: #1ebe5a;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -4px rgba(37, 211, 102, 0.5);
        }
        .pm2m-wa-btn:active {
          transform: translateY(0);
        }
        .pm2m-wa-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        .pm2m-wa-count {
          display: inline-block;
          margin-left: 6px;
          font-size: 13px;
          font-weight: 600;
          opacity: 0.85;
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
          .pm2m-wa-btn {
            font-size: 14px;
            padding: 12px 24px;
          }
        }
      `}</style>
    </div>
  );
}