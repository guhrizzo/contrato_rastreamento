"use client";

import { useEffect, useState } from "react";

/* ============================================================
   FOOTER — Protect Rastreamento
   Fontes: DM Sans + Inter | Ícones: Tabler Icons (via CDN)
   3 colunas: Marca | Fale Conosco | App + Redes Sociais
   ============================================================ */

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="pf-footer">
      <div className="pf-main">
        {/* ── COLUNA 1: MARCA ── */}
        <div className="pf-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pf-logo"
            src="https://protectrastreamento.com.br/wp-content/uploads/2025/01/Sem-Titulo-1.png"
            alt="Protect Rastreamento"
          />
          <p className="pf-tagline">
            <strong>Mais de 35 anos de experiência</strong>
            em tecnologia e segurança de rastreamento veicular.
          </p>
        </div>

        {/* ── COLUNA 2: FALE CONOSCO ── */}
        <div className="pf-contact">
          <h3 className="pf-col-title">Fale Conosco</h3>
          <ul className="pf-contact-list">
            <li>
              <div className="ic">
                <i className="ti ti-phone" />
              </div>
              <a href="tel:+553133718600">+55 (31) 3371-8600</a>
            </li>
            <li>
              <div className="ic">
                <i className="ti ti-mail" />
              </div>
              <a href="mailto:info@protectrastreamento.com">INFO@PROTECTRASTREAMENTO.COM</a>
            </li>
            <li>
              <div className="ic">
                <i className="ti ti-map-pin" />
              </div>
              <span>RUA GENERAL ANDRADE NEVES 622, BAIRRO GRAJAÚ — BELO HORIZONTE, MG</span>
            </li>
          </ul>
        </div>

        {/* ── COLUNA 3: APP + REDES ── */}
        <div className="pf-right">
          <h3 className="pf-col-title">Baixe o App</h3>
          <div className="pf-app-badges">
            <a
              className="pf-badge"
              href="https://apps.apple.com/br/app/grupo-protect-rastreamento/id6738363845"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="pf-badge-icon">
                <i className="ti ti-brand-apple" style={{ fontSize: "22px", lineHeight: 1 }} />
              </div>
              <div className="pf-badge-text">
                <span>Disponível na</span>
                <span>App Store</span>
              </div>
            </a>
            <a
              className="pf-badge"
              href="https://play.google.com/store/apps/details?id=com.softruck.protectrast"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="pf-badge-icon">
                <i className="ti ti-brand-google-play" style={{ fontSize: "22px", lineHeight: 1 }} />
              </div>
              <div className="pf-badge-text">
                <span>Disponível no</span>
                <span>Google Play</span>
              </div>
            </a>
          </div>

          <div className="pf-social-label">Redes Sociais</div>
          <div className="pf-social-icons">
            <a
              href="https://www.facebook.com/profile.php?id=61567757725049&mibextid=LQQJ4d"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="ti ti-brand-facebook" />
            </a>
            <a
              href="https://www.instagram.com/protect.rastreamento/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="ti ti-brand-instagram" />
            </a>
            <a href="mailto:info@protectrastreamento.com" aria-label="E-mail">
              <i className="ti ti-mail" />
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=553133718600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <i className="ti ti-brand-whatsapp" />
            </a>
            <a
              href="https://www.linkedin.com/in/protect-rastreamento-a97106350"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="ti ti-brand-linkedin" />
            </a>
            <a
              href="https://www.youtube.com/@ProtectRastreamento"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="ti ti-brand-youtube" />
            </a>
          </div>
        </div>
      </div>

      <div className="pf-divider" />

      <div className="pf-bottom">
        <p className="pf-copy">
          © <span>{year ?? ""}</span> <span>Grupo Protect Rastreamento</span> — TODOS OS DIREITOS RESERVADOS
        </p>
      </div>

      <style jsx>{`
        .pf-footer {
          --gold: #c9a000;
          --gold-vivid: #f5c400;
          --gold-soft: #f5c40018;
          --gold-border: #e8b80033;
          --text-head: #1a1c20;
          --text-body: #3a3d45;
          --muted: #7a7d88;
          --bg: #fff;
          --bg-card: #ffffff;
          --border: #e2e4ea;
          --radius: 10px;
          --font-head: "DM Sans", sans-serif;
          --font-body: "Inter", sans-serif;

          background: var(--bg);
          border-top: 2px solid var(--gold-vivid);
          font-family: var(--font-body);
          color: var(--text-body);
        }
        .pf-footer * {
          box-sizing: border-box;
        }

        .pf-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 52px 40px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 40px 32px;
          align-items: start;
        }

        .pf-logo {
          display: block;
          width: 130px;
          margin-bottom: 18px;
        }
        .pf-tagline {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 400;
          color: var(--muted);
          line-height: 1.65;
          max-width: 220px;
        }
        .pf-tagline strong {
          display: block;
          color: var(--text-head);
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .pf-col-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-head);
          margin-bottom: 20px;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pf-col-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, var(--gold-vivid) 0%, transparent 100%);
          opacity: 0.5;
        }
        .pf-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pf-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .pf-contact-list .ic {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--gold-soft);
          border: 1px solid var(--gold-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pf-contact-list .ic i {
          font-size: 16px;
          color: var(--gold);
          line-height: 1;
        }
        .pf-contact-list a,
        .pf-contact-list span {
          font-size: 13px;
          color: var(--text-body);
          text-decoration: none;
          line-height: 1.5;
          padding-top: 7px;
          transition: color 0.2s;
        }
        .pf-contact-list a:hover {
          color: var(--gold);
        }

        .pf-app-badges {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }
        .pf-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius);
          background: var(--bg-card);
          border: 1px solid var(--border);
          text-decoration: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-badge:hover {
          border-color: var(--gold-vivid);
          box-shadow: 0 2px 10px #f5c40022;
        }
        .pf-badge-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pf-badge-icon svg {
          width: 22px;
          height: 22px;
        }
        .pf-badge-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .pf-badge-text span:first-child {
          font-size: 10px;
          color: var(--muted);
          font-family: var(--font-body);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .pf-badge-text span:last-child {
          font-size: 14px;
          font-family: var(--font-head);
          font-weight: 600;
          color: var(--text-head);
        }

        .pf-social-label {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-head);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pf-social-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, var(--gold-vivid) 0%, transparent 100%);
          opacity: 0.5;
        }
        .pf-social-icons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pf-social-icons a {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #1a1a1a;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: #ffb703;
          transition: background 0.2s, transform 0.15s;
        }
        .pf-social-icons a:hover {
          background: #ffb703;
          color: #111;
          transform: translateY(-2px);
        }
        .pf-social-icons a i {
          font-size: 18px;
          line-height: 1;
        }

        .pf-divider {
          max-width: 1280px;
          margin: 0 auto;
          height: 1px;
          background: var(--border);
        }

        .pf-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
        }
        .pf-copy {
          font-size: 11.5px;
          color: var(--muted);
          font-family: var(--font-body);
          text-align: center;
          letter-spacing: 0.02em;
        }
        .pf-copy span {
          color: var(--text-head);
          font-weight: 600;
        }

        @media (max-width: 1300px) {
          .pf-main {
            padding: 44px 32px 36px;
            gap: 32px 24px;
          }
          .pf-bottom {
            padding: 16px 32px;
          }
        }
        @media (max-width: 1024px) {
          .pf-main {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            padding: 40px 28px 32px;
            gap: 36px 24px;
          }
          .pf-brand {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            gap: 20px;
          }
          .pf-logo {
            margin-bottom: 0;
            width: 110px;
          }
          .pf-tagline {
            max-width: 100%;
          }
          .pf-bottom {
            padding: 16px 28px;
          }
        }
        @media (max-width: 640px) {
          .pf-main {
            grid-template-columns: 1fr;
            padding: 36px 20px 28px;
          }
          .pf-brand {
            grid-column: auto;
            display: block;
          }
          .pf-logo {
            margin-bottom: 14px;
          }
          .pf-bottom {
            padding: 16px 20px;
          }
        }
      `}</style>
    </footer>
  );
}