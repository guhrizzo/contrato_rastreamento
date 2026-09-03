"use client"

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import SignatureCanvas from "./components/SignatureCanvas";
import { sliceCanvasToPdfPages, collectSafeBreakOffsets } from "@/lib/pdfUtils";
import { formatCpfCnpj, formatRgCnh, formatPhone, formatCep } from "@/lib/masks";
import { User, Car, Settings, PenTool, Heart, Printer, FileDown, CheckCircle, AlertCircle, MapPin, Phone, Mail, Building2, IdCard, Zap, DollarSign, Calendar, Hash, X, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, Info, Home as HomeIcon, Repeat, ShoppingCart } from "lucide-react";

interface ContractData {
  // Contratante
  clientName: string;
  clientDoc: string; // CPF ou CNPJ
  clientRg: string; // RG ou CNH
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientNumber: string;
  clientComp: string;
  clientBairro: string;
  clientCity: string;
  clientState: string;
  clientCep: string;

  // Rastreamento/Serviço
  selectedPlan: string;
  serviceType: "comodato" | "venda";
  customPlanPrice: string;
  // Preenchidos apenas quando serviceType === "venda"
  equipmentValue: string;
  equipmentPaymentMethod: string;
  // Preenchidos apenas quando serviceType === "comodato" (contrato de comodato
  // revisado juridicamente). Todos opcionais: se em branco, o PDF sai com uma
  // linha "____" para preenchimento manual.
  equipmentBrandModel: string;   // Marca/Modelo do rastreador
  equipmentImeiSerial: string;   // IMEI / Serial do equipamento
  equipmentChipLine: string;     // Chip / Linha (número da linha do SIM)
  monitoredObject: string;       // Objeto/Pessoa/Bem/Carga/Veículo monitorado
  monitoredObjectId: string;     // Identificação/Placa/Documento do objeto
  replacementValue: string;      // Valor de reposição do equipamento (R$)
  returnDeadlineDays: string;    // Prazo (dias) para devolução após o encerramento
  // Bloco de assinaturas do contrato de comodato (opcionais).
  contratadaRepName: string;     // Representante que assina pela CONTRATADA
  contratadaRepCpf: string;      // CPF do representante da CONTRATADA
  witness1Cpf: string;           // CPF da Testemunha 1
  witness2Cpf: string;           // CPF da Testemunha 2
  dueDate: string;
  // Armazena no formato YYYY-MM-DD (compatível com input type="date")
  contractDate: string;
  contractNumber: string;
}

const FROTA_PLAN_ID = "frota_telemetria";
const FROTA_MIN_PRICE = 89.9;
const SOB_CONSULTA_SEM_MINIMO = ["satelital", "video_monitoramento", "diversos"];

const PLANS = [
  { id: "basico_4g_moto", name: "Rastreamento Básico 4G (Moto) - Mensal", priceText: "R$ 59,90", detailText: "R$ 59,90 mensais", tracker: "Básico 4G (Moto)", billing: "Mensal" },
  { id: "basico_4g_moto_anual", name: "Rastreamento Básico 4G (Moto) - Anual (15% desconto)", priceText: "R$ 610,98", detailText: "R$ 610,98 anuais (15% desconto)", tracker: "Básico 4G (Moto)", billing: "Anual" },
  { id: "basico_4g_carro", name: "Rastreamento Básico 4G (Carro) - Mensal", priceText: "R$ 69,90", detailText: "R$ 69,90 mensais", tracker: "Básico 4G (Carro)", billing: "Mensal" },
  { id: "basico_4g_carro_anual", name: "Rastreamento Básico 4G (Carro) - Anual (15% desconto)", priceText: "R$ 712,92", detailText: "R$ 712,92 anuais (15% desconto)", tracker: "Básico 4G (Carro)", billing: "Anual" },
  { id: "basico_4g_bloqueio", name: "Rastreamento Básico 4G (Com Bloqueio) - Mensal", priceText: "R$ 79,90", detailText: "R$ 79,90 mensais", tracker: "Básico 4G com Bloqueio", billing: "Mensal" },
  { id: "basico_4g_bloqueio_anual", name: "Rastreamento Básico 4G (Com Bloqueio) - Anual (15% desconto)", priceText: "R$ 814,98", detailText: "R$ 814,98 anuais (15% desconto)", tracker: "Básico 4G com Bloqueio", billing: "Anual" },
  { id: "basico_tag_anual", name: "Rastreamento Básico TAG - Anual", priceText: "R$ 399,90", detailText: "R$ 399,90 anuais", tracker: "Básico TAG", billing: "Anual" },
  { id: "basico_tag_mensal", name: "Rastreamento Básico TAG - Mensal", priceText: "R$ 49,90", detailText: "R$ 49,90 mensais", tracker: "Básico TAG", billing: "Mensal" },
  { id: "obd2_4g_mensal", name: "Rastreamento OBD2 4G - Mensal", priceText: "R$ 69,90", detailText: "R$ 69,90 mensais", tracker: "OBD2 4G", billing: "Mensal" },
  { id: "obd2_4g_anual", name: "Rastreamento OBD2 4G - Anual (15% desconto)", priceText: "R$ 712,92", detailText: "R$ 712,92 anuais (15% desconto)", tracker: "OBD2 4G", billing: "Anual" },
  { id: "frota_telemetria", name: "Rastreamento Frota + Telemetria", priceText: "A partir de R$ 89,90 (Preço sob consulta)", detailText: "A partir de R$ 89,90 (preço sob consulta)", tracker: "Frota + Telemetria", billing: "Mensal (sob consulta)" },
  { id: "satelital", name: "Rastreamento Satelital", priceText: "Preço sob consulta", detailText: "Preço sob consulta", tracker: "Satelital", billing: "Sob consulta" },
  { id: "video_monitoramento", name: "Video Monitoramento", priceText: "Preço sob consulta", detailText: "Preço sob consulta", tracker: "Vídeo Monitoramento", billing: "Sob consulta" },
  { id: "diversos", name: "Rastreamento Diversos", priceText: "Preço sob consulta", detailText: "Preço sob consulta", tracker: "Diversos", billing: "Sob consulta" },
];

// ============================================================
// UTILITÁRIOS DE DATA
// ============================================================

/** Converte "YYYY-MM-DD" (valor do input type=date) para "DD/MM/AAAA" (exibição no contrato) */
function isoToBR(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Retorna a data de hoje no formato "YYYY-MM-DD" para o input type=date */
function todayISO(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ============================================================
// NÚMERO POR EXTENSO (suporte até 999.999)
// ============================================================
function numeroParaExtenso(valor: number): string {
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const parteInteira = Math.floor(valor);
  const parteDecimal = Math.round((valor - parteInteira) * 100);

  function menorQue1000(n: number): string {
    if (n === 0) return "";
    if (n < 20) return unidades[n];
    if (n < 100) {
      const dez = Math.floor(n / 10);
      const uni = n % 10;
      return dezenas[dez] + (uni > 0 ? " e " + unidades[uni] : "");
    }
    // 100–999
    const cent = Math.floor(n / 100);
    const rest = n % 100;
    if (n === 100) return "cem";
    if (rest === 0) return centenas[cent];
    return centenas[cent] + " e " + menorQue1000(rest);
  }

  let extensoReais = "";

  if (parteInteira === 0) {
    extensoReais = "";
  } else if (parteInteira < 1000) {
    extensoReais = menorQue1000(parteInteira);
  } else if (parteInteira < 1000000) {
    const milhar = Math.floor(parteInteira / 1000);
    const resto = parteInteira % 1000;
    const milharTexto = milhar === 1 ? "mil" : menorQue1000(milhar) + " mil";
    if (resto > 0) {
      if (resto < 100 || resto % 100 === 0) {
        extensoReais = milharTexto + " e " + menorQue1000(resto);
      } else {
        extensoReais = milharTexto + " " + menorQue1000(resto);
      }
    } else {
      extensoReais = milharTexto;
    }
  } else {
    return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (parteInteira > 0) {
    if (parteInteira === 1) {
      extensoReais += " real";
    } else {
      extensoReais += " reais";
    }
  }

  let extensoCentavos = "";
  if (parteDecimal > 0) {
    extensoCentavos = menorQue1000(parteDecimal);
    if (parteDecimal === 1) {
      extensoCentavos += " centavo";
    } else {
      extensoCentavos += " centavos";
    }
  }

  if (extensoReais !== "" && extensoCentavos !== "") {
    return extensoReais + " e " + extensoCentavos;
  } else if (extensoReais !== "") {
    return extensoReais;
  } else if (extensoCentavos !== "") {
    return extensoCentavos;
  }
  return "zero reais";
}

export default function Home() {
  const [data, setData] = useState<ContractData>({
    clientName: "",
    clientDoc: "",
    clientRg: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    clientNumber: "",
    clientComp: "",
    clientBairro: "",
    clientCity: "",
    clientState: "",
    clientCep: "",
    selectedPlan: "basico_4g_moto",
    serviceType: "comodato",
    customPlanPrice: "",
    equipmentValue: "",
    equipmentPaymentMethod: "",
    equipmentBrandModel: "",
    equipmentImeiSerial: "",
    equipmentChipLine: "",
    monitoredObject: "",
    monitoredObjectId: "",
    replacementValue: "",
    returnDeadlineDays: "",
    contratadaRepName: "",
    contratadaRepCpf: "",
    witness1Cpf: "",
    witness2Cpf: "",
    dueDate: "05",
    // Inicia vazio; o useEffect preenche com hoje em YYYY-MM-DD
    contractDate: "",
    contractNumber: "",
  });

  const [activeTab, setActiveTab] = useState<"client" | "vehicle" | "plan" | "signature">("client");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [contratadaSignatureImage, setContratadaSignatureImage] = useState<string | null>(null);
  const [showPrintBlockDialog, setShowPrintBlockDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);

  // States para responsividade no celular
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [contractHeight, setContractHeight] = useState<number>(1198);
  const contractRef = useRef<HTMLDivElement | null>(null);

  // Painel do formulário retrátil (desktop): permite ver o contrato em tela cheia
  const [panelOpen, setPanelOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("painelAberto:contrato");
    if (saved === "false") setPanelOpen(false);
  }, []);
  useEffect(() => {
    localStorage.setItem("painelAberto:contrato", String(panelOpen));
  }, [panelOpen]);

  // Listener para redimensionamento de janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsPlanDropdownOpen(false);
  }, [activeTab]);

  // Observe o tamanho real da página do contrato para gerenciar o wrap height
  useEffect(() => {
    if (!contractRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContractHeight(entry.target.clientHeight);
      }
    });
    resizeObserver.observe(contractRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 869px = 230mm (largura real da folha em tela; ver .a4-page em globals.css)
  const scale = windowWidth < 869 ? (windowWidth - 32) / 869 : 1;

  // States para envio de email
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const parsePlanPrice = (value: string): number | null => {
    const normalized = value.trim().replace(/[^\d,]/g, "").replace(",", ".");
    if (!normalized) return null;
    const num = parseFloat(normalized);
    return Number.isNaN(num) ? null : num;
  };

  const formatPlanPrice = (num: number): string =>
    num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isFrotaPlanSelected = data.selectedPlan === FROTA_PLAN_ID;
  const isSobConsultaSemMinimo = SOB_CONSULTA_SEM_MINIMO.includes(data.selectedPlan);
  const isCustomPricePlan = isFrotaPlanSelected || isSobConsultaSemMinimo;
  const customPriceValue = parsePlanPrice(data.customPlanPrice);
  // alias para manter compatibilidade
  const frotaPriceValue = customPriceValue;
  const isFrotaPriceValid =
    !isFrotaPlanSelected ||
    (customPriceValue !== null && customPriceValue >= FROTA_MIN_PRICE);
  const isCustomPriceValid =
    !isCustomPricePlan ||
    (isFrotaPlanSelected
      ? customPriceValue !== null && customPriceValue >= FROTA_MIN_PRICE
      : customPriceValue !== null);

  // Função de validação
  const isFormComplete = (): boolean => {
    return (
      data.clientName.trim() !== "" &&
      data.clientDoc.trim() !== "" &&
      data.clientRg.trim() !== "" &&
      data.clientPhone.trim() !== "" &&
      data.clientEmail.trim() !== "" &&
      data.clientAddress.trim() !== "" &&
      data.clientNumber.trim() !== "" &&
      data.clientBairro.trim() !== "" &&
      data.clientCity.trim() !== "" &&
      data.clientState.trim() !== "" &&
      data.clientCep.trim() !== "" &&
      data.selectedPlan.trim() !== "" &&
      isCustomPriceValid &&
      (data.serviceType !== "venda" || data.equipmentValue.trim() !== "") &&
      data.contractDate.trim() !== "" &&
      signatureImage !== null &&
      contratadaSignatureImage !== null
    );
  };

  // BUG FIX: preenche contractDate no formato YYYY-MM-DD (compatível com input type="date")
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      contractDate: prev.contractDate || todayISO(),
    }));
  }, []);

  // ============================================================
  // PROTEÇÃO ROBUSTA CONTRA IMPRESSÃO E CLIQUE DIREITO
  // ============================================================
  useEffect(() => {
    const showBlockDialog = () => {
      setShowPrintBlockDialog(true);
      setTimeout(() => setShowPrintBlockDialog(false), 5000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
      if (e.key === 'F12') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault(); e.stopPropagation(); showBlockDialog(); return;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); e.stopImmediatePropagation(); showBlockDialog(); return false;
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('aside')) { e.preventDefault(); return false; }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#contract-pdf')) { e.preventDefault(); return false; }
    };

    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#contract-pdf')) { e.preventDefault(); return false; }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('cut', handleCut, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('selectstart', handleSelectStart, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('cut', handleCut, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // BUG FIX: clientNumber aceita letras (ex: "S/N", "12A") — removido do filtro numérico
    if (name === "clientDoc" || name === "contratadaRepCpf" || name === "witness1Cpf" || name === "witness2Cpf") {
      filteredValue = formatCpfCnpj(value);
    } else if (name === "clientRg") {
      filteredValue = formatRgCnh(value);
    } else if (name === "clientPhone") {
      filteredValue = formatPhone(value);
    } else if (name === "clientCep") {
      filteredValue = formatCep(value);
    } else if (name === "customPlanPrice" || name === "equipmentValue" || name === "replacementValue") {
      filteredValue = value.replace(/[^\d,]/g, "");
    } else if (name === "returnDeadlineDays") {
      filteredValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
  };

  const handleServiceTypeChange = (serviceType: ContractData["serviceType"]) => {
    setData((prev) => ({ ...prev, serviceType }));
  };

  const handleSignatureSave = (signatureBase64: string) => {
    setSignatureImage(signatureBase64);
  };

  const handleSignatureClear = () => {
    setSignatureImage(null);
  };

  const handleContratadaSignatureSave = (signatureBase64: string) => {
    setContratadaSignatureImage(signatureBase64);
  };

  const handleContratadaSignatureClear = () => {
    setContratadaSignatureImage(null);
  };

  // ============================================================
  // ENVIO DE EMAIL SEGURO VIA BACKEND
  // ============================================================
  const sendContractEmail = async () => {
    if (!isFormComplete()) {
      setEmailError("Preencha todos os campos antes de enviar o contrato.");
      return;
    }

    if (!termsAccepted) {
      setEmailError("Você deve aceitar os termos para enviar o contrato.");
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setEmailSent(false);

    try {
      // Reserva o número do contrato ANTES de gerar o PDF — antes disso o
      // número só existia depois do e-mail já ter sido enviado, então o
      // contrato podia sair sem o número real (Nº em branco).
      let reservedContractNumber: string | null = null;
      try {
        const numResponse = await fetch("/api/reserve-contract-number", { method: "POST" });
        const numData = await numResponse.json();
        if (numResponse.ok && typeof numData.contractNumber === "number") {
          reservedContractNumber = String(numData.contractNumber);
          setData(prev => ({ ...prev, contractNumber: reservedContractNumber as string }));
          // Espera o React re-renderizar o contrato (#contract-pdf) com o
          // número novo antes do html2canvas tirar o "print" dele.
          // Usa setTimeout (não requestAnimationFrame) porque rAF pode
          // nunca disparar se a aba estiver em segundo plano no momento do
          // envio, travando o fluxo indefinidamente.
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (numErr) {
        console.error("Erro ao reservar número do contrato:", numErr);
      }

      // Gera o PDF completo do contrato para anexar ao e-mail. Antes, o
      // contrato inteiro era embutido como HTML no corpo do e-mail — isso
      // costumava sair "cortado" porque o Gmail (e outros clientes) trunca
      // mensagens cujo corpo HTML passa de ~102KB. Um PDF anexado não sofre
      // esse limite.
      const pdf = await generateContractPdf();
      const contractPdfBase64 = pdf.output("datauristring");
      const contractPdfNome = `Contrato_Rastreamento_${data.clientName.trim().replace(/\s+/g, "_") || "Cliente"}.pdf`;

      const response = await fetch("/api/send-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: data.clientEmail,
          clientName: data.clientName,
          contractPdfBase64,
          contractPdfNome,
          contractNumber: reservedContractNumber,
        }),
      });

      const contentType = response.headers.get("content-type");
      let responseData: any = {};

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(textError || `Erro no servidor (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Erro ${response.status} ao enviar email`);
      }

      setEmailSent(true);
      if (responseData.contractNumber) {
        setData(prev => ({ ...prev, contractNumber: String(responseData.contractNumber) }));
      }
      setTermsAccepted(false);
      alert(`Contrato enviado para ${data.clientEmail} com sucesso!`);
    } catch (err) {
      console.error("Erro ao enviar email:", err);
      const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar email";
      setEmailError(message);
      alert(`Erro: ${message}`);
    } finally {
      setEmailSending(false);
    }
  };

  // Seção de aceitação dos termos e envio
  const renderTermsSection = () => (
    <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-md">
      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 leading-normal flex gap-2.5 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Liberação da Impressão e PDF</p>
          <p>A impressão e o download em formato PDF <strong>somente serão liberados</strong> após o envio do contrato por e-mail ser realizado com sucesso.</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex gap-2.5 items-start">
        <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Envio seguro do contrato</p>
          <p>O contrato será enviado como visualização HTML para o email informado.</p>
        </div>
      </div>

      {emailError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="font-semibold">{emailError}</p>
        </div>
      )}

      {emailSent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-900 flex gap-2 items-center">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="font-semibold">Email enviado com sucesso!</p>
        </div>
      )}

      <label className="flex items-start space-x-3 mb-3">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-brand-yellow rounded cursor-pointer"
        />
        <span className="text-xs text-zinc-700 leading-relaxed">
          Li e declaro que os dados estão corretos e autorizo o envio do contrato por email para{" "}
          <strong>{data.clientEmail || "seu email"}</strong>. Acordo em receber comunicações relacionadas ao serviço.
        </span>
      </label>

      <button
        onClick={sendContractEmail}
        disabled={!termsAccepted || emailSending || !isFormComplete()}
        title={
          !isFormComplete()
            ? "Complete todos os campos para enviar"
            : !termsAccepted
              ? "Aceite os termos para enviar"
              : ""
        }
        className="w-full flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-xs rounded-md shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase"
      >
        {emailSending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Enviar por Email
          </>
        )}
      </button>
    </div>
  );

  const handlePrint = () => {
    if (!isFormComplete() || !emailSent) {
      alert("Você precisa preencher todos os campos, assinar e enviar o contrato por e-mail antes de imprimir.");
      return;
    }
    window.print();
  };

  // Gera o PDF completo do contrato (todas as páginas), reaproveitado tanto
  // pelo botão "Salvar PDF" quanto pelo anexo enviado por e-mail.
  const generateContractPdf = async () => {
    const element = document.getElementById("contract-pdf");
    if (!element) throw new Error("Elemento do contrato não encontrado");

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.display = 'block';
    clone.style.width = '794px';
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    // A folha na tela é maior que a A4 real (ver globals.css .a4-page);
    // aqui forçamos o padding original de volta para o PDF exportado
    // continuar em A4 real (210x297mm), sem a margem extra da tela.
    clone.style.padding = '20mm';
    document.body.appendChild(clone);

    try {
      // Mede, ainda com o clone no DOM (layout já calculado), o topo de
      // cada parágrafo/item/linha de tabela — pontos seguros pra quebrar
      // página sem cortar um bloco de texto ao meio.
      const safeBreakOffsetsCss = collectSafeBreakOffsets(clone);

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(clone, {
        // scale 1.7 deixava o PDF (e o e-mail com ele anexado) muito
        // grande — acima do limite de tamanho de requisição da hospedagem
        // (Cloudflare), retornando "Request Entity Too Large" em vez de
        // JSON e quebrando o envio. 1.4 ainda fica nítido para leitura.
        scale: 1.4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: clone.scrollHeight,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // sliceCanvasToPdfPages fatia o canvas em páginas A4, ajustando cada
      // corte pro topo de bloco (parágrafo/item/linha de tabela) mais
      // próximo do ideal — nunca cortando texto ao meio.
      const scaleFactor = canvas.width / 794;
      const safeBreakOffsetsPx = safeBreakOffsetsCss.map((y) => y * scaleFactor);
      sliceCanvasToPdfPages(pdf, canvas, 210, 297, safeBreakOffsetsPx);

      return pdf;
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handleSavePDF = async () => {
    if (isGeneratingPDF || !isFormComplete() || !emailSent) return;

    setIsGeneratingPDF(true);
    try {
      const pdf = await generateContractPdf();
      const fileName = `Contrato_Rastreamento_${data.clientName.trim().replace(/\s+/g, "_") || "Cliente"}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === data.selectedPlan) || PLANS[0];

  const getDisplayPriceText = (): string => {
    if (isFrotaPlanSelected && customPriceValue !== null && customPriceValue >= FROTA_MIN_PRICE) {
      return `R$ ${formatPlanPrice(customPriceValue)}`;
    }
    if (isSobConsultaSemMinimo && customPriceValue !== null) {
      return `R$ ${formatPlanPrice(customPriceValue)}`;
    }
    return activePlan.priceText;
  };

  const getDisplayDetailText = (): string => {
    if (isFrotaPlanSelected && customPriceValue !== null && customPriceValue >= FROTA_MIN_PRICE) {
      return `R$ ${formatPlanPrice(customPriceValue)} mensais`;
    }
    if (isSobConsultaSemMinimo && customPriceValue !== null) {
      return `R$ ${formatPlanPrice(customPriceValue)} mensais`;
    }
    return activePlan.detailText;
  };

  // BUG FIX: retorna o valor base do plano sem dividir por 12.
  // Para planos anuais, exibe o valor anual total no contrato.
  const getPlanPriceValue = (): number => {
    if (isCustomPricePlan && customPriceValue !== null) {
      return customPriceValue;
    }
    const priceMatch = activePlan.priceText.match(/[\d.]+,\d{2}|[\d]+/);
    if (priceMatch) {
      return parsePlanPrice(priceMatch[0]) ?? 0;
    }
    return 0;
  };

  const getPriceExtenso = (): string => {
    const price = getPlanPriceValue();
    if (price === 0) return "";
    return numeroParaExtenso(price);
  };

  // Valor do equipamento na Cláusula 4 (Venda) — formatado a partir do
  // que foi digitado no campo "Valor do Equipamento" da aba Plano.
  const getEquipmentValueText = (): string => {
    const value = parsePlanPrice(data.equipmentValue);
    if (value === null) return "______________";
    return `${formatPlanPrice(value)} (${numeroParaExtenso(value)})`;
  };

  // ---- Auxiliares do contrato de COMODATO (texto jurídico revisado) ----

  // Valor total correspondente ao período inicial de 12 meses (Cláusula 4ª):
  // 12 x mensalidade do plano. Fica em branco se o plano não tiver valor.
  const getPlanTotal12Text = (): string => {
    const total = getPlanPriceValue() * 12;
    if (!total) return "R$ ______________";
    return `R$ ${formatPlanPrice(total)} (${numeroParaExtenso(total)})`;
  };

  // Valor de reposição do equipamento (Cláusula 6ª). Usa o valor digitado no
  // formulário; se em branco, mantém a regra histórica do app (mensalidade x 9).
  const getReplacementValueText = (): string => {
    const explicit = parsePlanPrice(data.replacementValue);
    if (explicit !== null) return `R$ ${formatPlanPrice(explicit)}`;
    const derived = getPlanPriceValue() * 9;
    return derived ? `R$ ${formatPlanPrice(derived)}` : "R$ ______________";
  };

  const getReturnDeadlineText = (): string =>
    data.returnDeadlineDays.trim() !== "" ? data.returnDeadlineDays.trim() : "_____";

  const handlePlanSelect = (planId: string) => {
    const isConsulta = planId === FROTA_PLAN_ID || SOB_CONSULTA_SEM_MINIMO.includes(planId);
    setData((prev) => ({
      ...prev,
      selectedPlan: planId,
      customPlanPrice: isConsulta
        ? (planId === FROTA_PLAN_ID ? prev.customPlanPrice || "89,90" : "")
        : "",
    }));
    setIsPlanDropdownOpen(false);
  };

  // ============================================================
  // CLÁUSULAS DO CONTRATO
  // ------------------------------------------------------------
  // A numeração ("CLÁUSULA N") é calculada automaticamente pela posição no
  // array (index + 1), então incluir/remover cláusulas nunca deixa buracos
  // na contagem.
  //
  // `vendaClauses` é o texto histórico do app (mantido sem alteração).
  // `comodatoClauses` é o texto do CONTRATO DE COMODATO revisado
  // juridicamente (20 cláusulas). A terminologia foi adaptada ao padrão do
  // app: CONTRATADA = GRUPO PROTECT LTDA; CONTRATANTE = cliente.
  // ============================================================

  const listStyle = "list-disc list-inside ml-2 space-y-0.5 text-[8.5pt]";
  const subItemStyle = "mt-1 text-[8.5pt]";

  const comodatoClauses = [
    {
      title: "DO OBJETO",
      body: (
        <>
          <p><strong>1.1.</strong> O presente contrato tem por objeto a cessão gratuita, em regime de comodato, de equipamento de rastreamento ao CONTRATANTE, bem como a prestação dos serviços de rastreamento e monitoramento por meio da plataforma tecnológica disponibilizada pela CONTRATADA.</p>
          <p className={subItemStyle}><strong>1.2.</strong> O equipamento será utilizado no veículo, pessoa, objeto, carga, bem ou outro ativo previamente cadastrado, conforme a natureza do serviço contratado e as condições comerciais estabelecidas entre as partes.</p>
          <p className={subItemStyle}><strong>1.3.</strong> O equipamento permanecerá de propriedade exclusiva da GRUPO PROTECT LTDA, não ocorrendo transferência de propriedade ao CONTRATANTE em razão do presente contrato.</p>
          <p className={subItemStyle}><strong>1.4.</strong> Identificação do equipamento e do objeto monitorado:</p>
          <ul className={listStyle}>
            <li>Plano / Equipamento: {activePlan.name} ({activePlan.tracker})</li>
            <li>Marca/Modelo: {data.equipmentBrandModel || "__________________________"}</li>
            <li>IMEI/Serial: {data.equipmentImeiSerial || "__________________________"}</li>
            <li>Chip/Linha: {data.equipmentChipLine || "__________________________"}</li>
            <li>Objeto/Pessoa/Bem/Carga/Veículo: {data.monitoredObject || "__________________________"}</li>
            <li>Identificação/Placa/Documento: {data.monitoredObjectId || "__________________________"}</li>
          </ul>
        </>
      ),
    },
    {
      title: "DA PRESTAÇÃO DOS SERVIÇOS",
      body: (
        <>
          <p><strong>2.1.</strong> A CONTRATADA disponibilizará ao CONTRATANTE os serviços de rastreamento e monitoramento previstos no plano comercial contratado.</p>
          <p className={subItemStyle}><strong>2.2.</strong> Conforme o plano contratado e a natureza do objeto monitorado, poderão ser disponibilizadas funcionalidades como localização, histórico de posições, cercas eletrônicas, alertas, relatórios, comandos e demais recursos disponibilizados pela plataforma.</p>
          <p className={subItemStyle}><strong>2.3.</strong> A disponibilidade das funcionalidades dependerá do equipamento utilizado, tecnologia empregada, cobertura de comunicação, disponibilidade de energia e demais condições técnicas aplicáveis ao serviço.</p>
          <p className={subItemStyle}><strong>2.4.</strong> A CONTRATADA poderá realizar atualizações, melhorias, correções e adequações técnicas na plataforma, visando à manutenção e evolução dos serviços.</p>
        </>
      ),
    },
    {
      title: "DA INSTALAÇÃO, ATIVAÇÃO OU VINCULAÇÃO DO EQUIPAMENTO",
      body: (
        <>
          <p><strong>3.1.</strong> A instalação, ativação ou vinculação do equipamento ao objeto monitorado será realizada conforme as condições comerciais previamente estabelecidas entre as partes e de acordo com a natureza do serviço contratado.</p>
          <p className={subItemStyle}><strong>3.2.</strong> Quando houver cobrança de instalação, ativação, configuração ou outro serviço técnico, o respectivo valor será previamente informado ao CONTRATANTE.</p>
          <p className={subItemStyle}><strong>3.3.</strong> Quando aplicável, a instalação deverá ser realizada por profissional autorizado ou conforme orientação técnica da CONTRATADA.</p>
          <p className={subItemStyle}><strong>3.4.</strong> O CONTRATANTE deverá disponibilizar o objeto a ser monitorado em condições adequadas para a instalação, ativação ou vinculação do equipamento.</p>
          <p className={subItemStyle}><strong>3.5.</strong> Qualquer alteração, remoção, transferência ou reinstalação do equipamento deverá ser previamente autorizada pela CONTRATADA.</p>
          <p className={subItemStyle}><strong>3.6.</strong> A reinstalação, transferência ou alteração de configuração poderá gerar cobrança adicional, conforme condições comerciais vigentes.</p>
        </>
      ),
    },
    {
      title: "DOS VALORES, DO PRAZO INICIAL, DA FORMA DE PAGAMENTO E DO REAJUSTE",
      body: (
        <>
          <p><strong>4.1.</strong> Pela prestação dos serviços contratados, o CONTRATANTE pagará à CONTRATADA os valores estabelecidos na proposta comercial, ficha de cadastro, pedido, termo de adesão ou documento equivalente vinculado a este contrato.</p>
          <p className={subItemStyle}><strong>4.2.</strong> A mensalidade do plano contratado será de <strong>{getDisplayPriceText()}</strong> ({getPriceExtenso() || "____________"}), com vencimento todo dia <strong>{data.dueDate || "____"}</strong> de cada mês.</p>
          <p className={subItemStyle}><strong>4.3.</strong> Considerando o prazo inicial de contratação de 12 (doze) meses, o valor total correspondente ao período inicial será de <strong>{getPlanTotal12Text()}</strong>, equivalente a 12 (doze) mensalidades de {getDisplayPriceText()} cada.</p>
          <p className={subItemStyle}><strong>4.4.</strong> O valor total indicado no item 4.3 representa o valor econômico correspondente ao período inicial de 12 (doze) meses e servirá como referência para fins contratuais e para eventual cálculo de cancelamento antecipado, não significando obrigação de pagamento antecipado, salvo se expressamente estabelecido na proposta comercial.</p>
          <p className={subItemStyle}><strong>4.5.</strong> Os valores dos serviços poderão ser reajustados a cada período de 12 (doze) meses pela variação acumulada do Índice Geral de Preços – Mercado (IGP-M), divulgado pela Fundação Getulio Vargas – FGV, ou por outro índice oficial que venha a substituí-lo.</p>
          <p className={subItemStyle}><strong>4.6.</strong> O reajuste será aplicado sobre o valor da mensalidade vigente imediatamente anterior à sua aplicação, a partir do início de cada novo período de 12 (doze) meses, mediante comunicação ao CONTRATANTE, observada a legislação aplicável.</p>
          <p className={subItemStyle}><strong>4.7.</strong> Caso o IGP-M deixe de ser divulgado ou seja extinto, será utilizado o índice oficial que legalmente o substituir. Na ausência de índice substituto, poderá ser adotado outro índice oficial que melhor reflita a variação dos custos da prestação dos serviços.</p>
          <p className={subItemStyle}><strong>4.8.</strong> Poderão ser cobrados, quando contratados, valores referentes à instalação, ativação, configuração, acessórios, serviços adicionais, reinstalação, transferência, manutenção decorrente de mau uso e outros serviços solicitados pelo CONTRATANTE.</p>
          <p className={subItemStyle}><strong>4.9.</strong> Os pagamentos referentes à prestação dos serviços serão realizados pelos meios disponibilizados pela CONTRATADA e nas condições estabelecidas na proposta comercial.</p>
        </>
      ),
    },
    {
      title: "DO CANCELAMENTO ANTECIPADO E DA MULTA RESCISÓRIA",
      body: (
        <>
          <p><strong>5.1.</strong> Durante cada período contratual de 12 (doze) meses, o CONTRATANTE poderá solicitar o cancelamento antecipado do contrato, observadas as condições estabelecidas nesta cláusula.</p>
          <p className={subItemStyle}><strong>5.2.</strong> Em caso de cancelamento antecipado imotivado antes do término do período contratual de 12 (doze) meses vigente, será aplicada multa correspondente a 30% (trinta por cento) do valor das mensalidades vincendas até o término do respectivo período contratual, observada a legislação aplicável.</p>
          <p className={subItemStyle}><strong>5.3.</strong> Para fins de cálculo da multa, será considerado o saldo das mensalidades ainda não vencidas entre a data efetiva do cancelamento e a data prevista para o término do respectivo período de 12 (doze) meses.</p>
          <p className={subItemStyle}><strong>5.4.</strong> Quando a contratação tiver condições comerciais especiais, tais como descontos, instalação gratuita, equipamento ou outros benefícios condicionados à permanência mínima, essas condições poderão ser especificadas na proposta comercial ou termo de adesão.</p>
          <p className={subItemStyle}><strong>5.5.</strong> A multa não será aplicada nas hipóteses em que a legislação determine sua inexigibilidade ou quando o cancelamento decorrer de descumprimento contratual imputável à CONTRATADA.</p>
          <p className={subItemStyle}><strong>5.6.</strong> A multa não afasta o pagamento de valores já vencidos, serviços efetivamente prestados, danos comprovados, equipamento não devolvido e demais obrigações constituídas até a data do encerramento.</p>
        </>
      ),
    },
    {
      title: "DA DEVOLUÇÃO DO EQUIPAMENTO",
      body: (
        <>
          <p><strong>6.1.</strong> Por se tratar de equipamento cedido em regime de comodato, o CONTRATANTE deverá devolvê-lo à CONTRATADA após o encerramento da contratação.</p>
          <p className={subItemStyle}><strong>6.2.</strong> A devolução deverá ocorrer no prazo máximo de {getReturnDeadlineText()} dias após o encerramento dos serviços, salvo prazo diverso acordado por escrito entre as partes.</p>
          <p className={subItemStyle}><strong>6.3.</strong> O equipamento deverá ser devolvido em condições compatíveis com o uso normal, ressalvado o desgaste natural decorrente de sua utilização adequada.</p>
          <p className={subItemStyle}><strong>6.4.</strong> Em caso de não devolução, perda, extravio, destruição ou dano decorrente de mau uso, negligência, imprudência, instalação ou intervenção não autorizada, o CONTRATANTE poderá ser responsabilizado pelo valor de reposição do equipamento e demais custos comprovadamente decorrentes.</p>
          <p className={subItemStyle}><strong>6.5.</strong> Valor de reposição do equipamento: <strong>{getReplacementValueText()}</strong>.</p>
        </>
      ),
    },
    {
      title: "DAS OBRIGAÇÕES DA CONTRATADA",
      body: (
        <>
          <p><strong>7.1.</strong> São obrigações da CONTRATADA:</p>
          <ul className={listStyle}>
            <li>a) disponibilizar o equipamento contratado;</li>
            <li>b) disponibilizar os serviços previstos no plano contratado;</li>
            <li>c) prestar suporte técnico dentro das condições estabelecidas;</li>
            <li>d) manter a plataforma disponível, ressalvadas indisponibilidades decorrentes de fatores externos;</li>
            <li>e) emitir os documentos fiscais correspondentes aos serviços prestados;</li>
            <li>f) manter a confidencialidade das informações do CONTRATANTE;</li>
            <li>g) observar a legislação aplicável à proteção de dados pessoais.</li>
          </ul>
        </>
      ),
    },
    {
      title: "DO PRAZO E DA RENOVAÇÃO CONTRATUAL",
      body: (
        <>
          <p><strong>8.1.</strong> O presente contrato terá prazo inicial de 12 (doze) meses, contado a partir da data de sua assinatura ou da ativação dos serviços, conforme o que ocorrer primeiro.</p>
          <p className={subItemStyle}><strong>8.2.</strong> Ao término do prazo inicial de 12 (doze) meses, não havendo manifestação formal de qualquer das partes quanto ao encerramento da contratação, o presente contrato será automaticamente renovado por novos períodos sucessivos de 12 (doze) meses, permanecendo vigentes as demais condições contratuais e comerciais aplicáveis.</p>
          <p className={subItemStyle}><strong>8.3.</strong> A renovação automática por novos períodos de 12 (doze) meses não dependerá da assinatura de novo instrumento contratual, permanecendo este contrato plenamente válido durante cada período de renovação.</p>
          <p className={subItemStyle}><strong>8.4.</strong> O CONTRATANTE que desejar não renovar ou encerrar a contratação deverá comunicar formalmente sua intenção com antecedência mínima de 30 (trinta) dias antes do término do período contratual vigente, mediante envio obrigatório da solicitação por escrito para o e-mail info@protectrastreamento.com.</p>
          <p className={subItemStyle}><strong>8.5.</strong> Caso o CONTRATANTE solicite o cancelamento antes do término do período de 12 (doze) meses vigente, será aplicada a multa prevista na Cláusula 5ª, calculada proporcionalmente sobre o valor das mensalidades vincendas até o término do respectivo período contratual.</p>
          <p className={subItemStyle}><strong>8.6.</strong> A renovação contratual não implicará alteração automática do valor da mensalidade, ressalvados os reajustes previstos na Cláusula 4ª e demais alterações de valores previamente comunicadas e legalmente aplicáveis.</p>
        </>
      ),
    },
    {
      title: "DAS OBRIGAÇÕES DO CONTRATANTE",
      body: (
        <>
          <p><strong>9.1.</strong> São obrigações do CONTRATANTE:</p>
          <ul className={listStyle}>
            <li>a) pagar pontualmente os valores contratados;</li>
            <li>b) fornecer informações verdadeiras e atualizadas;</li>
            <li>c) utilizar adequadamente o equipamento;</li>
            <li>d) não abrir, desmontar, adulterar ou modificar o equipamento;</li>
            <li>e) não permitir intervenção de terceiros não autorizados;</li>
            <li>f) comunicar imediatamente qualquer falha, dano, perda ou irregularidade;</li>
            <li>g) permitir manutenção autorizada quando necessária;</li>
            <li>h) devolver o equipamento ao término da contratação;</li>
            <li>i) manter seus dados cadastrais atualizados.</li>
          </ul>
        </>
      ),
    },
    {
      title: "DA MANUTENÇÃO E DOS DANOS",
      body: (
        <>
          <p><strong>10.1.</strong> Defeitos decorrentes de falha técnica natural do equipamento serão analisados pela CONTRATADA.</p>
          <p className={subItemStyle}><strong>10.2.</strong> Danos decorrentes de instalação inadequada, acidente, colisão, incêndio, inundação, vandalismo, violação, adulteração, desmontagem ou mau uso poderão ser cobrados do CONTRATANTE.</p>
          <p className={subItemStyle}><strong>10.3.</strong> O CONTRATANTE deverá comunicar imediatamente qualquer problema identificado no equipamento.</p>
          <p className={subItemStyle}><strong>10.4.</strong> Quando necessária a substituição do equipamento em razão de defeito não decorrente de mau uso, a CONTRATADA avaliará o equipamento e adotará as medidas técnicas cabíveis.</p>
        </>
      ),
    },
    {
      title: "DA INADIMPLÊNCIA",
      body: (
        <>
          <p><strong>11.1.</strong> O não pagamento da mensalidade ou de qualquer outro valor devido na data de vencimento caracterizará inadimplência do CONTRATANTE.</p>
          <p className={subItemStyle}><strong>11.2.</strong> Em caso de atraso no pagamento, incidirá sobre o valor devido multa moratória de 10% (dez por cento), além de juros de mora de 1% (um por cento) ao mês, calculados proporcionalmente aos dias de atraso, sem prejuízo da atualização monetária quando legalmente aplicável.</p>
          <p className={subItemStyle}><strong>11.3.</strong> Os encargos previstos nesta cláusula serão aplicados sobre o valor principal em atraso a partir do primeiro dia seguinte ao vencimento.</p>
          <p className={subItemStyle}><strong>11.4.</strong> Persistindo a inadimplência, a CONTRATADA poderá suspender os serviços de rastreamento e monitoramento, observadas as condições contratuais e a legislação aplicável.</p>
          <p className={subItemStyle}><strong>11.5.</strong> A suspensão dos serviços não implicará cancelamento automático do contrato nem afastará a obrigação do CONTRATANTE de quitar os valores vencidos e os respectivos encargos.</p>
          <p className={subItemStyle}><strong>11.6.</strong> O restabelecimento dos serviços poderá depender da regularização integral dos valores pendentes e respectivos encargos.</p>
          <p className={subItemStyle}><strong>11.7.</strong> A CONTRATADA poderá adotar as medidas administrativas e judiciais cabíveis para cobrança dos valores em aberto, observada a legislação aplicável.</p>
        </>
      ),
    },
    {
      title: "DA LIMITAÇÃO TÉCNICA DO SERVIÇO",
      body: (
        <>
          <p><strong>12.1.</strong> Os serviços de rastreamento e monitoramento dependem de tecnologias de comunicação e posicionamento, incluindo GPS/GNSS, rede móvel de comunicação, energia elétrica, quando aplicável, e demais recursos necessários ao funcionamento do sistema.</p>
          <p className={subItemStyle}><strong>12.2.</strong> A CONTRATADA não será responsável por interrupções decorrentes de ausência de cobertura, falhas de operadoras de telefonia, interferências de sinal, bloqueadores, problemas de energia, condições atmosféricas, caso fortuito, força maior ou outros fatores externos que estejam fora de seu controle.</p>
          <p className={subItemStyle}><strong>12.3.</strong> O serviço de rastreamento e monitoramento não constitui seguro, garantia contra furto, roubo, perda, acidente ou qualquer outro evento, nem garantia de recuperação do bem, objeto, carga ou pessoa monitorada.</p>
        </>
      ),
    },
    {
      title: "DA PROTEÇÃO DE DADOS E DA LGPD",
      body: (
        <>
          <p><strong>13.1.</strong> As partes comprometem-se a observar a legislação aplicável à proteção de dados pessoais, especialmente a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais – LGPD.</p>
          <p className={subItemStyle}><strong>13.2.</strong> Os dados serão tratados na medida necessária à execução deste contrato, prestação dos serviços, suporte, faturamento, segurança e cumprimento de obrigações legais.</p>
          <p className={subItemStyle}><strong>13.3.</strong> O CONTRATANTE declara estar ciente de que a prestação dos serviços poderá envolver tratamento de dados de localização e informações relacionadas ao veículo, pessoa, objeto, carga, bem ou outro ativo monitorado, conforme o serviço contratado.</p>
        </>
      ),
    },
    {
      title: "DA CONFIDENCIALIDADE",
      body: (
        <>
          <p><strong>14.1.</strong> As partes comprometem-se a manter sigilo sobre informações comerciais, técnicas, cadastrais e estratégicas obtidas em razão da relação contratual.</p>
          <p className={subItemStyle}><strong>14.2.</strong> A obrigação de confidencialidade não se aplica às informações cuja divulgação seja exigida por lei ou autoridade competente.</p>
        </>
      ),
    },
    {
      title: "DA RESCISÃO",
      body: (
        <>
          <p><strong>15.1.</strong> O presente contrato poderá ser rescindido:</p>
          <ul className={listStyle}>
            <li>a) pelo término do período contratual vigente, mediante manifestação de qualquer das partes nos termos da Cláusula 8ª;</li>
            <li>b) por acordo entre as partes;</li>
            <li>c) por inadimplemento contratual;</li>
            <li>d) por descumprimento de obrigação contratual;</li>
            <li>e) nas demais hipóteses previstas em lei.</li>
          </ul>
          <p className={subItemStyle}><strong>15.2.</strong> A rescisão não prejudicará os direitos e obrigações constituídos anteriormente à data de seu encerramento.</p>
          <p className={subItemStyle}><strong>15.3.</strong> O encerramento da contratação não exime o CONTRATANTE da obrigação de devolver o equipamento cedido em comodato.</p>
        </>
      ),
    },
    {
      title: "DA TRANSFERÊNCIA DO EQUIPAMENTO",
      body: (
        <>
          <p><strong>16.1.</strong> O CONTRATANTE não poderá transferir o equipamento para outro veículo, pessoa, objeto, carga, bem ou ativo sem autorização da CONTRATADA.</p>
          <p className={subItemStyle}><strong>16.2.</strong> A transferência poderá exigir nova instalação, configuração ou alteração cadastral e poderá gerar cobrança adicional.</p>
          <p className={subItemStyle}><strong>16.3.</strong> O CONTRATANTE deverá informar previamente à CONTRATADA qualquer alteração do objeto monitorado ou da finalidade de utilização do equipamento.</p>
        </>
      ),
    },
    {
      title: "DAS COMUNICAÇÕES",
      body: (
        <>
          <p><strong>17.1.</strong> As comunicações relacionadas à execução do contrato poderão ocorrer por e-mail, aplicativo de mensagens, sistema eletrônico ou outros canais disponibilizados pela CONTRATADA.</p>
          <p className={subItemStyle}><strong>17.2.</strong> Para fins de cancelamento, não renovação ou encerramento dos serviços, deverá ser obrigatoriamente observado o procedimento previsto na Cláusula 8ª, inclusive o envio da solicitação para o e-mail info@protectrastreamento.com.</p>
          <p className={subItemStyle}><strong>17.3.</strong> O CONTRATANTE deverá manter seus dados de contato atualizados.</p>
        </>
      ),
    },
    {
      title: "DA INEXISTÊNCIA DE VÍNCULO",
      body: (
        <>
          <p><strong>18.1.</strong> O presente contrato não estabelece qualquer vínculo societário, trabalhista, representação comercial, associação ou relação de subordinação entre as partes.</p>
          <p className={subItemStyle}><strong>18.2.</strong> Cada parte será responsável por suas próprias obrigações legais, fiscais, trabalhistas e comerciais.</p>
        </>
      ),
    },
    {
      title: "DA ACEITAÇÃO",
      body: (
        <>
          <p><strong>19.1.</strong> O CONTRATANTE declara ter lido e compreendido todas as cláusulas deste contrato, concordando com suas condições.</p>
          <p className={subItemStyle}><strong>19.2.</strong> O CONTRATANTE declara que recebeu ou teve acesso às informações relativas ao plano contratado, valores, prazo inicial, condições de cancelamento, renovação, reajuste e demais condições comerciais.</p>
          <p className={subItemStyle}><strong>19.3.</strong> A assinatura física ou eletrônica deste instrumento representará a manifestação de vontade das partes.</p>
        </>
      ),
    },
    {
      title: "DO FORO",
      body: (
        <>
          <p><strong>20.1.</strong> Fica eleito o foro da Comarca de <strong>Belo Horizonte, Estado de Minas Gerais</strong>, para dirimir quaisquer dúvidas, controvérsias ou questões decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja, ressalvadas as hipóteses em que a legislação aplicável estabelecer foro diverso ou competência territorial de natureza obrigatória.</p>
          <p className={subItemStyle}><strong>20.2.</strong> As partes comprometem-se, sempre que possível, a buscar previamente uma solução amigável para eventuais divergências decorrentes da execução ou interpretação deste contrato.</p>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 lg:flex-row print-container select-none" onContextMenu={(e) => { e.preventDefault(); }}>
      {/* SELETOR MOBILE */}
      <div className="flex lg:hidden sticky top-0 bg-brand-black border-b border-zinc-800 z-30 no-print shadow-md">
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${mobileTab === "form"
              ? "border-brand-yellow text-brand-yellow bg-zinc-900/10"
              : "border-transparent text-zinc-400 hover:text-white"
            }`}
        >
          Editar Contrato
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${mobileTab === "preview"
              ? "border-brand-yellow text-brand-yellow bg-zinc-900/10"
              : "border-transparent text-zinc-400 hover:text-white"
            }`}
        >
          Visualizar Documento
        </button>
      </div>

      {/* BOTÃO FLUTUANTE: reabrir painel do formulário (desktop) */}
      <AnimatePresence>
        {!panelOpen && (
          <motion.button
            key="reopen-panel"
            onClick={() => setPanelOpen(true)}
            title="Mostrar formulário do contrato"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex fixed top-4 left-4 z-40 items-center justify-center w-10 h-10 rounded-full bg-brand-black hover:bg-zinc-800 border-2 border-brand-yellow text-brand-yellow shadow-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* MODAL DE BLOQUEIO */}
      <AnimatePresence>
        {showPrintBlockDialog && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-linear-to-r from-brand-black to-zinc-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-brand-yellow shrink-0" />
                  <h2 className="text-lg font-bold text-white">Proteção Ativa</h2>
                </div>
                <button
                  onClick={() => setShowPrintBlockDialog(false)}
                  className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-zinc-700 rounded transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-3">
                <p className="text-sm text-zinc-700">
                  A impressão direta não é permitida nesta aplicação por razões de segurança.
                </p>
                <p className="text-sm text-zinc-600">Isso inclui:</p>
                <ul className="text-sm text-zinc-600 space-y-1 ml-3">
                  <li>✗ <strong>Ctrl+P</strong> ou <strong>Cmd+P</strong></li>
                  <li>✗ <strong>Clique direito</strong> do mouse</li>
                  <li>✗ Menu do navegador → Imprimir</li>
                  <li>✗ <strong>F12</strong> - Developer Tools</li>
                  <li>✗ <strong>Ctrl+Shift+I/C/J/K</strong> - Ferramentas de dev</li>
                </ul>
                <p className="text-sm text-zinc-700 mt-4">
                  Para imprimir com segurança, use o botão <strong className="text-brand-yellow">Imprimir</strong> após preencher todos os campos.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 font-semibold">
                    Complete todos os dados e assine antes de imprimir ou salvar em PDF.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
                <button
                  onClick={() => setShowPrintBlockDialog(false)}
                  className="px-5 py-2.5 min-h-11 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black cursor-pointer font-bold text-sm rounded-md transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAINEL DE CONTROLE */}
      <aside className={`w-full bg-white border-b lg:border-b-0 border-zinc-200 flex flex-col min-h-0 h-auto lg:h-screen lg:sticky lg:top-0 lg:min-w-0 no-print z-10 shadow-sm overflow-x-hidden transition-all duration-300 ease-in-out ${mobileTab === 'form' ? 'flex' : 'hidden'} ${panelOpen ? 'lg:flex lg:w-[54%] xl:w-[46%] lg:border-r lg:opacity-100' : 'lg:flex lg:w-0 lg:opacity-0 lg:border-r-0 lg:pointer-events-none'}`}>

        {/* CABEÇALHO */}
        <header className="p-4 sm:p-6 bg-brand-black text-white flex flex-col gap-4 border-b-4 border-brand-yellow shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-7 w-auto shrink-0" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wider leading-tight text-white">
                  Protect<span className="text-brand-yellow">Rastreamento</span>.com
                </h1>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold tracking-wider sm:tracking-widest uppercase truncate">
                  Painel Corporativo de Contratos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isFormComplete() ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-950/80 border border-green-800 text-green-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Pronto
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-brand-yellow rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incompleto
                </div>
              )}
              <a
                href="https://protectrastreamento.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                title="Voltar ao site público"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                Voltar ao site
              </a>
              <button
                onClick={() => setPanelOpen(false)}
                title="Ocultar formulário e ver o contrato em tela cheia"
                className="hidden lg:flex items-center justify-center w-7 h-7 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handlePrint}
              disabled={!isFormComplete() || isGeneratingPDF || !emailSent}
              title={
                !isFormComplete()
                  ? "Preencha todos os campos e assine para habilitar"
                  : !emailSent
                    ? "Envie o contrato por e-mail primeiro para liberar a impressão"
                    : "Imprimir contrato"
              }
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-xs rounded-md shadow-md hover:shadow-lg transition-all duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Imprimir
            </button>
            <button
              onClick={handleSavePDF}
              disabled={!isFormComplete() || isGeneratingPDF || !emailSent}
              title={
                !isFormComplete()
                  ? "Preencha todos os campos e assine para habilitar"
                  : !emailSent
                    ? "Envie o contrato por e-mail primeiro para liberar o PDF"
                    : "Salvar contrato em PDF"
              }
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg border border-zinc-700 transition-all duration-200 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="w-4 h-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 shrink-0" />
                  Salvar PDF
                </>
              )}
            </button>
          </div>
          {!emailSent && (
            <div className="mt-3.5 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[11px] text-amber-300 font-semibold leading-normal flex gap-2.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
              <span>
                A impressão e download do PDF só serão liberados após você preencher todos os dados, assinar e clicar em <strong className="text-brand-yellow font-bold">Enviar por Email</strong> na aba "Assinar".
              </span>
            </div>
          )}
        </header>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="flex bg-zinc-100 border-b border-zinc-200 shrink-0">
          <button
            onClick={() => setActiveTab("client")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2.5 sm:py-3 min-h-12 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${activeTab === "client"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
              }`}
          >
            <User className="w-4 h-4" /> Cliente
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2.5 sm:py-3 min-h-12 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${activeTab === "plan"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
              }`}
          >
            <Settings className="w-4 h-4" /> Plano
          </button>

          <button
            onClick={() => setActiveTab("signature")}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2.5 sm:py-3 min-h-12 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${activeTab === "signature"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
              }`}
          >
            <PenTool className="w-4 h-4" /> Assinar
          </button>
        </nav>

        {/* FORMULÁRIO */}
        <div className={`flex-1 min-h-0 p-4 sm:p-6 space-y-7 ${isPlanDropdownOpen ? "overflow-visible" : "overflow-y-auto"}`}>
          <AnimatePresence initial={false}>

          {/* TAB: CLIENTE */}
          {activeTab === "client" && (
            <motion.div
              key="client"
              className="space-y-5"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Dados do Contratante
                </h3>
                <p className="text-xs text-zinc-500">Insira os dados cadastrais do cliente</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Nome Completo / Razão Social
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={data.clientName}
                    onChange={handleChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Ex: Gustavo Sauro"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5 shrink-0" />
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      name="clientDoc"
                      value={data.clientDoc}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 000.000.000-00"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      RG ou CNH
                    </label>
                    <input
                      type="text"
                      name="clientRg"
                      value={data.clientRg}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 00.000.000-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={data.clientPhone}
                      onChange={handleChange}
                      inputMode="tel"
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={data.clientEmail}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: cliente@provedor.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      Endereço (Rua, Av.)
                    </label>
                    <input
                      type="text"
                      name="clientAddress"
                      value={data.clientAddress}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Av. Paulista"
                    />
                  </div>
                  <div className="flex flex-col">
                    {/* BUG FIX: clientNumber aceita texto livre (S/N, 12A, etc.) */}
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      Número
                    </label>
                    <input
                      type="text"
                      name="clientNumber"
                      value={data.clientNumber}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 1000 ou S/N"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="clientComp"
                      value={data.clientComp}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Apto 12"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="clientBairro"
                      value={data.clientBairro}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="clientCity"
                      value={data.clientCity}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Estado
                    </label>
                    <input
                      type="text"
                      name="clientState"
                      value={data.clientState}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    CEP
                  </label>
                  <input
                    type="text"
                    name="clientCep"
                    value={data.clientCep}
                    onChange={handleChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Ex: 01000-000"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PLANO */}
          {activeTab === "plan" && (
            <motion.div
              key="plan"
              className={`space-y-5 ${isPlanDropdownOpen ? "pb-48" : ""}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Plano e Rastreamento
                </h3>
                <p className="text-xs text-zinc-500">Selecione o plano de rastreamento e vencimentos</p>
              </div>

              <div className="flex flex-col mb-1">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 shrink-0" />
                  Tipo de Serviço do Equipamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleServiceTypeChange("comodato")}
                    className={`flex flex-col items-center gap-1.5 p-3.5 border rounded-lg text-center transition-all duration-150 cursor-pointer ${data.serviceType === "comodato"
                        ? "bg-amber-50/70 border-brand-yellow-dark shadow-2xs"
                        : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                      }`}
                  >
                    <Repeat className={`w-4 h-4 ${data.serviceType === "comodato" ? "text-brand-black" : "text-zinc-400"}`} />
                    <span className={`text-xs font-bold ${data.serviceType === "comodato" ? "text-zinc-950" : "text-zinc-700"}`}>1. Comodato</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">Equipamento da CONTRATADA, devolvido ao final</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleServiceTypeChange("venda")}
                    className={`flex flex-col items-center gap-1.5 p-3.5 border rounded-lg text-center transition-all duration-150 cursor-pointer ${data.serviceType === "venda"
                        ? "bg-amber-50/70 border-brand-yellow-dark shadow-2xs"
                        : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                      }`}
                  >
                    <ShoppingCart className={`w-4 h-4 ${data.serviceType === "venda" ? "text-brand-black" : "text-zinc-400"}`} />
                    <span className={`text-xs font-bold ${data.serviceType === "venda" ? "text-zinc-950" : "text-zinc-700"}`}>2. Venda do Equipamento</span>
                    <span className="text-[10px] text-zinc-500 leading-tight">Equipamento passa a ser do CONTRATANTE</span>
                  </button>
                </div>
              </div>

              {data.serviceType === "venda" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-3.5 bg-amber-50/50 border border-brand-yellow-dark/40 rounded-lg">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      Valor do Equipamento <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">R$</span>
                      <input
                        type="text"
                        name="equipmentValue"
                        value={data.equipmentValue}
                        onChange={handleChange}
                        inputMode="decimal"
                        placeholder="0,00"
                        className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Valor cobrado pelo equipamento vendido.</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      Forma de Pagamento do Equipamento
                    </label>
                    <select
                      name="equipmentPaymentMethod"
                      value={data.equipmentPaymentMethod}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150 cursor-pointer"
                    >
                      <option value="">Selecione...</option>
                      <option value="À vista">À vista</option>
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Boleto Bancário">Boleto Bancário</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="Parcelado">Parcelado</option>
                    </select>
                    <p className="text-[11px] text-zinc-500 mt-1">Como o cliente vai pagar o equipamento (separado da mensalidade do plano).</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5">
                <div className={`flex flex-col relative ${isPlanDropdownOpen ? "z-50" : ""}`}>
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    Plano de Rastreamento
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-left p-3.5 border border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 active:bg-zinc-100 focus:outline-none focus:border-brand-black transition-all duration-150 cursor-pointer shadow-xs"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Plano Selecionado</span>
                      <span className="text-sm font-bold text-zinc-900 leading-snug wrap-break-words">{activePlan.name}</span>
                      <span className="text-xs text-zinc-500 font-semibold wrap-break-words">{activePlan.tracker} ({activePlan.billing})</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
                      <span className="px-2.5 py-1 bg-brand-yellow/15 text-brand-black border border-brand-yellow/30 font-bold text-[10px] sm:text-xs rounded-full shadow-2xs text-left sm:text-right leading-tight max-w-full wrap-break-words">
                        {getDisplayPriceText()}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${isPlanDropdownOpen ? 'transform rotate-180 text-brand-black' : ''}`} />
                    </div>
                  </button>

                  {isPlanDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsPlanDropdownOpen(false)}
                    />
                  )}

                  <AnimatePresence>
                    {isPlanDropdownOpen && (
                      <motion.div
                        className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-zinc-200/90 rounded-lg shadow-xl max-h-[min(320px,50vh)] overflow-y-auto divide-y divide-zinc-100/80"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {PLANS.map((plan) => {
                          const isSelected = plan.id === data.selectedPlan;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => handlePlanSelect(plan.id)}
                              className={`w-full flex flex-col sm:flex-row sm:items-start sm:justify-between text-left p-3.5 gap-2 hover:bg-zinc-50 active:bg-zinc-100/80 transition-colors cursor-pointer ${isSelected ? 'bg-amber-50/40 border-l-4 border-l-brand-yellow' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className={`text-sm font-bold leading-snug wrap-break-words ${isSelected ? 'text-zinc-950' : 'text-zinc-800'}`}>
                                  {plan.name}
                                </span>
                                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider wrap-break-words">
                                  {plan.tracker} • {plan.billing}
                                </span>
                              </div>
                              <span className={`self-start sm:self-center px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full border leading-tight wrap-break-words max-w-full ${isSelected
                                  ? 'bg-brand-yellow text-brand-black border-brand-yellow shadow-2xs'
                                  : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                                }`}>
                                {plan.priceText}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isCustomPricePlan && (
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      Valor Mensal do Plano <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">R$</span>
                      <input
                        type="text"
                        name="customPlanPrice"
                        value={data.customPlanPrice}
                        onChange={handleChange}
                        inputMode="decimal"
                        placeholder={isFrotaPlanSelected ? "89,90" : "0,00"}
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-1 bg-zinc-50 focus:bg-white transition-all duration-150 ${data.customPlanPrice && isFrotaPlanSelected && !isFrotaPriceValid
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-zinc-200 focus:border-brand-black focus:ring-brand-black"
                          }`}
                      />
                    </div>
                    {data.customPlanPrice && isFrotaPlanSelected && !isFrotaPriceValid ? (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        O valor mínimo para este plano é R$ 89,90.
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {isFrotaPlanSelected
                          ? "Informe o valor acordado. Mínimo: R$ 89,90 mensais."
                          : "Informe o valor acordado com o cliente."}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Dia de Vencimento
                    </label>
                    <select
                      name="dueDate"
                      value={data.dueDate}
                      onChange={handleChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 cursor-pointer"
                    >
                      <option value="05">Todo dia 05</option>
                      <option value="10">Todo dia 10</option>
                      <option value="15">Todo dia 15</option>
                      <option value="20">Todo dia 20</option>
                      <option value="25">Todo dia 25</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Data do Contrato
                    </label>
                    {/* BUG FIX: value em YYYY-MM-DD para o input type=date funcionar */}
                    <input
                      type="date"
                      name="contractDate"
                      value={data.contractDate}
                      onChange={handleChange}
                      className="p-2.5 border cursor-pointer border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* DADOS DO EQUIPAMENTO E DEVOLUÇÃO — só no Comodato.
                  Todos os campos são opcionais: se ficarem em branco, o
                  contrato sai com uma linha "____" para preenchimento manual. */}
              {data.serviceType === "comodato" && (
                <div className="space-y-4 p-3.5 bg-amber-50/50 border border-brand-yellow-dark/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-brand-black shrink-0" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-black">
                      Equipamento em Comodato e Devolução
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 -mt-2">Opcional — usado nas Cláusulas 1ª, 6ª e 9ª do contrato de comodato.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Marca / Modelo do rastreador</label>
                      <input
                        type="text"
                        name="equipmentBrandModel"
                        value={data.equipmentBrandModel}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: GT06N / Coban"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">IMEI / Serial</label>
                      <input
                        type="text"
                        name="equipmentImeiSerial"
                        value={data.equipmentImeiSerial}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: 356938035643809"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Chip / Linha</label>
                      <input
                        type="text"
                        name="equipmentChipLine"
                        value={data.equipmentChipLine}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: (31) 90000-0000 / Arqia"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Objeto / Veículo / Bem monitorado</label>
                      <input
                        type="text"
                        name="monitoredObject"
                        value={data.monitoredObject}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: Honda CG 160 / carga / notebook"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Identificação / Placa / Documento</label>
                      <input
                        type="text"
                        name="monitoredObjectId"
                        value={data.monitoredObjectId}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: ABC1D23"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Prazo de devolução (dias)</label>
                      <input
                        type="text"
                        name="returnDeadlineDays"
                        value={data.returnDeadlineDays}
                        onChange={handleChange}
                        inputMode="numeric"
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Ex: 15"
                      />
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        Valor de reposição do equipamento
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">R$</span>
                        <input
                          type="text"
                          name="replacementValue"
                          value={data.replacementValue}
                          onChange={handleChange}
                          inputMode="decimal"
                          placeholder="0,00"
                          className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Se ficar em branco, o contrato usa a regra atual (mensalidade &times; 9).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RESUMO DO PLANO SELECIONADO */}
              <div className="mt-6 bg-linear-to-br from-zinc-900 to-zinc-800 text-white rounded-lg p-4 sm:p-5 border border-zinc-700 shadow-md">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-zinc-700">
                  <Zap className="w-4 h-4 text-brand-yellow shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Resumo do Plano Selecionado
                  </h4>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Plano</span>
                    <span className="text-xs font-bold text-right text-white wrap-break-words flex-1">{activePlan.name}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Equipamento</span>
                    <span className="text-xs font-semibold text-right text-zinc-200 wrap-break-words flex-1">{activePlan.tracker}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Cobrança</span>
                    <span className="text-xs font-semibold text-right text-zinc-200 wrap-break-words flex-1">{activePlan.billing}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 pt-2.5 mt-1 border-t border-zinc-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Valor</span>
                    <span className="text-sm font-extrabold text-right text-brand-yellow wrap-break-words flex-1">
                      {getDisplayPriceText()}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Vencimento</span>
                    <span className="text-xs font-semibold text-right text-zinc-200 wrap-break-words flex-1">Todo dia {data.dueDate || "__"}</span>
                  </div>
                  {isCustomPricePlan && customPriceValue !== null && (
                    <div className="pt-2.5 mt-1 border-t border-zinc-700">
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        <span className="font-bold text-brand-yellow">Por extenso: </span>
                        <span className="italic text-zinc-200">{getPriceExtenso()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* VANTAGENS INCLUSAS */}
              <div className="mt-5 bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-zinc-100">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-black">
                    Vantagens Inclusas
                  </h4>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>Monitoramento 24h via plataforma web e aplicativo mobile</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>Localização em tempo real com histórico de rotas</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>Notificações de ignição, movimento e cercas virtuais</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>Suporte técnico via WhatsApp e telefone</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>{data.serviceType === "comodato" ? "Equipamento em comodato (sem custo adicional)" : "Equipamento adquirido pelo cliente (venda)"}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>Instalação técnica incluída</span>
                  </li>
                </ul>
              </div>

              {/* INFORMAÇÕES IMPORTANTES */}
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-200">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                    Informações Importantes
                  </h4>
                </div>

                <ul className="space-y-2.5 text-[11px] text-blue-900 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>
                      {data.serviceType === "comodato"
                        ? <>O contrato tem <strong>prazo inicial de 12 meses</strong> e é <strong>renovado automaticamente</strong> por novos períodos de 12 meses, salvo aviso por escrito com 30 dias de antecedência para info@protectrastreamento.com.</>
                        : <>O contrato possui <strong>prazo mínimo de 12 meses</strong>. Após esse período, passa a vigorar por prazo indeterminado.</>}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>
                      {data.serviceType === "comodato"
                        ? <>Em caso de cancelamento antecipado imotivado, será cobrada <strong>multa de 30%</strong> das mensalidades vincendas até o fim do período de 12 meses vigente.</>
                        : <>Em caso de cancelamento antecipado, será cobrada <strong>multa de 30%</strong> sobre o valor restante do contrato.</>}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>
                      {data.serviceType === "comodato"
                        ? <>O equipamento rastreador é cedido em <strong>regime de comodato</strong>, devendo ser devolvido ao final do contrato.</>
                        : <>O equipamento rastreador é <strong>vendido ao cliente</strong> e passa a ser de sua propriedade após a quitação.</>}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>
                      {data.serviceType === "comodato"
                        ? <>O atraso gera <strong>multa de 10% + juros de 1% ao mês</strong>; persistindo a inadimplência, os serviços poderão ser suspensos.</>
                        : <>O não pagamento após <strong>15 dias de atraso</strong> acarretará na suspensão do serviço.</>}
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB: ASSINATURA */}
          {activeTab === "signature" && (
            <motion.div
              key="signature"
              className="space-y-5"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Assinaturas Digitais
                </h3>
                <p className="text-xs text-zinc-500">Colete a assinatura do cliente e da Protect abaixo para incluí-las no contrato</p>
              </div>

              {!isFormComplete() && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">
                      Complete todos os campos antes de assinar
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Preencha os dados do cliente e do plano nas abas anteriores para habilitar a assinatura.
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Assinatura do Cliente (Contratante)</p>
              <div className="bg-white border border-zinc-100 p-1.5 sm:p-4 rounded-xl shadow-sm">
                <SignatureCanvas
                  label="Assinatura do Contratante"
                  onSave={handleSignatureSave}
                  onClear={handleSignatureClear}
                />
              </div>

              {signatureImage && (
                <div className="bg-zinc-50 border border-dashed border-zinc-200 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Assinatura Capturada!</span>
                  </div>
                  <div className="inline-block bg-white p-2 rounded border border-zinc-100">
                    <img
                      src={signatureImage}
                      alt="Assinatura pré-visualização"
                      className="max-h-20 max-w-full object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-zinc-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2">Protect</span>
                <div className="flex-1 h-px bg-zinc-200"></div>
              </div>

              <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Assinatura da Contratada (Protect)</p>
              <div className="bg-white border border-zinc-100 p-1.5 sm:p-4 rounded-xl shadow-sm">
                <SignatureCanvas
                  label="Assinatura da Contratada"
                  onSave={handleContratadaSignatureSave}
                  onClear={handleContratadaSignatureClear}
                />
              </div>

              {contratadaSignatureImage && (
                <div className="bg-zinc-50 border border-dashed border-zinc-200 p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Assinatura Capturada!</span>
                  </div>
                  <div className="inline-block bg-white p-2 rounded border border-zinc-100">
                    <img
                      src={contratadaSignatureImage}
                      alt="Assinatura da Contratada pré-visualização"
                      className="max-h-20 max-w-full object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              {data.serviceType === "comodato" && (
                <div className="space-y-4 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Dados para assinatura</p>
                    <p className="text-[11px] text-zinc-500">Opcional — representante da Protect e CPF das testemunhas no contrato de comodato. Em branco, sai como linha para preencher à mão.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">Representante da Contratada</label>
                      <input
                        type="text"
                        name="contratadaRepName"
                        value={data.contratadaRepName}
                        onChange={handleChange}
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="Nome de quem assina pela Protect"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">CPF do Representante</label>
                      <input
                        type="text"
                        name="contratadaRepCpf"
                        value={data.contratadaRepCpf}
                        onChange={handleChange}
                        inputMode="numeric"
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">CPF/CNPJ Testemunha 1 <span className="normal-case font-normal text-zinc-400">(Antonio C. Costa Junior)</span></label>
                      <input
                        type="text"
                        name="witness1Cpf"
                        value={data.witness1Cpf}
                        onChange={handleChange}
                        inputMode="numeric"
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">CPF/CNPJ Testemunha 2 <span className="normal-case font-normal text-zinc-400">(Emerson N. do Carmo)</span></label>
                      <input
                        type="text"
                        name="witness2Cpf"
                        value={data.witness2Cpf}
                        onChange={handleChange}
                        inputMode="numeric"
                        className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {renderTermsSection()}
            </motion.div>
          )}

          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <footer className="p-3 sm:p-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-500 shrink-0">
          <a href="https://www.instagram.com/xfassessoria/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-black">
            Desenvolvido por X Family
          </a>
          <span className="font-semibold text-brand-black">Contrato R+ v1.0</span>
        </footer>
      </aside>

      {/* CONTÊINER DO CONTRATO */}
      <main
        className={`flex-1 pt-0 px-4 pb-4 md:px-6 md:pb-6 lg:pl-2 lg:pr-6 lg:pb-6 overflow-y-auto flex justify-center bg-zinc-100 min-h-screen select-none ${mobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        style={{ userSelect: "none" }}
      >
        <div
          className="a4-wrapper"
          style={{ height: windowWidth < 869 ? `${contractHeight * scale}px` : "auto" }}
        >
          <div
            className="print-container w-full max-w-[230mm] transition-transform duration-200"
            style={{
              transform: windowWidth < 869 ? `scale(${scale})` : "none",
              transformOrigin: "top center",
            }}
          >
            <article
              ref={contractRef}
              id="contract-pdf"
              className="a4-page shadow-2xl rounded-sm text-[11pt] leading-relaxed text-zinc-950 font-sans select-none"
              style={{ userSelect: "none" }}
            >

              {/* CABEÇALHO */}
              <div className="flex items-center justify-between border-b-2 border-brand-black pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-8 w-auto" />
                  <div>
                    <h1 className="font-extrabold text-base tracking-wider">
                      Protect<span className="">Rastreamento</span>.com
                    </h1>
                    <div className="text-[7pt] text-zinc-500 uppercase tracking-wider font-semibold">
                      Segurança &amp; Rastreamento
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8pt] font-bold text-zinc-700">INSTRUMENTO PARTICULAR</div>
                  <div className="text-[7pt] font-semibold text-zinc-500 uppercase tracking-wider">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
                </div>
              </div>

              {/* TÍTULO */}
              <h2 className="text-center font-extrabold text-xs uppercase tracking-wide mb-6 border-b border-zinc-200 pb-2">
                {data.serviceType === "comodato"
                  ? "CONTRATO DE COMODATO DE EQUIPAMENTO E PRESTAÇÃO DE SERVIÇOS DE RASTREAMENTO"
                  : "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE RASTREAMENTO VEICULAR COM VENDA DE DISPOSITIVO"} Nº {data.contractNumber}
              </h2>

              {/* CORPO */}
              <div className="space-y-5 text-justify text-[9pt] leading-relaxed text-zinc-800">

                <p>
                  <strong>CONTRATADA:</strong> <strong>GRUPO PROTECT LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob nº <strong>42.818.864/0001-65</strong>, nome fantasia <strong>ProtectRastreamento.com</strong>, com sede na Rua General Andrade Neves, 622 – Bairro Grajaú – Belo Horizonte – MG – CEP 30431-128, telefone +55 (31) 3371-8600, e-mail info@protectrastreamento.com, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                </p>

                <p>
                  <strong>CONTRATANTE:</strong><br />
                  Nome: <strong>{data.clientName || "___________________________________________"}</strong><br />
                  CPF/CNPJ: <strong>{data.clientDoc || "_____________________"}</strong><br />
                  RG/CNH: <strong>{data.clientRg || "_____________________"}</strong><br />
                  Endereço: <strong>{data.clientAddress || "_________________________________"}, nº {data.clientNumber || "___"} - {data.clientBairro || "_________"} - {data.clientCity || "_______"}/{data.clientState || "__"} - CEP {data.clientCep || "________"}</strong><br />
                  Telefone: <strong>{data.clientPhone || "_________________"}</strong><br />
                  E-mail: <strong>{data.clientEmail || "_________________________________"}</strong>
                </p>

                <p>
                  {data.serviceType === "comodato"
                    ? "As partes têm entre si justo e contratado o presente Contrato de Comodato de Equipamento e Prestação de Serviços de Rastreamento e Monitoramento, mediante as cláusulas e condições seguintes:"
                    : "As partes resolvem firmar o presente Contrato de Prestação de Serviços de Rastreamento Veicular, mediante as seguintes cláusulas:"}
                </p>

                {/* Cláusulas geradas dinamicamente: a Cláusula 4 (propriedade do
                    equipamento) muda de texto conforme Comodato/Venda, e a
                    Cláusula de retirada do equipamento só existe no Comodato
                    (na Venda o equipamento não é devolvido). A numeração é
                    calculada automaticamente pela posição no array, então
                    incluir/remover cláusulas nunca deixa buracos na contagem.

                    O array abaixo é o texto histórico usado na VENDA. O
                    Comodato usa `comodatoClauses` (contrato revisado
                    juridicamente, definido no topo do componente). */}
                {(data.serviceType === "comodato" ? comodatoClauses : [
                  {
                    title: "OBJETO",
                    body: (
                      <>
                        <p>
                          O presente contrato tem como objeto a prestação de serviços de rastreamento, monitoramento e localização veicular, por meio de tecnologia GPS/GSM ou similar, disponibilizada pela CONTRATADA.
                        </p>
                        <p className="mt-1 font-semibold text-[8.5pt]">O serviço inclui:</p>
                        <ul className="list-disc list-inside ml-2 space-y-0.5 text-[8.5pt]">
                          <li>Monitoramento da localização do veículo</li>
                          <li>Acesso à plataforma de rastreamento</li>
                          <li>Suporte técnico</li>
                          <li>Localização do veículo quando solicitado.</li>
                        </ul>
                      </>
                    ),
                  },
                  {
                    title: "NATUREZA DO SERVIÇO",
                    body: (
                      <>
                        <p>
                          A CONTRATADA não é seguradora. O serviço prestado consiste exclusivamente em rastreamento e monitoramento do veículo, não havendo garantia de:
                        </p>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5 text-[8.5pt]">
                          <li>Recuperação do veículo em caso de furto ou roubo</li>
                          <li>Prevenção de crimes</li>
                          <li>Funcionamento contínuo em locais sem cobertura de sinal.</li>
                        </ul>
                      </>
                    ),
                  },
                  {
                    title: "LIMITAÇÃO DE RESPONSABILIDADE",
                    body: (
                      <p>
                        A CONTRATADA não será responsável por perdas ou danos, incluindo: roubo ou furto do veículo, danos materiais, lucros cessantes, interrupções de sinal, falhas de rede GSM/GPS, e bloqueio de sinal por terceiros. A CONTRATADA compromete-se apenas a empregar os recursos tecnológicos disponíveis para auxiliar na localização do veículo.
                      </p>
                    ),
                  },
                  {
                      title: "COMPRA E VENDA DO EQUIPAMENTO",
                      body: (
                        <>
                          <p>
                            O CONTRATANTE adquire da CONTRATADA o equipamento rastreador instalado no veículo. Após a quitação do respectivo valor, o equipamento passa a ser de propriedade exclusiva do CONTRATANTE. Por se tratar de venda, o equipamento não será devolvido em razão do simples cancelamento do serviço de rastreamento, ressalvadas as hipóteses legalmente aplicáveis.
                          </p>
                          <p className="mt-1 text-[8.5pt]">
                            <strong>Tipo de Serviço / Plano selecionado:</strong> {activePlan.name} (Equipamento: {activePlan.tracker})<br />
                            <strong>Valor do equipamento:</strong> R$ {getEquipmentValueText()} &nbsp; <strong>Forma de pagamento:</strong> {data.equipmentPaymentMethod || "______________________"}
                          </p>
                        </>
                      ),
                    },
                  {
                    title: "PAGAMENTO",
                    body: (
                      <>
                        <p>
                          O CONTRATANTE pagará à CONTRATADA o valor fixado de acordo com o plano de serviço selecionado:
                        </p>
                        <p className="mt-1 font-bold text-[9.5pt]">
                          Valor do plano: {getDisplayPriceText()} ({getPriceExtenso()})
                        </p>
                        <p>
                          Data de vencimento: <strong>Todo dia {data.dueDate || "__"}</strong> de cada período subsequente.
                        </p>
                        <p className="mt-1">
                          O não pagamento poderá resultar em: suspensão do serviço, cancelamento do contrato, e cobrança judicial ou extrajudicial.
                        </p>
                      </>
                    ),
                  },
                  {
                    title: "INADIMPLÊNCIA",
                    body: (
                      <p>
                        O atraso no pagamento implicará em multa de 10%, juros de 1% ao mês e correção monetária. Após 15 dias de atraso, o serviço poderá ser suspenso.
                      </p>
                    ),
                  },
                  {
                    title: "PRAZO DE CONTRATO",
                    body: (
                      <p>
                        O presente contrato possui prazo mínimo de 12 meses. Após esse período, passa a vigorar por prazo indeterminado.
                      </p>
                    ),
                  },
                  {
                    title: "CANCELAMENTO",
                    body: (
                      <p>
                        Em caso de cancelamento antes do prazo mínimo, será cobrada multa correspondente a 30% do valor restante do contrato.{" "}
                        Por se tratar de equipamento adquirido em definitivo pelo CONTRATANTE, não haverá devolução do equipamento.
                      </p>
                    ),
                  },
                  // A cláusula de retirada do equipamento só existe no Comodato
                  // (ver `comodatoClauses`) — na Venda o equipamento é do
                  // cliente e não precisa ser devolvido.
                  {
                    title: "PRIVACIDADE E LGPD",
                    body: (
                      <p>
                        Os dados coletados pelo sistema de rastreamento serão utilizados exclusivamente para prestação do serviço, segurança do cliente, e atendimento e suporte. A CONTRATADA compromete-se a cumprir a Lei Geral de Proteção de Dados – LGPD (Lei 13.709/2018).
                      </p>
                    ),
                  },
                  {
                    title: "FORO",
                    body: (
                      <p>
                        Fica eleito o foro da comarca de <strong>Belo Horizonte – MG</strong> para dirimir quaisquer dúvidas decorrentes deste contrato.
                      </p>
                    ),
                  },
                ]).map((clause, index) => (
                  <div key={clause.title}>
                    <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                      CLÁUSULA {index + 1}{data.serviceType === "comodato" ? "ª" : ""} – {clause.title}
                    </h4>
                    {clause.body}
                  </div>
                ))}

              </div>

              {/* ASSINATURA */}
              <div className="mt-6" style={{ pageBreakBefore: "auto", pageBreakInside: "avoid", breakInside: "avoid" }}>

                {/* Faixa local/data */}
                <div className="bg-zinc-100 border border-zinc-200 rounded-md px-4 py-2.5 mb-5 flex items-center justify-between">
                  <p className="text-[8pt] text-zinc-600 leading-relaxed max-w-[58%]">
                    O CONTRATANTE declara que leu e compreendeu integralmente as cláusulas deste instrumento, anuindo expressamente com todas as suas condições.
                  </p>
                  <p className="text-[8.5pt] font-semibold text-zinc-800 text-right">
                    Belo Horizonte – MG<br />
                    {/* BUG FIX: converte YYYY-MM-DD → DD/MM/AAAA para exibição */}
                    <span className="font-bold text-zinc-900">{isoToBR(data.contractDate) || "___/___/_____"}</span>
                  </p>
                </div>

                {/* Linha separadora decorativa */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-1 h-px bg-zinc-300"></div>
                  <span className="text-[7pt] font-bold uppercase tracking-widest text-zinc-400 px-2">Assinaturas</span>
                  <div className="flex-1 h-px bg-zinc-300"></div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-center text-[9pt]">

                  <div className="flex flex-col items-center">
                    <div className="h-14 flex items-center justify-center w-full border-b-2 border-zinc-700 mb-1.5">
                      {contratadaSignatureImage ? (
                        <img
                          src={contratadaSignatureImage}
                          alt="Assinatura da Contratada"
                          className="max-h-12 object-contain"
                        />
                      ) : (
                        <span className="text-[7pt] text-zinc-400 italic">Assinatura da Contratada</span>
                      )}
                    </div>
                    <p className="font-bold text-zinc-900 text-[8.5pt]">GRUPO PROTECT LTDA</p>
                    <p className="text-[7pt] text-zinc-500 font-mono mt-0.5">CNPJ: 42.818.864/0001-65</p>
                    {data.serviceType === "comodato" && (
                      <p className="text-[7pt] text-zinc-500 mt-0.5">
                        Representante: {data.contratadaRepName || "____________________"}<br />
                        CPF: {data.contratadaRepCpf || "____________________"}
                      </p>
                    )}
                    <span className="mt-1 text-[6.5pt] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">CONTRATADA</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-14 flex items-center justify-center w-full border-b-2 border-zinc-700 mb-1.5">
                      {signatureImage ? (
                        <img
                          src={signatureImage}
                          alt="Assinatura do Contratante"
                          className="max-h-12 object-contain"
                        />
                      ) : (
                        <span className="text-[7pt] text-zinc-400 italic">Assinatura do Contratante</span>
                      )}
                    </div>
                    <p className="font-bold text-zinc-900 text-[8.5pt] truncate max-w-full">
                      {data.clientName || "CONTRATANTE"}
                    </p>
                    <p className="text-[7pt] text-zinc-500 font-mono mt-0.5">
                      {data.clientDoc ? `CPF/CNPJ: ${data.clientDoc}` : "CPF/CNPJ do Contratante"}
                    </p>
                    <span className="mt-1 text-[6.5pt] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">CONTRATANTE</span>
                  </div>

                </div>

                {/* TESTEMUNHAS */}
                <div className="flex items-center gap-2 mt-6 mb-4">
                  <div className="flex-1 h-px bg-zinc-200"></div>
                  <span className="text-[7pt] font-bold uppercase tracking-widest text-zinc-400 px-2">Testemunhas</span>
                  <div className="flex-1 h-px bg-zinc-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-center text-[9pt]">

                  <div className="flex flex-col items-center">
                    <img src="/assinatura.png" alt="Assinatura" className="h-14 w-auto object-contain mb-1" />
                    <p className="font-semibold text-zinc-800 text-[8pt] uppercase tracking-wider">Antonio C. Costa Junior</p>
                    {data.serviceType === "comodato" && (
                      <p className="text-[7pt] text-zinc-500 font-mono mt-0.5">CPF/CNPJ: {data.witness1Cpf || "____________________"}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <img src="/assinatura1.png" alt="Assinatura" className="h-14 w-auto object-contain mb-1" />
                    <p className="font-semibold text-zinc-800 text-[8pt] uppercase tracking-wider">Emerson N. do Carmo</p>
                    {data.serviceType === "comodato" && (
                      <p className="text-[7pt] text-zinc-500 font-mono mt-0.5">CPF/CNPJ: {data.witness2Cpf || "____________________"}</p>
                    )}
                  </div>

                </div>

                {/* Rodapé institucional */}
                <div className="mt-5 pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <p className="text-[7pt] text-zinc-400">
                    ProtectRastreamento.com · CNPJ 42.818.864/0001-65
                  </p>
                  <p className="text-[7pt] text-zinc-400">
                    +55 (31) 3371-8600 · info@protectrastreamento.com
                  </p>
                </div>

              </div>

            </article>
          </div>
        </div>
      </main>
    </div>
  );
}