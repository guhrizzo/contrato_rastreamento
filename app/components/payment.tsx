"use client";

/* ============================================================
   FORMAS DE PAGAMENTO
   Ícones oficiais das bandeiras via CDN (jsDelivr + GitHub,
   pacote aaronfagan/svg-credit-card-payment-icons, licença
   Apache-2.0 — livre para uso comercial).
   ============================================================ */

interface PaymentBrand {
  name: string;
  icon: string;
}

const BRANDS: PaymentBrand[] = [
  { name: "Visa", icon: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/logo/visa.svg" },
  { name: "Mastercard", icon: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/logo/mastercard.svg" },
  { name: "American Express", icon: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/logo/amex.svg" },
  { name: "Diners Club", icon: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/logo/diners.svg" },
  { name: "Elo", icon: "https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@main/logo/elo.svg" },
];

interface PaymentMethodsProps {
  title?: string;
  onEdit?: () => void;
}

export default function PaymentMethods({ title = "Formas de pagamento", onEdit }: PaymentMethodsProps) {
  return (
    <div className="pm-wrap">
      <div className="pm-header">
        <span className="pm-title ">{title}</span>
        {onEdit && (
          <button type="button" className="pm-edit" onClick={onEdit} aria-label="Editar formas de pagamento">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        )}
      </div>

      <div className="pm-icons">
        {BRANDS.map((brand) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={brand.name} src={brand.icon} alt={brand.name} title={brand.name} className="pm-icon" loading="lazy" />
        ))}
      </div>

      <style jsx>{`
        .pm-wrap {
          width: 100%;
          background: #fff;
          border: 1px solid #e2e4ea;
          border-radius: 10px;
          overflow: hidden;
          font-family: "Inter", sans-serif;
        }

        .pm-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 18px;
          border-bottom: 1px solid #e2e4ea;
          position: relative;
        }
        .pm-title {
          font-family: "DM Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1c20;
        }
        .pm-edit {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #7a7d88;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          position: absolute;
          right: 18px;
        }
        .pm-edit:hover {
          background: #f5c40018;
          color: #c9a000;
        }
        .pm-edit svg {
          width: 16px;
          height: 16px;
        }

        .pm-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 28px;
          padding: 28px 20px;
        }
        .pm-icon {
          height: 34px;
          width: auto;
          object-fit: contain;
        }

        @media (max-width: 480px) {
          .pm-icons {
            gap: 18px;
            padding: 22px 16px;
          }
          .pm-icon {
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}