"use client";
/* ============================================================
   SIM CARD M2M
   Fonte: DM Sans | Paleta: Preto #1a1a1a / Dourado #F5C000 / Branco
   Interativo — seleciona operadoras e solicita via WhatsApp.
   ============================================================ */

import { useState } from "react";

interface SimBrand {
  name: string;
  logo: string;
}

const OPERADORAS: SimBrand[] = [
  { name: "Vivo", logo: "/logos/logo-vivo.png" },
  { name: "Claro", logo: "/logos/logo-claro.png" },
  { name: "TIM", logo: "/logos/logo-tim.png" },
];

const MULTIOPERADORAS: SimBrand[] = [
  { name: "ARQIA", logo: "/logos/logo-arquia.png" },
  { name: "Algar", logo: "/logos/logo-algar.png" },
  { name: "VIRTUEYES", logo: "/logos/logo-virtueyes.png" },
];

const WHATSAPP_NUMBER = "553133718600";
const SIM_IMAGE =
  "https://protectrastreamento.com.br/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-23-at-14.19.00-e1761251572170.webp";

function BrandTile({
  brand,
  selected,
  onToggle,
}: {
  brand: SimBrand;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${selected ? "Remover" : "Selecionar"} ${brand.name}`}
      className={[
        "group relative flex flex-col items-center justify-center gap-3",
        "min-h-[96px] px-3 py-4 w-full",
        "border rounded-2xl cursor-pointer font-['DM_Sans',sans-serif]",
        "outline-none transition-all duration-200 ease-out",
        "hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-[#F5C000] focus-visible:ring-offset-2",
        selected
          ? "border-[#F5C000] bg-[rgba(245,192,0,0.1)] shadow-[0_10px_24px_-16px_rgba(245,192,0,0.85)]"
          : "border-[#e8e8e8] bg-[#fafafa] hover:border-[#F5C000]/70 hover:bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full",
          "border transition-all duration-200",
          selected
            ? "border-[#F5C000] bg-[#F5C000] scale-100 opacity-100"
            : "border-[#d0d0d0] bg-white scale-90 opacity-70 group-hover:opacity-100 group-hover:scale-100",
        ].join(" ")}
        aria-hidden
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path
            d="M2.5 6.2l2.2 2.2L9.5 3.5"
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={selected ? "opacity-100" : "opacity-0"}
          />
        </svg>
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo}
        alt=""
        className="h-7 w-auto max-w-[88px] object-contain block"
      />
      <span className="text-[12px] font-bold text-[#1a1a1a] tracking-wide">{brand.name}</span>
    </button>
  );
}

function BrandGroup({
  title,
  description,
  brands,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  brands: SimBrand[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[15px] font-extrabold text-[#1a1a1a] m-0 tracking-wide">{title}</h3>
        <p className="mt-1 text-[13px] text-[#6a6a6a] leading-snug m-0">{description}</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 max-[480px]:grid-cols-1 max-[480px]:gap-2">
        {brands.map((brand) => (
          <BrandTile
            key={brand.name}
            brand={brand}
            selected={selected.has(brand.name)}
            onToggle={() => onToggle(brand.name)}
          />
        ))}
      </div>
    </div>
  );
}

export default function SimCardM2M() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const hasSelection = selected.size > 0;
  const selectedNames = [...selected];

  const whatsappUrl = (() => {
    if (!hasSelection) return "#";
    const msg = `Olá, vim pelo site e tenho interesse nos Sim Cards M2M das operadoras: ${selectedNames.join(", ")}. Gostaria de mais informações!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  })();

  const clearSelection = () => setSelected(new Set());

  return (
    <section className="w-full font-['DM_Sans',sans-serif] pt-10 pb-2 box-border">
      <header className="text-center mb-7">
        <h2 className="m-0 text-[26px] font-extrabold text-[#1a1a1a] tracking-tight">
          Sim Card <span className="text-[#c89400]">M2M</span>
        </h2>
        <p className="mt-2 mb-0 text-[14.5px] text-[#5a5a5a] leading-relaxed">
          Selecione as operadoras e envie o pedido direto no WhatsApp.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-stretch overflow-hidden rounded-[20px] border border-[#ececec] bg-white">
        {/* Visual — foto limpa, sem texto por cima */}
        <div className="relative min-h-[240px] lg:min-h-[480px] overflow-hidden bg-[#111]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out hover:scale-105"
            style={{ backgroundImage: `url('${SIM_IMAGE}')` }}
          />
        </div>

        {/* Seleção */}
        <div
          className="flex flex-col gap-7"
          style={{ padding: "32px 32px 40px" }}
        >
          <BrandGroup
            title="Operadoras"
            description="Chips M2M Vivo, Claro e TIM."
            brands={OPERADORAS}
            selected={selected}
            onToggle={toggle}
          />

          <div className="h-px w-full bg-[#ececec]" />

          <BrandGroup
            title="Multioperadoras"
            description="Chips M2M Arqia, Algar e Virtueyes."
            brands={MULTIOPERADORAS}
            selected={selected}
            onToggle={toggle}
          />

          <div className="mt-auto" style={{ paddingTop: 28 }}>
            <div
              className="flex items-center justify-between gap-4"
              style={{ marginBottom: 16, minHeight: 32 }}
            >
              <p className="m-0 text-[13px] font-medium text-[#7a7a7a] tabular-nums">
                {hasSelection
                  ? `${selected.size} ${selected.size === 1 ? "operadora selecionada" : "operadoras selecionadas"}`
                  : "Nenhuma operadora selecionada"}
              </p>
              {hasSelection && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="shrink-0 bg-transparent border-0 text-[13px] font-bold underline text-[#7a7a7a] cursor-pointer hover:text-[#1a1a1a] transition-colors"
                  style={{ padding: "6px 4px" }}
                >
                  Limpar
                </button>
              )}
            </div>

            <a
              href={whatsappUrl}
              target={hasSelection ? "_blank" : undefined}
              rel={hasSelection ? "noopener noreferrer" : undefined}
              aria-disabled={!hasSelection}
              tabIndex={hasSelection ? 0 : -1}
              onClick={(e) => {
                if (!hasSelection) e.preventDefault();
              }}
              className={[
                "flex w-full items-center justify-center gap-3",
                "rounded-2xl no-underline font-extrabold text-[15px] tracking-wide",
                "transition-[background-color,box-shadow,color] duration-300 ease-out",
                hasSelection
                  ? "bg-[#25d366] text-white shadow-[0_10px_28px_-10px_rgba(37,211,102,0.55)] hover:bg-[#1ebe5a] cursor-pointer"
                  : "bg-[#efefef] text-[#9a9a9a] cursor-not-allowed",
              ].join(" ")}
              style={{ minHeight: 58, padding: "18px 24px" }}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Solicitar via WhatsApp</span>
              {hasSelection && (
                <span className="inline-flex min-w-[28px] items-center justify-center rounded-md bg-white/20 px-2 py-0.5 text-[12px] font-extrabold tabular-nums text-white">
                  {selected.size}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
