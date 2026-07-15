"use client";

import { useEffect } from "react";
import Head from "next/head";

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

    // Toggle submenus
    const toggles = [
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
            if (s.id !== sid && s.classList.contains("open") && s.id !== "sub-pessoas") {
              s.classList.remove("open");
              const t = document.querySelector("#toggle-" + s.id.replace("sub-", ""));
              if (t) t.classList.remove("active");
            }
          });
        });
      }
    });

    // Pessoas submenu
    const togglePessoas = document.getElementById("toggle-pessoas");
    const subPessoas = document.getElementById("sub-pessoas");
    if (togglePessoas && subPessoas) {
      togglePessoas.addEventListener("click", function (e) {
        e.stopPropagation();
        const isOpen = subPessoas.classList.toggle("open");
        this.classList.toggle("active", isOpen);
      });
    }

    // Google Translate Logic
    function nbHideBar() {
      document.querySelectorAll(".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd").forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      });
      document.body.style.setProperty("top", "0px", "important");
    }

    const nbBarObserver = new MutationObserver(nbHideBar);
    nbBarObserver.observe(document.body, { childList: true, subtree: false });

    // Initial Google Translate Setup
    if (!document.getElementById("nb-gt-element")) {
      const div = document.createElement("div");
      div.id = "nb-gt-element";
      div.style.cssText = "position:absolute;visibility:hidden;height:0;overflow:hidden;";
      document.body.appendChild(div);

      (window as any).googleTranslateElementInit2 = function () {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "pt",
            includedLanguages: "en,es,pt",
            autoDisplay: false,
            gaTrack: false,
          },
          "nb-gt-element"
        );
      };

      if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
        const s = document.createElement("script");
        s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2";
        s.async = true;
        document.head.appendChild(s);
      }
    }

    // Hover logic setup
    function setupHoverGroup(triggerEl: HTMLElement | null, panelEl: HTMLElement | null, openClassTarget: HTMLElement | null) {
      if (!triggerEl || !panelEl || !openClassTarget) return;
      let closeTimer: NodeJS.Timeout | null = null;
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
      setupHoverGroup(item as HTMLElement, item.querySelector(":scope > .nd-dropdown") as HTMLElement, item as HTMLElement);
    });
    document.querySelectorAll(".nd-dropdown li.nd-has-sub").forEach((li) => {
      setupHoverGroup(li as HTMLElement, li.querySelector(":scope > .nd-sub-dropdown") as HTMLElement, li as HTMLElement);
    });
    setupHoverGroup(
      document.querySelector(".nb-platform-btn"),
      document.querySelector(".nb-platform-menu"),
      document.querySelector(".nb-platform-dropdown")
    );
  }, []);

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd, #goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame, .goog-te-menu-frame { display: none !important; visibility: hidden !important; }
        body { top: 0 !important; position: static !important; }
        .nb-root { overflow: visible !important; font-family: 'Inter', sans-serif; background: #fff; width: 100%; position: relative; z-index:100000; }
        .nb-topbar { background: #f7f7f7; padding: 12px 24px; display: flex; align-items: center; border-bottom: 1px solid #e8e8e8; gap: 20px; position: relative; }
        .nb-logo-link { display: block; flex-shrink: 0; }
        .nb-socials { display: flex; gap: 8px; align-items: center; }
        .nb-socials a { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #1a1a1a; color: #ffb703; font-size: 17px; text-decoration: none; transition: background .2s, transform .15s; }
        .nb-socials a:hover { background: #ffb703; color: #111; transform: translateY(-2px); }
        .nb-topbar-right { display: flex; align-items: center; gap: 16px; margin-left: auto; }
        .nb-platform-dropdown { position: relative; }
        .nb-platform-btn { display: inline-flex; align-items: center; gap: 6px; background: #ffb703; color: #111; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; padding: 12px 16px; border-radius: 6px; text-decoration: none; letter-spacing: .3px; transition: background .2s; white-space: nowrap; cursor: pointer; user-select: none; }
        .nb-platform-btn i { font-size: 16px; }
        .nb-platform-btn i.ti-chevron-down { font-size: 13px; margin-left: 2px; transition: transform .2s; }
        .nb-platform-dropdown:hover .nb-platform-btn, .nb-platform-dropdown:focus-within .nb-platform-btn, .nb-platform-dropdown.nd-open .nb-platform-btn { background: #e0a800; color: #fff; }
        .nb-platform-dropdown:hover .nb-platform-btn i.ti-chevron-down, .nb-platform-dropdown:focus-within .nb-platform-btn i.ti-chevron-down, .nb-platform-dropdown.nd-open .nb-platform-btn i.ti-chevron-down { transform: rotate(180deg); }
        .nb-platform-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #fff; border: 1px solid #eee; border-top: 3px solid #F5C000; border-radius: 10px; min-width: 250px; box-shadow: 0 10px 28px rgba(0,0,0,0.14); opacity: 0; pointer-events: none; transform: translateY(6px); transition: opacity .18s ease, transform .18s ease; z-index: 99999; list-style: none; padding: 8px; }
        .nb-platform-dropdown:hover .nb-platform-menu, .nb-platform-dropdown:focus-within .nb-platform-menu, .nb-platform-dropdown.nd-open .nb-platform-menu { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .nb-platform-menu li + li { margin-top: 4px; }
        .nb-platform-menu li a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #444; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500; text-decoration: none; transition: background .15s, color .15s; }
        .nb-platform-menu li a i { font-size: 15px; color: #F5C000; flex-shrink: 0; }
        .nb-platform-menu li a:hover { background: #fffbea; color: #c99a00; }
        .nb-platform-menu li.nb-platform-menu-cta { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0; }
        .nb-platform-menu li.nb-platform-menu-cta a { background: #ffb703; color: #111; font-weight: 700; justify-content: center; }
        .nb-platform-menu li.nb-platform-menu-cta a i { color: #111; }
        .nb-platform-menu li.nb-platform-menu-cta a:hover { background: #e0a800; color: #fff; }
        .nb-platform-menu li.nb-platform-menu-cta a:hover i { color: #fff; }
        .nb-platform-btn-mobile { display: none; align-items: center; justify-content: space-between; gap: 8px; padding: 13px 16px; background: #ffb703; color: #111; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; border-radius: 8px; text-decoration: none; transition: background .2s; cursor: pointer; user-select: none; }
        .nb-platform-btn-mobile:hover { background: #e0a800; }
        .nb-platform-btn-mobile-label { display: flex; align-items: center; gap: 8px; }
        .nb-platform-btn-mobile i.ti-user-circle { font-size: 18px; }
        .nb-platform-btn-mobile i.ti-chevron-down { font-size: 14px; transition: transform .25s; }
        .nb-platform-btn-mobile.active { border-radius: 8px 8px 0 0; }
        .nb-platform-btn-mobile.active i.ti-chevron-down { transform: rotate(180deg); }
        .nb-platform-mobile-wrap { margin: 12px 20px; }
        #sub-platform-mobile { border-radius: 0 0 8px 8px; overflow: hidden; }
        #sub-platform-mobile li a { padding-left: 20px; }
        #sub-platform-mobile li.nb-sub-cta a { background: #ffb703; color: #111; font-weight: 700; }
        #sub-platform-mobile li.nb-sub-cta a i { color: #111; }
        #sub-platform-mobile li.nb-sub-cta a:hover { background: #e0a800; color: #fff; }
        .nb-hamburger { background: none; border: 1px solid #ddd; border-radius: 8px; width: 40px; height: 40px; display: none; align-items: center; justify-content: center; cursor: pointer; color: #333; font-size: 20px; transition: border-color .2s, background .2s; flex-shrink: 0; position: absolute; right: 24px; top: 50%; transform: translateY(-50%); }
        .nb-hamburger:hover { border-color: #c99a00; background: #fafafa; }
        .nb-main { overflow: visible !important; background: #fff; padding: 14px 24px 18px; display: flex; flex-direction: column; align-items: stretch; gap: 14px; border-bottom: 1px solid #ebebeb; position: relative; }
        .nb-desktop-nav { display: flex; align-items: center; justify-content: center; width: 100%; background: #1a1a1a; gap: 32px; border-radius: 50px; padding: 6px 12px; }
        .nb-desktop-nav .nd-item { position: relative; align-self: stretch; display: flex; align-items: center; padding-bottom: 6px; margin-bottom: -6px; }
        .nb-desktop-nav .nd-link { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 12px 10px; height: 100%; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; text-decoration: none; white-space: nowrap; cursor: pointer; border-radius: 30px; border-bottom: none; transition: color .2s; user-select: none; }
        .nb-desktop-nav .nd-link i.ti-chevron-down { font-size: 11px; color: #999; transition: transform .2s, color .2s; }
        .nb-desktop-nav .nd-item:hover > .nd-link, .nb-desktop-nav .nd-item:focus-within > .nd-link, .nb-desktop-nav .nd-item.nd-open > .nd-link { color: #F5C000; background: transparent; }
        .nb-desktop-nav .nd-item:hover > .nd-link i.ti-chevron-down, .nb-desktop-nav .nd-item:focus-within > .nd-link i.ti-chevron-down, .nb-desktop-nav .nd-item.nd-open > .nd-link i.ti-chevron-down { transform: rotate(180deg); color: #F5C000; }
        .nd-dropdown { position: absolute; top: 100%; left: 0; background: #1a1a1a; border: 1px solid #333; border-top: 2px solid #F5C000; border-radius: 0 0 12px 12px; min-width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); opacity: 0; pointer-events: none; transform: translateY(6px); transition: opacity .18s ease, transform .18s ease; z-index:99999; list-style: none; padding: 6px 0; margin-top:0; }
        .nb-desktop-nav .nd-item:hover > .nd-dropdown, .nb-desktop-nav .nd-item:focus-within > .nd-dropdown, .nb-desktop-nav .nd-item.nd-open > .nd-dropdown { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .nd-dropdown li a { display: flex; align-items: center; gap: 10px; padding: 10px 18px; color: #eee; font-family: 'Inter', sans-serif; font-size: 13px; text-decoration: none; transition: color .15s, background .15s, padding-left .15s; border-bottom: 1px solid #2a2a2a; }
        .nd-dropdown li:last-child a { border-bottom: none; }
        .nd-dropdown li a:hover { color: #F5C000; background: #262626; padding-left: 22px; }
        .nd-dropdown li a i { font-size: 14px; color: #F5C000; opacity: .9; flex-shrink: 0; }
        .nd-dropdown li.nd-has-sub { position: relative; }
        .nd-dropdown li.nd-has-sub > a i.ti-chevron-right { font-size: 11px; color: #666; margin-left: auto; padding-left: 8px; }
        .nd-sub-dropdown { position: absolute; top: -1px; left: 100%; background: #1a1a1a; border: 1px solid #333; border-top: 2px solid #F5C000; border-radius: 0 12px 12px 12px; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); opacity: 0; pointer-events: none; transform: translateX(6px); transition: opacity .18s ease, transform .18s ease; z-index:100000; list-style: none; padding: 6px 0; }
        .nd-dropdown li.nd-has-sub:hover > .nd-sub-dropdown, .nd-dropdown li.nd-has-sub:focus-within > .nd-sub-dropdown, .nd-dropdown li.nd-has-sub.nd-open > .nd-sub-dropdown { opacity: 1; pointer-events: auto; transform: translateX(0); }
        .nd-lang-desktop { display: flex; align-items: center; gap: 6px; }
        .nd-lang-desktop a { display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; border: 1px solid transparent; text-decoration: none; transition: all .2s; }
        .nd-lang-desktop a img { width: 22px; height: auto; display: block; border-radius: 2px; }
        .nd-lang-desktop a:hover { border-color: #e6c800; background: #fffbea; }
        .nd-lang-desktop a.nd-lang-active { border-color: #F5C000; background: #fffbea; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .nb-drawer { background: #fff; border-top: 1px solid #ebebeb; max-height: 0; overflow: hidden; transition: max-height .35s cubic-bezier(.4,0,.2,1); }
        .nb-drawer.open { max-height: 900px; overflow-y: auto; }
        .nb-lang-bar { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: #fafafa; border-bottom: 2px solid #f0f0f0; }
        .nb-lang-bar span { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
        .nb-lang-bar a { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; border: 1.5px solid #eee; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #555; transition: all .2s; background: #fff; }
        .nb-lang-bar a img { width: 20px; height: auto; display: block; border-radius: 2px; }
        .nb-lang-bar a:hover { border-color: #c99a00; color: #c99a00; background: #fefaf0; }
        .nb-lang-bar a.nb-lang-active { border-color: #F5C000; color: #111; background: #fffbea; }
        .nb-menu { list-style: none; padding: 6px 0 12px; }
        .nb-menu > li { border-bottom: 1px solid #f0f0f0; }
        .nb-menu > li:last-child { border-bottom: none; }
        .nb-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; color: #333; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; text-decoration: none; cursor: pointer; transition: color .2s, background .2s; user-select: none; }
        .nb-item:hover, .nb-item.active { color: #c99a00; background: #fefaf0; }
        .nb-item i.ti-chevron-down { font-size: 14px; transition: transform .25s; color: #bbb; }
        .nb-item.active i.ti-chevron-down { transform: rotate(180deg); color: #c99a00; }
        .nb-sub { list-style: none; background: #fafafa; max-height: 0; overflow: hidden; transition: max-height .3s ease; }
        .nb-sub.open { max-height: 700px; }
        .nb-sub li a { display: flex; align-items: center; gap: 10px; padding: 11px 20px 11px 28px; color: #666; font-family: 'Inter', sans-serif; font-size: 13px; text-decoration: none; transition: color .2s, padding-left .2s; border-bottom: 1px solid #f0f0f0; }
        .nb-sub li:last-child a { border-bottom: none; }
        .nb-sub li a:hover { color: #c99a00; padding-left: 34px; background: #fef9e7; }
        .nb-sub li a i { font-size: 14px; color: #F5C000; opacity: .85; flex-shrink: 0; }
        .nb-item-sub { display: flex; align-items: center; justify-content: space-between; padding: 11px 20px 11px 28px; font-size: 13px; font-weight: 500; color: #666; font-family: 'Inter', sans-serif; cursor: pointer; user-select: none; transition: color .2s, background .2s; border-bottom: 1px solid #f0f0f0; }
        .nb-item-sub:hover, .nb-item-sub.active { color: #c99a00; background: #fef9e7; }
        .nb-item-sub i.ti-user { font-size: 14px; color: #F5C000; opacity: .85; margin-right: 10px; }
        .nb-item-sub i.ti-chevron-down { font-size: 12px; transition: transform .25s; color: #bbb; }
        .nb-item-sub.active i.ti-chevron-down { transform: rotate(180deg); color: #c99a00; }
        .nb-sub-nested { background: #f2f2f2; }
        .nb-sub-nested li a { padding-left: 44px; border-bottom: 1px solid #e8e8e8; }
        .nb-footer-strip { background: #f7f7f7; padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #ebebeb; }
        .nb-footer-strip a { display: flex; align-items: center; gap: 10px; color: #888; font-family: 'Inter', sans-serif; font-size: 13px; text-decoration: none; transition: color .2s; }
        .nb-footer-strip a:hover { color: #c99a00; }
        .nb-footer-strip a i { font-size: 16px; color: #F5C000; opacity: .8; }
        .nb-badge { background: #F5C000; color: #111; font-size: 10px; font-weight: 600; font-family: 'DM Sans', sans-serif; padding: 2px 7px; border-radius: 20px; margin-left: auto; }
        .nb-icon-left { margin-right: 8px; font-size: 15px; vertical-align: -2px; color: #F5C000; opacity: .85; }
        @media (max-width: 1024px) {
          .nb-desktop-nav { display: none; }
          .nb-hamburger { display: flex; }
          .nb-logo-img { height: 50px !important; max-width: 180px !important; }
          .nb-platform-dropdown { display: none; }
          .nb-platform-btn-mobile { display: flex; }
          .nd-lang-desktop { display: none; }
          .nb-socials { display: none; }
        }
        @media (min-width: 1025px) {
          .nb-drawer { display: none !important; }
          .nb-hamburger { display: none; }
          .nb-logo-img { height: 65px !important; max-width: 240px !important; }
        }
      `}</style>

      <div className="nb-root">
        <div className="nb-topbar">
          <a href="https://protectrastreamento.com.br/" className="nb-logo-link">
            <img className="nb-logo-img" src="https://protectrastreamento.com.br/wp-content/uploads/2025/01/Sem-Titulo-1.png" alt="Protect Rastreamento" style={{width:"auto",maxWidth:"100%",objectFit:"contain",display:"block"}} />
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
              <a href="#" onClick={(e) => { e.preventDefault(); /* impl lang switch logic */ }} className="nd-lang-active" title="Português">
                <img src="https://flagcdn.com/w40/br.png" alt="PT" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} title="English">
                <img src="https://flagcdn.com/w40/us.png" alt="EN" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); }} title="Español">
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
                <li><a href="https://protectrastreamento.softruck.com/" target="_blank" rel="noopener noreferrer"><i className="ti ti-login"></i>Acessar plataforma</a></li>
                <li><a href="https://protectrastreamento.com.br/2-via-de-boleto/"><i className="ti ti-receipt"></i>2ª via de boleto</a></li>
                <li><a href="https://contrato.protectrastreamento.com.br/cadastro" target="_blank" rel="noopener noreferrer"><i className="ti ti-user-plus"></i>Cadastro do instalador</a></li>
                <li className="nb-platform-menu-cta"><a href="https://contrato.protectrastreamento.com.br" target="_blank" rel="noopener noreferrer"><i className="ti ti-file-signature"></i>Contrato</a></li>
              </ul>
            </div>
          </div>
          <button className="nb-hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false">
            <i className="ti ti-menu-2" id="ham-icon"></i>
          </button>
        </div>

        <div className="nb-main">
          <nav className="nb-desktop-nav" aria-label="Menu principal">
            <div className="nd-item"><a href="https://protectrastreamento.com.br/" className="nd-link">Início</a></div>
            <div className="nd-item"><a href="https://protectrastreamento.com.br/quem-somos/" className="nd-link">Quem somos</a></div>
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
                <li><a href="https://protectrastreamento.com.br/servicos/"><i className="ti ti-star"></i>Serviços</a></li>
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
            <div className="nd-item"><a href="https://protectrastreamento.com.br/blog/" className="nd-link">Blog</a></div>
            <div className="nd-item"><a href="https://protectrastreamento.com.br/contato/" className="nd-link">Fale conosco</a></div>
          </nav>
        </div>

        <div className="nb-drawer" id="drawer">
          <div className="nb-lang-bar">
            <span>Idioma</span>
            <a href="#" className="nb-lang-active">PT</a>
            <a href="#">EN</a>
            <a href="#">ES</a>
          </div>
          <ul className="nb-menu">
            <li><a href="https://protectrastreamento.com.br/" className="nb-item"><span><i className="ti ti-home nb-icon-left"></i>Início</span></a></li>
            <li><a href="https://protectrastreamento.com.br/quem-somos/" className="nb-item"><span><i className="ti ti-users nb-icon-left"></i>Quem somos</span></a></li>
            <li>
              <div className="nb-item" id="toggle-rast"><span><i className="ti ti-map-pin nb-icon-left"></i>Rastreamento</span><i className="ti ti-chevron-down"></i></div>
              <ul className="nb-sub" id="sub-rast">
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-frotas/"><i className="ti ti-truck"></i>Frotas</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-veiculos/"><i className="ti ti-car"></i>Veículos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos/"><i className="ti ti-tool"></i>Equipamentos</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-agro/"><i className="ti ti-plant"></i>Equipamentos Agro</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-animais/"><i className="ti ti-paw"></i>Animais</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-embarcacao/"><i className="ti ti-anchor"></i>Embarcação</a></li>
                <li>
                  <div className="nb-item-sub" id="toggle-pessoas"><span><i className="ti ti-user"></i>Pessoas</span><i className="ti ti-chevron-down"></i></div>
                  <ul className="nb-sub nb-sub-nested" id="sub-pessoas">
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-pessoas/"><i className="ti ti-walk"></i>Idosos</a></li>
                    <li><a href="https://protectrastreamento.com.br/rastreamento-de-criancas/"><i className="ti ti-baby-carriage"></i>Crianças</a></li>
                  </ul>
                </li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-para-bikes/"><i className="ti ti-bike"></i>Bikes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-aventuras/"><i className="ti ti-mountain"></i>Aventuras</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-mineracao/"><i className="ti ti-hammer"></i>Mineração</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-equipamentos-de-concretagem/"><i className="ti ti-building"></i>Concretagem</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-armas-e-coletes/"><i className="ti ti-shield"></i>Armas e Coletes</a></li>
                <li><a href="https://protectrastreamento.com.br/rastreamento-de-cofres-e-outros/"><i className="ti ti-lock"></i>Cofres e Outros</a></li>
              </ul>
            </li>
            <li>
              <div className="nb-item" id="toggle-parc"><span><i className="ti ti-handshake nb-icon-left"></i>Parceiros</span><i className="ti ti-chevron-down"></i></div>
              <ul className="nb-sub" id="sub-parc">
                <li><a href="https://protectrastreamento.com.br/fornecedores/"><i className="ti ti-box"></i>Fornecedores</a></li>
                <li><a href="https://protectrastreamento.com.br/instaladores/"><i className="ti ti-tool"></i>Instaladores</a></li>
                <li><a href="https://protectrastreamento.com.br/produtos/"><i className="ti ti-device-mobile"></i>Produtos</a></li>
                <li><a href="https://protectrastreamento.com.br/servicos/"><i className="ti ti-star"></i>Serviços</a></li>
                <li><a href="https://protectrastreamento.com.br/politica-de-privacidade/"><i className="ti ti-file-text"></i>Política de privacidade</a></li>
              </ul>
            </li>
            <li>
              <div className="nb-item" id="toggle-cli"><span><i className="ti ti-user-circle nb-icon-left"></i>Clientes</span><i className="ti ti-chevron-down"></i></div>
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
              <span className="nb-platform-btn-mobile-label"><i className="ti ti-user-circle"></i>Área de Clientes</span>
              <i className="ti ti-chevron-down"></i>
            </div>
            <ul className="nb-sub" id="sub-platform-mobile">
              <li><a href="https://protectrastreamento.softruck.com/" target="_blank" rel="noopener noreferrer"><i className="ti ti-login"></i>Acessar plataforma</a></li>
              <li><a href="https://protectrastreamento.com.br/2-via-de-boleto/"><i className="ti ti-receipt"></i>2ª via de boleto</a></li>
              <li><a href="https://contrato.protectrastreamento.com.br/cadastro" target="_blank" rel="noopener noreferrer"><i className="ti ti-user-plus"></i>Cadastro do instalador</a></li>
              <li className="nb-sub-cta"><a href="https://contrato.protectrastreamento.com.br" target="_blank" rel="noopener noreferrer"><i className="ti ti-file-signature"></i>Contrato</a></li>
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
