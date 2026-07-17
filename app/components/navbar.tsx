"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit2?: () => void;
    google?: any;
  }
}

export default function Navbar() {
  useEffect(() => {
    // Hamburger mobile
    const ham = document.getElementById("hamburger");
    const drawer = document.getElementById("drawer");
    const hamIcon = document.getElementById("ham-icon");

    if (ham && drawer && hamIcon) {
      ham.addEventListener("click", () => {
        const isOpen = drawer.classList.toggle("open");
        ham.setAttribute("aria-expanded", String(isOpen));
        hamIcon.className = isOpen ? "ti ti-x" : "ti ti-menu-2";
      });
    }

    // Toggle submenus mobile
    const toggles: [string, string][] = [
      ["toggle-rast", "sub-rast"],
      ["toggle-parc", "sub-parc"],
      ["toggle-cli", "sub-cli"],
      ["toggle-platform-mobile", "sub-platform-mobile"],
    ];
    toggles.forEach(([tid, sid]) => {
      const toggleEl = document.getElementById(tid);
      const subEl = document.getElementById(sid);
      if (toggleEl && subEl) {
        toggleEl.addEventListener("click", function () {
          const isOpen = subEl.classList.toggle("open");
          this.classList.toggle("active", isOpen);
          document.querySelectorAll(".nb-sub").forEach((s) => {
            const sub = s as HTMLElement;
            if (sub.id !== sid && sub.classList.contains("open") && sub.id !== "sub-pessoas") {
              sub.classList.remove("open");
              const t = document.querySelector("#toggle-" + sub.id.replace("sub-", ""));
              if (t) t.classList.remove("active");
            }
          });
        });
      }
    });

    // Pessoas submenu (mobile)
    const togglePessoas = document.getElementById("toggle-pessoas");
    const subPessoas = document.getElementById("sub-pessoas");
    if (togglePessoas && subPessoas) {
      togglePessoas.addEventListener("click", function (e) {
        e.stopPropagation();
        const isOpen = subPessoas.classList.toggle("open");
        this.classList.toggle("active", isOpen);
      });
    }

    // ─── GOOGLE TRANSLATE ───
    function nbHideBar() {
      document.querySelectorAll(".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd").forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      });
      document.body.style.setProperty("top", "0px", "important");
    }

    const nbBarObserver = new MutationObserver(() => nbHideBar());
    nbBarObserver.observe(document.body, { childList: true, subtree: false });

    function nbUpdateVisual(lang: string) {
      const map: Record<string, number> = { pt: 0, en: 1, es: 2 };
      const idx = map[lang] ?? 0;
      document.querySelectorAll(".nd-lang-desktop a").forEach((a, i) => {
        a.classList.toggle("nd-lang-active", i === idx);
      });
      document.querySelectorAll(".nb-lang-bar a").forEach((a, i) => {
        a.classList.toggle("nb-lang-active", i === idx);
      });
    }

    function nbSetLang(lang: string, e: Event) {
      e.preventDefault();
      nbUpdateVisual(lang);

      const domain = location.hostname;
      ["", "." + domain].forEach((d) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${d ? " domain=" + d + ";" : ""}`;
      });

      if (lang !== "pt") {
        document.cookie = `googtrans=/pt/${lang}; path=/`;
        document.cookie = `googtrans=/pt/${lang}; path=/; domain=.${domain}`;
      }

      const sel = document.querySelector("select.goog-te-combo") as HTMLSelectElement | null;
      if (sel) {
        sel.value = lang === "pt" ? "pt" : lang;
        sel.dispatchEvent(new Event("change"));
        setTimeout(nbHideBar, 400);
      }
    }

    // Expor para uso inline nos onClick
    (window as any).nbSetLang = nbSetLang;

    // Inicializa visual conforme cookie
    (function initLangVisual() {
      const match = document.cookie.match(/googtrans=\/pt\/(\w+)/);
      if (match) nbUpdateVisual(match[1]);
      else nbUpdateVisual("pt");
    })();

    // Google Translate Init
    if (!document.getElementById("nb-gt-element")) {
      const div = document.createElement("div");
      div.id = "nb-gt-element";
      div.style.cssText = "position:absolute;visibility:hidden;height:0;overflow:hidden;";
      document.body.appendChild(div);

      window.googleTranslateElementInit2 = function () {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "pt",
              includedLanguages: "en,es,pt",
              autoDisplay: false,
              gaTrack: false,
            },
            "nb-gt-element"
          );
        }
      };

      if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
        const s = document.createElement("script");
        s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2";
        s.async = true;
        document.head.appendChild(s);
      }
    }

    // ─── HOVER DOS DROPDOWNS (DESKTOP) ───
    function setupHoverGroup(
      triggerEl: HTMLElement | null,
      panelEl: HTMLElement | null,
      openClassTarget: HTMLElement | null
    ) {
      if (!triggerEl || !panelEl || !openClassTarget) return;
      let closeTimer: ReturnType<typeof setTimeout> | null = null;

      function open() {
        if (closeTimer) clearTimeout(closeTimer);
        openClassTarget!.classList.add("nd-open");
      }
      function scheduleClose() {
        closeTimer = setTimeout(() => {
          openClassTarget!.classList.remove("nd-open");
        }, 200);
      }

      [triggerEl, panelEl].forEach((el) => {
        el.addEventListener("mouseenter", open);
        el.addEventListener("mouseleave", scheduleClose);
      });
      triggerEl.addEventListener("focus", open);
      triggerEl.addEventListener("blur", scheduleClose);
    }

    document.querySelectorAll(".nb-desktop-nav .nd-item").forEach((item) => {
      const it = item as HTMLElement;
      const dropdown = it.querySelector(":scope > .nd-dropdown") as HTMLElement | null;
      if (dropdown) setupHoverGroup(it, dropdown, it);
    });
    document.querySelectorAll(".nd-dropdown li.nd-has-sub").forEach((li) => {
      const liEl = li as HTMLElement;
      const subDropdown = liEl.querySelector(":scope > .nd-sub-dropdown") as HTMLElement | null;
      if (subDropdown) setupHoverGroup(liEl, subDropdown, liEl);
    });
    const platformDropdown = document.querySelector(".nb-platform-dropdown") as HTMLElement | null;
    if (platformDropdown) {
      const trigger = platformDropdown.querySelector(".nb-platform-btn") as HTMLElement | null;
      const menu = platformDropdown.querySelector(".nb-platform-menu") as HTMLElement | null;
      setupHoverGroup(trigger, menu, platformDropdown);
    }

    return () => {
      nbBarObserver.disconnect();
    };
  }, []);

  // onClick handlers para os botões de idioma
  const langHandler = (lang: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const domain = window.location.hostname;
    ["", "." + domain].forEach((d) => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${d ? " domain=" + d + ";" : ""}`;
    });
    if (lang !== "pt") {
      document.cookie = `googtrans=/pt/${lang}; path=/`;
      document.cookie = `googtrans=/pt/${lang}; path=/; domain=.${domain}`;
    }
    const sel = document.querySelector("select.goog-te-combo") as HTMLSelectElement | null;
    if (sel) {
      sel.value = lang === "pt" ? "" : lang;
      sel.dispatchEvent(new Event("change"));
    }
    document.querySelectorAll(".nd-lang-desktop a").forEach((a, i) => {
      const map: Record<string, number> = { pt: 0, en: 1, es: 2 };
      a.classList.toggle("nd-lang-active", i === (map[lang] ?? 0));
    });
    document.querySelectorAll(".nb-lang-bar a").forEach((a, i) => {
      const map: Record<string, number> = { pt: 0, en: 1, es: 2 };
      a.classList.toggle("nb-lang-active", i === (map[lang] ?? 0));
    });
  };

  return (
    <>
      <div className="nb-root">
        <div className="nb-topbar">
          <a href="https://protectrastreamento.com.br/" className="nb-logo-link">
            <img
              className="nb-logo-img"
              src="https://protectrastreamento.com.br/wp-content/uploads/2025/01/Sem-Titulo-1.png"
              alt="Protect Rastreamento"
              style={{ width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }}
            />
          </a>

          <div className="nb-socials">
            <a href="https://www.instagram.com/protect.rastreamento/" aria-label="Instagram"><i className="ti ti-brand-instagram"></i></a>
            <a href="https://www.facebook.com/share/17adApCoRb/" aria-label="Facebook"><i className="ti ti-brand-facebook"></i></a>
            <a href="https://api.whatsapp.com/send?phone=553133718600" aria-label="WhatsApp"><i className="ti ti-brand-whatsapp"></i></a>
            <a href="http://linkedin.com/in/protect-rastreamento-a97106350" aria-label="LinkedIn"><i className="ti ti-brand-linkedin"></i></a>
            <a href="https://www.youtube.com/@ProtectRastreamento" aria-label="YouTube"><i className="ti ti-brand-youtube"></i></a>
          </div>

          <div className="nb-topbar-right">
            <div className="nd-lang-desktop">
              <a href="#" onClick={langHandler("pt")} className="nd-lang-active" title="Português">
                <img src="https://flagcdn.com/w40/br.png" alt="PT" />
              </a>
              <a href="#" onClick={langHandler("en")} title="English">
                <img src="https://flagcdn.com/w40/us.png" alt="EN" />
              </a>
              <a href="#" onClick={langHandler("es")} title="Español">
                <img src="https://flagcdn.com/w40/es.png" alt="ES" />
              </a>
            </div>

            <div className="nb-platform-dropdown">
              <div className="nb-platform-btn" tabIndex={0}>
                <i className="ti ti-user-circle" aria-hidden="true"></i>
                Área de Clientes
                <i className="ti ti-chevron-down" aria-hidden="true"></i>
              </div>
              <ul className="nb-platform-menu">
                <li><a href="https://protectrastreamento.softruck.com/" target="_blank" rel="noopener noreferrer"><i className="ti ti-login"></i>Acesso plataforma</a></li>
                <li><a href="https://protectrastreamento.com.br/2-via-de-boleto/"><i className="ti ti-receipt"></i>2ª via boleto</a></li>
                <li><a href="https://protectrastreamento.com.br/manual-do-usuario/"><i className="ti ti-book"></i>Manual do usuário</a></li>
                <li><a href="https://contrato.protectrastreamento.com.br/produtos/"><i className="ti ti-device-mobile"></i>Catálogo dos produtos</a></li>
                <li><a href="https://contrato.protectrastreamento.com.br/cadastro" target="_blank" rel="noopener noreferrer"><i className="ti ti-user-plus"></i>Cadastro instalador</a></li>
                <li className="nb-platform-menu-cta"><a href="https://contrato.protectrastreamento.com.br" target="_blank" rel="noopener noreferrer"><i className="ti ti-file-signature"></i>Contratar</a></li>
              </ul>
            </div>
          </div>

          <button className="nb-hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false">
            <i className="ti ti-menu-2" id="ham-icon"></i>
          </button>
        </div>

        <div className="nb-main">
          <nav className="nb-desktop-nav" aria-label="Menu principal">
            <div className="nd-item">
              <a href="https://protectrastreamento.com.br/" className="nd-link">Início</a>
            </div>
            <div className="nd-item">
              <a href="https://protectrastreamento.com.br/quem-somos/" className="nd-link">Quem somos</a>
            </div>
            <div className="nd-item">
              <span className="nd-link" tabIndex={0}>Rastreamento <i className="ti ti-chevron-down"></i></span>
              <ul className="nd-dropdown">
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-frotas/"><i className="ti ti-truck"></i>Frotas</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-veiculos/"><i className="ti ti-car"></i>Veículos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos/"><i className="ti ti-tool"></i>Equipamentos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-agro/"><i className="ti ti-plant"></i>Equipamentos Agro</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-animais/"><i className="ti ti-paw"></i>Animais</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-embarcacoes/"><i className="ti ti-anchor"></i>Embarcação</a></li>
                <li className="nd-has-sub">
                  <a href="https://protectrastreamento.com.br/rastreamento-de-pessoas/">
                    <i className="ti ti-user"></i>Pessoas <i className="ti ti-chevron-right"></i>
                  </a>
                  <ul className="nd-sub-dropdown">
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-pessoas/"><i className="ti ti-walk"></i>Idosos</a></li>
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-criancas/"><i className="ti ti-baby-carriage"></i>Crianças</a></li>
                  </ul>
                </li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-para-bikes/"><i className="ti ti-bike"></i>Bikes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-aventuras/"><i className="ti ti-mountain"></i>Aventuras</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-mineracao/"><i className="ti ti-hammer"></i>Mineração</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-concretagem/"><i className="ti ti-building"></i>Concretagem</a></li>
                <li><a href="https://protectrastreamento.com.br/video-monitoramento/"><i className="ti ti-video"></i>Vídeo Monitoramento</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-satelital/"><i className="ti ti-satellite"></i>Rastreamento Satelital</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-armas-e-coletes/"><i className="ti ti-shield"></i>Armas e Coletes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-cofres-e-outros/"><i className="ti ti-lock"></i>Cofres e Outros</a></li>
              </ul>
            </div>
            <div className="nd-item">
              <span className="nd-link" tabIndex={0}>Parceiros <i className="ti ti-chevron-down"></i></span>
              <ul className="nd-dropdown">
                <li><a href="https://protectrastreamento.com.br/fornecedores/"><i className="ti ti-box"></i>Fornecedores</a></li>
                <li><a href="https://protectrastreamento.com.br/instaladores/"><i className="ti ti-tool"></i>Instaladores</a></li>
                <li><a href="https://contrato.protectrastreamento.com.br/produtos/"><i className="ti ti-device-mobile"></i>Produtos</a></li>
                <li><a href="https://protectrastreamento.com.br/politica-de-privacidade/"><i className="ti ti-file-text"></i>Política de privacidade</a></li>
              </ul>
            </div>
            <div className="nd-item">
              <span className="nd-link" tabIndex={0}>Clientes <i className="ti ti-chevron-down"></i></span>
              <ul className="nd-dropdown">
                <li><a href="https://protectrastreamento.com.br/como-funciona/"><i className="ti ti-info-circle"></i>Como funciona</a></li>
                <li><a target="_blank" href="https://contrato.protectrastreamento.com.br" rel="noopener noreferrer"><i className="ti ti-check"></i>Contratar</a></li>
                <li><a href="https://protectrastreamento.com.br/manual-do-usuario/"><i className="ti ti-book"></i>Manual do usuário</a></li>
                <li><a href="https://protectrastreamento.softruck.com/access/login"><i className="ti ti-map-search"></i>Localize seu veículo</a></li>
              </ul>
            </div>
            <div className="nd-item">
              <a href="https://protectrastreamento.com.br/blog/" className="nd-link">Blog</a>
            </div>
            <div className="nd-item">
              <a href="https://protectrastreamento.com.br/contato/" className="nd-link">Fale conosco</a>
            </div>
          </nav>
        </div>

        <div className="nb-drawer" id="drawer">
          <div className="nb-lang-bar">
            <span>Idioma</span>
            <a href="#" onClick={langHandler("pt")} className="nb-lang-active">
              <img src="https://flagcdn.com/w40/br.png" alt="BR" /> PT
            </a>
            <a href="#" onClick={langHandler("en")}>
              <img src="https://flagcdn.com/w40/us.png" alt="US" /> EN
            </a>
            <a href="#" onClick={langHandler("es")}>
              <img src="https://flagcdn.com/w40/es.png" alt="ES" /> ES
            </a>
          </div>

          <ul className="nb-menu">
            <li><a href="https://protectrastreamento.com.br/" className="nb-item"><span><i className="ti ti-home nb-icon-left"></i>Início</span></a></li>
            <li><a href="https://protectrastreamento.com.br/quem-somos/" className="nb-item"><span><i className="ti ti-users nb-icon-left"></i>Quem somos</span></a></li>
            <li>
              <div className="nb-item" id="toggle-rast">
                <span><i className="ti ti-map-pin nb-icon-left"></i>Rastreamento</span>
                <i className="ti ti-chevron-down"></i>
              </div>
              <ul className="nb-sub" id="sub-rast">
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-frotas/"><i className="ti ti-truck"></i>Frotas</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-veiculos/"><i className="ti ti-car"></i>Veículos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos/"><i className="ti ti-tool"></i>Equipamentos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-agro/"><i className="ti ti-plant"></i>Equipamentos Agro</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-animais/"><i className="ti ti-paw"></i>Animais</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-embarcacao/"><i className="ti ti-anchor"></i>Embarcação</a></li>
                <li>
                  <div className="nb-item-sub" id="toggle-pessoas">
                    <span><i className="ti ti-user"></i>Pessoas</span>
                    <i className="ti ti-chevron-down"></i>
                  </div>
                  <ul className="nb-sub nb-sub-nested" id="sub-pessoas">
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-pessoas/"><i className="ti ti-walk"></i>Idosos</a></li>
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-criancas/"><i className="ti ti-baby-carriage"></i>Crianças</a></li>
                  </ul>
                </li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-para-bikes/"><i className="ti ti-bike"></i>Bikes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-aventuras/"><i className="ti ti-mountain"></i>Aventuras</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-mineracao/"><i className="ti ti-hammer"></i>Mineração</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-concretagem/"><i className="ti ti-building"></i>Concretagem</a></li>
                <li><a href="https://protectrastreamento.com.br/video-monitoramento/"><i className="ti ti-video"></i>Vídeo Monitoramento</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-satelital/"><i className="ti ti-satellite"></i>Rastreamento Satelital</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-armas-e-coletes/"><i className="ti ti-shield"></i>Armas e Coletes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-cofres-e-outros/"><i className="ti ti-lock"></i>Cofres e Outros</a></li>
              </ul>
            </li>
            <li>
              <div className="nb-item" id="toggle-parc">
                <span><i className="ti ti-handshake nb-icon-left"></i>Parceiros</span>
                <i className="ti ti-chevron-down"></i>
              </div>
              <ul className="nb-sub" id="sub-parc">
                <li><a href="https://protectrastreamento.com.br/fornecedores/"><i className="ti ti-box"></i>Fornecedores</a></li>
                <li><a href="https://protectrastreamento.com.br/instaladores/"><i className="ti ti-tool"></i>Instaladores</a></li>
                <li><a href="https://protectrastreamento.com.br/produtos/"><i className="ti ti-device-mobile"></i>Produtos</a></li>
                <li><a href="https://protectrastreamento.com.br/politica-de-privacidade/"><i className="ti ti-file-text"></i>Política de privacidade</a></li>
              </ul>
            </li>
            <li>
              <div className="nb-item" id="toggle-cli">
                <span><i className="ti ti-user-circle nb-icon-left"></i>Clientes</span>
                <i className="ti ti-chevron-down"></i>
              </div>
              <ul className="nb-sub" id="sub-cli">
                <li><a href="https://protectrastreamento.com.br/como-funciona/"><i className="ti ti-info-circle"></i>Como funciona</a></li>
                <li><a target="_blank" href="https://contrato.protectrastreamento.com.br/" rel="noopener noreferrer"><i className="ti ti-check"></i>Contratar</a></li>
                <li><a href="https://protectrastreamento.com.br/manual-do-usuario/"><i className="ti ti-book"></i>Manual do usuário</a></li>
                <li><a href="https://protectrastreamento.softruck.com/access/login"><i className="ti ti-map-search"></i>Localize seu veículo</a></li>
              </ul>
            </li>
            <li><a href="https://protectrastreamento.com.br/blog/" className="nb-item"><span><i className="ti ti-article nb-icon-left"></i>Blog</span></a></li>
            <li><a href="https://protectrastreamento.com.br/contato/" className="nb-item"><span><i className="ti ti-message nb-icon-left"></i>Fale conosco</span></a></li>
          </ul>

          <div className="nb-platform-mobile-wrap">
            <div className="nb-platform-btn-mobile" id="toggle-platform-mobile">
              <span className="nb-platform-btn-mobile-label">
                <i className="ti ti-user-circle" aria-hidden="true"></i>
                Área de Clientes
              </span>
              <i className="ti ti-chevron-down" aria-hidden="true"></i>
            </div>
            <ul className="nb-sub" id="sub-platform-mobile">
              <li><a href="https://protectrastreamento.softruck.com/" target="_blank" rel="noopener noreferrer"><i className="ti ti-login"></i>Acesso plataforma</a></li>
              <li><a href="https://protectrastreamento.com.br/2-via-de-boleto/"><i className="ti ti-receipt"></i>2ª via boleto</a></li>
              <li><a href="https://protectrastreamento.com.br/manual-do-usuario/"><i className="ti ti-book"></i>Manual do usuário</a></li>
              <li><a href="https://contrato.protectrastreamento.com.br/produtos/"><i className="ti ti-device-mobile"></i>Catálogo dos produtos</a></li>
              <li><a href="https://contrato.protectrastreamento.com.br/cadastro" target="_blank" rel="noopener noreferrer"><i className="ti ti-user-plus"></i>Cadastro instalador</a></li>
              <li className="nb-sub-cta"><a href="https://contrato.protectrastreamento.com.br" target="_blank" rel="noopener noreferrer"><i className="ti ti-file-signature"></i>Contratar</a></li>
            </ul>
          </div>

          <div className="nb-footer-strip">
            <a href="https://api.whatsapp.com/send?phone=553133718600"><i className="ti ti-phone"></i>+55 (31) 3371-8600</a>
            <a href="mailto:info@protectrastreamento.com"><i className="ti ti-mail"></i>info@protectrastreamento.com</a>
          </div>
        </div>
      </div>
    </>
  );
}
