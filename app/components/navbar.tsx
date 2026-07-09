"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   NAVBAR — Protect Rastreamento
   Fontes: DM Sans + Inter | Ícones: Tabler Icons (via CDN)
   Layout: topbar com logo + redes sociais + idioma + botão de
   plataforma, e abaixo um menu estilo "pílula preta" com
   dropdowns (+ submenu de 2º nível em "Pessoas").
   Drawer mobile com acordeões e integração completa com o
   widget do Google Translate.
   ============================================================ */

type Lang = "pt" | "en" | "es";

interface MenuLink {
  href: string;
  label: string;
  icon: string;
  target?: string;
}

const RASTREAMENTO_LINKS: MenuLink[] = [
  { href: "https://protectrastreamento.com.br/rastreamento-de-frotas/", label: "Frotas", icon: "ti-truck" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-veiculos/", label: "Veículos", icon: "ti-car" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-equipamentos/", label: "Equipamentos", icon: "ti-tool" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-equipamentos-agro/", label: "Equipamentos Agro", icon: "ti-plant" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-animais/", label: "Animais", icon: "ti-paw" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-embarcacoes/", label: "Embarcação", icon: "ti-anchor" },
];

const PESSOAS_LINKS: MenuLink[] = [
  { href: "https://protectrastreamento.com.br/rastreamento-de-pessoas/", label: "Idosos", icon: "ti-walk" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-criancas/", label: "Crianças", icon: "ti-baby-carriage" },
];

const RASTREAMENTO_LINKS_AFTER_PESSOAS: MenuLink[] = [
  { href: "https://protectrastreamento.com.br/rastreamento-para-bikes/", label: "Bikes", icon: "ti-bike" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-aventuras/", label: "Aventuras", icon: "ti-mountain" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-mineracao/", label: "Mineração", icon: "ti-hammer" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-concretagem/", label: "Concretagem", icon: "ti-building" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-armas-e-coletes/", label: "Armas e Coletes", icon: "ti-shield" },
  { href: "https://protectrastreamento.com.br/rastreamento-de-cofres-e-outros/", label: "Cofres e Outros", icon: "ti-lock" },
];

const PARCEIROS_LINKS: MenuLink[] = [
  { href: "https://protectrastreamento.com.br/fornecedores/", label: "Fornecedores", icon: "ti-box" },
  { href: "https://protectrastreamento.com.br/instaladores/", label: "Instaladores", icon: "ti-tool" },
  { href: "https://protectrastreamento.com.br/produtos/", label: "Produtos", icon: "ti-device-mobile" },
  { href: "https://protectrastreamento.com.br/servicos/", label: "Serviços", icon: "ti-star" },
  { href: "https://protectrastreamento.com.br/politica-de-privacidade/", label: "Política de privacidade", icon: "ti-file-text" },
];

const CLIENTES_LINKS: MenuLink[] = [
  { href: "https://protectrastreamento.com.br/como-funciona/", label: "Como funciona", icon: "ti-info-circle" },
  { href: "https://contrato.protectrastreamento.com.br", label: "Contratar", icon: "ti-check", target: "_blank" },
  { href: "https://protectrastreamento.com.br/manual-do-usuario/", label: "Manual do usuário", icon: "ti-book" },
  { href: "https://protectrastreamento.com.br/2-via-de-boleto/", label: "2ª via de boleto", icon: "ti-receipt" },
  { href: "https://protectrastreamento.softruck.com/access/login", label: "Localize seu veículo", icon: "ti-map-search" },
];

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "https://flagcdn.com/w40/br.png", label: "PT" },
  { code: "en", flag: "https://flagcdn.com/w40/us.png", label: "EN" },
  { code: "es", flag: "https://flagcdn.com/w40/es.png", label: "ES" },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInitProtect?: () => void;
  }
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<"rast" | "parc" | "cli" | null>(null);
  const [pessoasOpen, setPessoasOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("pt");
  const gtInjected = useRef(false);

  // ─── Esconde a barra do Google Translate sempre que ela aparecer ───
  useEffect(() => {
    const hideBar = () => {
      document
        .querySelectorAll(".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd")
        .forEach((el) => {
          (el as HTMLElement).style.setProperty("display", "none", "important");
        });
      document.body.style.setProperty("top", "0px", "important");
    };

    hideBar();
    const observer = new MutationObserver(hideBar);
    observer.observe(document.body, { childList: true, subtree: false });

    return () => observer.disconnect();
  }, []);

  // ─── Lê o idioma salvo no cookie ao carregar ───
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/pt\/(\w+)/);
    if (match) {
      setLang(match[1] as Lang);
    } else {
      clearGoogTransCookie();
      setLang("pt");
    }
  }, []);

  // ─── Injeta o widget do Google Translate ───
  useEffect(() => {
    if (gtInjected.current || document.getElementById("nb-gt-element")) return;
    gtInjected.current = true;

    const div = document.createElement("div");
    div.id = "nb-gt-element";
    div.style.cssText = "position:absolute;visibility:hidden;height:0;overflow:hidden;";
    document.body.appendChild(div);

    window.googleTranslateElementInitProtect = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "pt",
          includedLanguages: "en,es,pt",
          autoDisplay: false,
          gaTrack: false,
        },
        "nb-gt-element"
      );
      setTimeout(hideBarNow, 500);
      setTimeout(hideBarNow, 1500);
    };

    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      const s = document.createElement("script");
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInitProtect";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  function hideBarNow() {
    document
      .querySelectorAll(".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd")
      .forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      });
    document.body.style.setProperty("top", "0px", "important");
  }

  function clearGoogTransCookie() {
    const domain = window.location.hostname;
    ["", "." + domain].forEach((d) => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${d ? " domain=" + d + ";" : ""}`;
    });
  }

  function handleSetLang(newLang: Lang, e: React.MouseEvent) {
    e.preventDefault();
    setLang(newLang);

    clearGoogTransCookie();
    const domain = window.location.hostname;
    if (newLang !== "pt") {
      document.cookie = `googtrans=/pt/${newLang}; path=/`;
      document.cookie = `googtrans=/pt/${newLang}; path=/; domain=.${domain}`;
    }

    const sel = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
    if (sel) {
      sel.value = newLang;
      sel.dispatchEvent(new Event("change"));
      sel.dispatchEvent(new Event("change"));
      setTimeout(hideBarNow, 400);
      setTimeout(hideBarNow, 1000);
    }
  }

  function toggleDrawer() {
    setDrawerOpen((prev) => !prev);
  }

  function toggleMobileSub(section: "rast" | "parc" | "cli") {
    setMobileSubOpen((prev) => (prev === section ? null : section));
  }

  return (
    <div className="nb-root">
      {/* ─── Topbar (logo + redes sociais + idioma + botão) ────── */}
      <div className="nb-topbar">
        <a href="https://protectrastreamento.com.br/" className="nb-logo-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="nb-logo-img"
            src="https://protectrastreamento.com.br/wp-content/uploads/2025/01/Sem-Titulo-1.png"
            alt="Protect Rastreamento"
            style={{ width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }}
          />
        </a>

        <div className="nb-socials">
          <a href="https://www.instagram.com/protect.rastreamento/" aria-label="Instagram">
            <i className="ti ti-brand-instagram" />
          </a>
          <a href="https://www.facebook.com/share/17adApCoRb/" aria-label="Facebook">
            <i className="ti ti-brand-facebook" />
          </a>
          <a href="https://api.whatsapp.com/send?phone=553133718600" aria-label="WhatsApp">
            <i className="ti ti-brand-whatsapp" />
          </a>
          <a href="http://linkedin.com/in/protect-rastreamento-a97106350" aria-label="LinkedIn">
            <i className="ti ti-brand-linkedin" />
          </a>
          <a href="https://www.youtube.com/@ProtectRastreamento" aria-label="YouTube">
            <i className="ti ti-brand-youtube" />
          </a>
        </div>

        <div className="nb-topbar-right">
          <div className="nd-lang-desktop">
            {LANGS.map((l) => (
              <a
                key={l.code}
                href="#"
                onClick={(e) => handleSetLang(l.code, e)}
                className={lang === l.code ? "nd-lang-active" : ""}
                title={l.label}
              >
                <img src={l.flag} alt={l.label} />
              </a>
            ))}
          </div>
          <a href="https://protectrastreamento.softruck.com/" className="nb-platform-btn" target="_blank" rel="noopener noreferrer">
            <i className="ti ti-user-circle" aria-hidden="true" />
            Acessar plataforma
          </a>
        </div>

        <button
          className="nb-hamburger"
          aria-label="Abrir menu"
          aria-expanded={drawerOpen}
          onClick={toggleDrawer}
        >
          <i className={drawerOpen ? "ti ti-x" : "ti ti-menu-2"} />
        </button>
      </div>

      {/* ─── Menu principal estilo pílula preta ─────────────────── */}
      <div className="nb-main">
        <nav className="nb-desktop-nav" aria-label="Menu principal">
          <div className="nd-item">
            <a href="https://protectrastreamento.com.br/" className="nd-link">
              Início
            </a>
          </div>
          <div className="nd-item">
            <a href="https://protectrastreamento.com.br/quem-somos/" className="nd-link">
              Quem somos
            </a>
          </div>

          <div className="nd-item">
            <span className="nd-link" tabIndex={0}>
              Rastreamento <i className="ti ti-chevron-down" />
            </span>
            <ul className="nd-dropdown">
              {RASTREAMENTO_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="nd-has-sub">
                <a href="https://protectrastreamento.com.br/rastreamento-de-pessoas/">
                  <i className="ti ti-user" />
                  Pessoas <i className="ti ti-chevron-right" />
                </a>
                <ul className="nd-sub-dropdown">
                  {PESSOAS_LINKS.map((item) => (
                    <li key={item.href}>
                      <a href={item.href}>
                        <i className={`ti ${item.icon}`} />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              {RASTREAMENTO_LINKS_AFTER_PESSOAS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nd-item">
            <span className="nd-link" tabIndex={0}>
              Parceiros <i className="ti ti-chevron-down" />
            </span>
            <ul className="nd-dropdown">
              {PARCEIROS_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nd-item">
            <span className="nd-link" tabIndex={0}>
              Clientes <i className="ti ti-chevron-down" />
            </span>
            <ul className="nd-dropdown">
              {CLIENTES_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target={item.target}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nd-item">
            <a href="https://protectrastreamento.com.br/blog/" className="nd-link">
              Blog
            </a>
          </div>
          <div className="nd-item">
            <a href="https://protectrastreamento.com.br/contato/" className="nd-link">
              Fale conosco
            </a>
          </div>

          <a href="https://contrato.protectrastreamento.com.br" className="nd-cta" target="_blank" rel="noopener noreferrer">
            <i className="ti ti-file-signature" aria-hidden="true" /> Contrato
          </a>
        </nav>
      </div>

      {/* ─── Drawer mobile ─────────────────────────────────────── */}
      <div className={`nb-drawer${drawerOpen ? " open" : ""}`}>
        <div className="nb-lang-bar">
          <span>Idioma</span>
          {LANGS.map((l) => (
            <a
              key={l.code}
              href="#"
              onClick={(e) => handleSetLang(l.code, e)}
              className={lang === l.code ? "nb-lang-active" : ""}
            >
              <img src={l.flag} alt={l.label} /> {l.label}
            </a>
          ))}
        </div>

        <ul className="nb-menu">
          <li>
            <a href="https://protectrastreamento.com.br/" className="nb-item">
              <span>
                <i className="ti ti-home nb-icon-left" />
                Início
              </span>
            </a>
          </li>
          <li>
            <a href="https://protectrastreamento.com.br/quem-somos/" className="nb-item">
              <span>
                <i className="ti ti-users nb-icon-left" />
                Quem somos
              </span>
            </a>
          </li>

          <li>
            <div
              className={`nb-item${mobileSubOpen === "rast" ? " active" : ""}`}
              onClick={() => toggleMobileSub("rast")}
            >
              <span>
                <i className="ti ti-map-pin nb-icon-left" />
                Rastreamento
              </span>
              <i className="ti ti-chevron-down" />
            </div>
            <ul className={`nb-sub${mobileSubOpen === "rast" ? " open" : ""}`}>
              {RASTREAMENTO_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <div
                  className={`nb-item-sub${pessoasOpen ? " active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPessoasOpen((prev) => !prev);
                  }}
                >
                  <span>
                    <i className="ti ti-user" />
                    Pessoas
                  </span>
                  <i className="ti ti-chevron-down" />
                </div>
                <ul className={`nb-sub nb-sub-nested${pessoasOpen ? " open" : ""}`}>
                  {PESSOAS_LINKS.map((item) => (
                    <li key={item.href}>
                      <a href={item.href}>
                        <i className={`ti ${item.icon}`} />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              {RASTREAMENTO_LINKS_AFTER_PESSOAS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li>
            <div
              className={`nb-item${mobileSubOpen === "parc" ? " active" : ""}`}
              onClick={() => toggleMobileSub("parc")}
            >
              <span>
                <i className="ti ti-handshake nb-icon-left" />
                Parceiros
              </span>
              <i className="ti ti-chevron-down" />
            </div>
            <ul className={`nb-sub${mobileSubOpen === "parc" ? " open" : ""}`}>
              {PARCEIROS_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li>
            <div
              className={`nb-item${mobileSubOpen === "cli" ? " active" : ""}`}
              onClick={() => toggleMobileSub("cli")}
            >
              <span>
                <i className="ti ti-user-circle nb-icon-left" />
                Clientes
              </span>
              <i className="ti ti-chevron-down" />
            </div>
            <ul className={`nb-sub${mobileSubOpen === "cli" ? " open" : ""}`}>
              {CLIENTES_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target={item.target}>
                    <i className={`ti ${item.icon}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          <li>
            <a href="https://protectrastreamento.com.br/blog/" className="nb-item">
              <span>
                <i className="ti ti-article nb-icon-left" />
                Blog
              </span>
            </a>
          </li>
          <li>
            <a href="https://protectrastreamento.com.br/contato/" className="nb-item">
              <span>
                <i className="ti ti-message nb-icon-left" />
                Fale conosco
              </span>
            </a>
          </li>
          <li>
            <a href="https://contrato.protectrastreamento.com.br" className="nb-item" target="_blank" rel="noopener noreferrer">
              <span>
                <i className="ti ti-file-signature nb-icon-left" />
                Contrato
              </span>
              <span className="nb-badge">Novo</span>
            </a>
          </li>
        </ul>

        <a
          href="https://protectrastreamento.softruck.com/"
          className="nb-platform-btn-mobile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="ti ti-user-circle" aria-hidden="true" />
          Acessar plataforma
        </a>

        <div className="nb-footer-strip">
          <a href="https://api.whatsapp.com/send?phone=553133718600">
            <i className="ti ti-phone" />
            +55 (31) 3371-8600
          </a>
          <a href="mailto:info@protectrastreamento.com">
            <i className="ti ti-mail" />
            info@protectrastreamento.com
          </a>
        </div>
      </div>

      <style jsx global>{`
        .goog-te-banner-frame,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-te-balloon-frame,
        .goog-te-menu-frame {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0 !important;
          position: static !important;
        }
      `}</style>

      <style jsx>{`
        .nb-root {
          font-family: "Inter", sans-serif;
          background: #fff;
          width: 100%;
          position: relative;
          z-index: 1000;
        }
        .nb-topbar {
          background: #f7f7f7;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e8e8e8;
          gap: 20px;
          position: relative;
        }
        .nb-logo-link {
          display: block;
          flex-shrink: 0;
        }
        .nb-socials {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .nb-socials a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #1a1a1a;
          color: #ffb703;
          font-size: 17px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .nb-socials a:hover {
          background: #ffb703;
          color: #111;
          transform: translateY(-2px);
        }
        .nb-topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }
        .nb-platform-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffb703;
          color: #111;
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 16px;
          border-radius: 6px;
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .nb-platform-btn i {
          font-size: 16px;
        }
        .nb-platform-btn:hover {
          background: #e0a800;
          color: #fff;
        }
        .nb-platform-btn-mobile {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 12px 20px;
          padding: 13px 16px;
          background: #ffb703;
          color: #111;
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .nb-platform-btn-mobile:hover {
          background: #e0a800;
        }
        .nb-platform-btn-mobile i {
          font-size: 18px;
        }
        .nb-hamburger {
          background: none;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #333;
          font-size: 20px;
          transition: border-color 0.2s, background 0.2s;
          flex-shrink: 0;
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
        }
        .nb-hamburger:hover {
          border-color: #c99a00;
          background: #fafafa;
        }

        .nb-main {
          background: #fff;
          padding: 14px 24px 18px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          border-bottom: 1px solid #ebebeb;
          position: relative;
        }

        .nb-desktop-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: #1a1a1a;
          gap: 32px;
          border-radius: 50px;
          padding: 6px 12px;
        }
        .nb-desktop-nav .nd-item {
          position: relative;
          align-self: stretch;
          display: flex;
          align-items: center;
        }
        .nb-desktop-nav .nd-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 12px 10px;
          height: 100%;
          color: #fff;
          font-family: "DM Sans", sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          border-radius: 30px;
          border-bottom: none;
          transition: color 0.2s;
          user-select: none;
        }
        .nb-desktop-nav .nd-link i.ti-chevron-down {
          font-size: 11px;
          color: #999;
          transition: transform 0.2s, color 0.2s;
        }
        .nb-desktop-nav .nd-item:hover > .nd-link,
        .nb-desktop-nav .nd-item:focus-within > .nd-link {
          color: #f5c000;
          background: transparent;
        }
        .nb-desktop-nav .nd-item:hover > .nd-link i.ti-chevron-down,
        .nb-desktop-nav .nd-item:focus-within > .nd-link i.ti-chevron-down {
          transform: rotate(180deg);
          color: #f5c000;
        }
        .nd-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #1a1a1a;
          border: 1px solid #333;
          border-top: 2px solid #f5c000;
          border-radius: 0 0 12px 12px;
          min-width: 220px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transform: translateY(6px);
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 999;
          list-style: none;
          padding: 6px 0;
          margin-top: 6px;
        }
        .nb-desktop-nav .nd-item:hover > .nd-dropdown,
        .nb-desktop-nav .nd-item:focus-within > .nd-dropdown {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        .nd-dropdown li a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          color: #eee;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s, background 0.15s, padding-left 0.15s;
          border-bottom: 1px solid #2a2a2a;
        }
        .nd-dropdown li:last-child a {
          border-bottom: none;
        }
        .nd-dropdown li a:hover {
          color: #f5c000;
          background: #262626;
          padding-left: 22px;
        }
        .nd-dropdown li a i {
          font-size: 14px;
          color: #f5c000;
          opacity: 0.9;
          flex-shrink: 0;
        }

        .nd-dropdown li.nd-has-sub {
          position: relative;
        }
        .nd-dropdown li.nd-has-sub > a i.ti-chevron-right {
          font-size: 11px;
          color: #666;
          margin-left: auto;
          padding-left: 8px;
        }
        .nd-sub-dropdown {
          position: absolute;
          top: -1px;
          left: 100%;
          background: #1a1a1a;
          border: 1px solid #333;
          border-top: 2px solid #f5c000;
          border-radius: 0 12px 12px 12px;
          min-width: 180px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transform: translateX(6px);
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 1000;
          list-style: none;
          padding: 6px 0;
        }
        .nd-dropdown li.nd-has-sub:hover > .nd-sub-dropdown,
        .nd-dropdown li.nd-has-sub:focus-within > .nd-sub-dropdown {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(0);
        }

        .nd-lang-desktop {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nd-lang-desktop a {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          border: 1px solid transparent;
          text-decoration: none;
          transition: all 0.2s;
        }
        .nd-lang-desktop a img {
          width: 22px;
          height: auto;
          display: block;
          border-radius: 2px;
        }
        .nd-lang-desktop a:hover {
          border-color: #e6c800;
          background: #fffbea;
        }
        .nd-lang-desktop a.nd-lang-active {
          border-color: #f5c000;
          background: #fffbea;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .nd-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 5px;
          padding: 10px 14px;
          background: #ffb703;
          color: #111 !important;
          font-family: "DM Sans", sans-serif;
          font-weight: 700;
          border-radius: 30px;
          text-decoration: none;
          transition: background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nd-cta:hover {
          background: #e0ae00 !important;
        }
        .nb-drawer {
          background: #fff;
          border-top: 1px solid #ebebeb;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nb-drawer.open {
          max-height: 900px;
          overflow-y: auto;
        }
        .nb-lang-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          background: #fafafa;
          border-bottom: 2px solid #f0f0f0;
        }
        .nb-lang-bar span {
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .nb-lang-bar a {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1.5px solid #eee;
          text-decoration: none;
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          transition: all 0.2s;
          background: #fff;
        }
        .nb-lang-bar a img {
          width: 20px;
          height: auto;
          display: block;
          border-radius: 2px;
        }
        .nb-lang-bar a:hover {
          border-color: #c99a00;
          color: #c99a00;
          background: #fefaf0;
        }
        .nb-lang-bar a.nb-lang-active {
          border-color: #f5c000;
          color: #111;
          background: #fffbea;
        }
        .nb-menu {
          list-style: none;
          padding: 6px 0 12px;
        }
        .nb-menu > li {
          border-bottom: 1px solid #f0f0f0;
        }
        .nb-menu > li:last-child {
          border-bottom: none;
        }
        .nb-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          color: #333;
          font-family: "DM Sans", sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          user-select: none;
        }
        .nb-item:hover,
        .nb-item.active {
          color: #c99a00;
          background: #fefaf0;
        }
        .nb-item i.ti-chevron-down {
          font-size: 14px;
          transition: transform 0.25s;
          color: #bbb;
        }
        .nb-item.active i.ti-chevron-down {
          transform: rotate(180deg);
          color: #c99a00;
        }
        .nb-sub {
          list-style: none;
          background: #fafafa;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .nb-sub.open {
          max-height: 700px;
        }
        .nb-sub li a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px 11px 28px;
          color: #666;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s, padding-left 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }
        .nb-sub li:last-child a {
          border-bottom: none;
        }
        .nb-sub li a:hover {
          color: #c99a00;
          padding-left: 34px;
          background: #fef9e7;
        }
        .nb-sub li a i {
          font-size: 14px;
          color: #f5c000;
          opacity: 0.85;
          flex-shrink: 0;
        }

        .nb-item-sub {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 20px 11px 28px;
          font-size: 13px;
          font-weight: 500;
          color: #666;
          font-family: "Inter", sans-serif;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s, background 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }
        .nb-item-sub:hover,
        .nb-item-sub.active {
          color: #c99a00;
          background: #fef9e7;
        }
        .nb-item-sub i.ti-user {
          font-size: 14px;
          color: #f5c000;
          opacity: 0.85;
          margin-right: 10px;
        }
        .nb-item-sub i.ti-chevron-down {
          font-size: 12px;
          transition: transform 0.25s;
          color: #bbb;
        }
        .nb-item-sub.active i.ti-chevron-down {
          transform: rotate(180deg);
          color: #c99a00;
        }
        .nb-sub-nested {
          background: #f2f2f2;
        }
        .nb-sub-nested li a {
          padding-left: 44px;
          border-bottom: 1px solid #e8e8e8;
        }

        .nb-footer-strip {
          background: #f7f7f7;
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #ebebeb;
        }
        .nb-footer-strip a {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nb-footer-strip a:hover {
          color: #c99a00;
        }
        .nb-footer-strip a i {
          font-size: 16px;
          color: #f5c000;
          opacity: 0.8;
        }
        .nb-badge {
          background: #f5c000;
          color: #111;
          font-size: 10px;
          font-weight: 600;
          font-family: "DM Sans", sans-serif;
          padding: 2px 7px;
          border-radius: 20px;
          margin-left: auto;
        }
        .nb-icon-left {
          margin-right: 8px;
          font-size: 15px;
          vertical-align: -2px;
          color: #f5c000;
          opacity: 0.85;
        }

        @media (max-width: 1024px) {
          .nb-desktop-nav {
            display: none;
          }
          .nb-hamburger {
            display: flex;
          }
          .nb-logo-img {
            height: 50px !important;
            max-width: 180px !important;
          }
          .nb-platform-btn {
            display: none;
          }
          .nb-platform-btn-mobile {
            display: flex;
          }
          .nd-lang-desktop {
            display: none;
          }
          .nb-socials {
            display: none;
          }
        }
        @media (min-width: 1025px) {
          .nb-drawer {
            display: none !important;
          }
          .nb-hamburger {
            display: none;
          }
          .nb-logo-img {
            height: 65px !important;
            max-width: 240px !important;
          }
        }
      `}</style>
    </div>
  );
}