/**
 * Máscaras de formatação para campos de documento/contato brasileiros.
 * Todas as funções recebem o valor bruto digitado e devolvem o texto já
 * formatado, descartando caracteres inválidos. São idempotentes: aplicar de
 * novo sobre um valor já formatado devolve o mesmo resultado.
 */

const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/** CPF: 000.000.000-00 */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** CNPJ: 00.000.000/0000-00 */
export function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/** Decide entre CPF e CNPJ pelo número de dígitos (até 11 = CPF). */
export function formatCpfCnpj(value: string): string {
  const d = onlyDigits(value);
  return d.length <= 11 ? formatCpf(d) : formatCnpj(d);
}

/**
 * RG / CNH. A CNH tem 11 dígitos numéricos; o RG varia por estado, mas o
 * formato mais comum é 00.000.000-0 (o último caractere pode ser "X").
 * Até 9 caracteres aplica a máscara de RG; acima disso (CNH) mantém só dígitos.
 */
export function formatRgCnh(value: string): string {
  const raw = value.toUpperCase().replace(/[^\dX]/g, "");
  if (raw.length > 9) return raw.replace(/\D/g, "").slice(0, 11);
  return raw
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})([\dX])/, "$1.$2.$3-$4");
}

/** RG apenas: 00.000.000-0 */
export function formatRg(value: string): string {
  const raw = value.toUpperCase().replace(/[^\dX]/g, "").slice(0, 10);
  return raw
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})([\dX])/, "$1.$2.$3-$4");
}

/** Telefone/WhatsApp: (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular) */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^\((\d{2})\)\s(\d{4})(\d)/, "($1) $2-$3");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^\((\d{2})\)\s(\d{5})(\d)/, "($1) $2-$3");
}

/** CEP: 00000-000 */
export function formatCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}
