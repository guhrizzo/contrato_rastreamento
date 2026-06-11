"use client"

import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "./components/SignatureCanvas";
import { User, Car, Settings, PenTool, Heart, Printer, FileDown, CheckCircle, AlertCircle, MapPin, Phone, Mail, Building2, IdCard, Zap, DollarSign, Calendar, Hash, X, ChevronDown, AlertTriangle, Info } from "lucide-react";

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
  dueDate: string;
  contractDate: string;
}

const PLANS = [
  { id: "basico_4g_moto", name: "Rastreamento Básico 4G (Moto) - Mensal", priceText: "R$ 59,90", detailText: "R$ 59,90 mensais", tracker: "Básico 4G (Moto)", billing: "Mensal" },
  { id: "basico_4g_carro", name: "Rastreamento Básico 4G (Carro) - Mensal", priceText: "R$ 69,90", detailText: "R$ 69,90 mensais", tracker: "Básico 4G (Carro)", billing: "Mensal" },
  { id: "basico_4g_bloqueio", name: "Rastreamento Básico 4G (Com Bloqueio) - Mensal", priceText: "R$ 79,90", detailText: "R$ 79,90 mensais", tracker: "Básico 4G com Bloqueio", billing: "Mensal" },
  { id: "basico_tag_anual", name: "Rastreamento Básico TAG - Anual", priceText: "R$ 399,90", detailText: "R$ 399,90 anuais", tracker: "Básico TAG", billing: "Anual" },
  { id: "obd2_4g_mensal", name: "Rastreamento OBD2 4G - Mensal", priceText: "R$ 69,90", detailText: "R$ 69,90 mensais", tracker: "OBD2 4G", billing: "Mensal" },
  { id: "frota_telemetria", name: "Rastreamento Frota + Telemetria", priceText: "A partir de R$ 89,90 (Preço sob consulta)", detailText: "A partir de R$ 89,90 (preço sob consulta)", tracker: "Frota + Telemetria", billing: "Mensal (sob consulta)" },
  { id: "satelital", name: "Rastreamento Satelital", priceText: "Preço sob consulta", detailText: "Preço sob consulta", tracker: "Satelital", billing: "Sob consulta" },
  { id: "video_monitoramento", name: "Video Monitoramento", priceText: "Preço sob consulta", detailText: "Preço sob consulta", tracker: "Vídeo Monitoramento", billing: "Sob consulta" },
];

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
    dueDate: "05",
    contractDate: "",
  });

  const [activeTab, setActiveTab] = useState<"client" | "vehicle" | "plan" | "signature">("client");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showPrintBlockDialog, setShowPrintBlockDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);

  // States para responsividade no celular
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [contractHeight, setContractHeight] = useState<number>(1123);
  const contractRef = useRef<HTMLDivElement | null>(null);

  // Listener para redimensionamento de janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const scale = windowWidth < 794 ? (windowWidth - 32) / 794 : 1;

  // States para envio de email
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

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
      data.contractDate.trim() !== "" &&
      signatureImage !== null
    );
  };

  // Define a data atual no formato DD/MM/AAAA por padrão
  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    setData((prev) => ({
      ...prev,
      contractDate: prev.contractDate || `${day}/${month}/${year}`,
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
      // Bloqueio de Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }

      // Bloqueio de F12 - Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }

      // Bloqueio de Ctrl+Shift+I - Developer Tools (Chrome, Firefox)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }

      // Bloqueio de Ctrl+Shift+C - Element Inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }

      // Bloqueio de Ctrl+Shift+J - Console (Chrome)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }

      // Bloqueio de Ctrl+Shift+K - Console (Firefox)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }
    };

    // Previne o menu de contexto (clique direito) - GLOBAL
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      showBlockDialog();
      return false;
    };

    // Bloqueia seleção de texto para proteger o contrato
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('aside')) {
        e.preventDefault();
        return false;
      }
    };

    // Bloqueia cópia de dados do contrato
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#contract-pdf')) {
        e.preventDefault();
        return false;
      }
    };

    // Bloqueia corte de dados
    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#contract-pdf')) {
        e.preventDefault();
        return false;
      }
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
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignatureSave = (signatureBase64: string) => {
    setSignatureImage(signatureBase64);
  };

  const handleSignatureClear = () => {
    setSignatureImage(null);
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
      // Obtém o HTML do contrato
      const element = document.getElementById("contract-pdf");
      if (!element) {
        throw new Error("Contrato não encontrado");
      }

      let htmlContent = element.innerHTML;
      
      // Remove todas as tags <img> do HTML para o e-mail
      htmlContent = htmlContent.replace(/<img[^>]*>/g, "");
      
      const response = await fetch("/api/send-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientEmail: data.clientEmail,
          clientName: data.clientName,
          contractHtml: htmlContent,
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
      setTermsAccepted(false);

      // Mostra mensagem de sucesso
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

  const handleSavePDF = async () => {
    const element = document.getElementById("contract-pdf");
    if (!element || isGeneratingPDF || !isFormComplete() || !emailSent) return;

    setIsGeneratingPDF(true);

    // Criar um clone temporário e anexar ao body off-screen para captura correta
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.display = 'block';
    clone.style.width = '794px'; // Largura aproximada de A4 em pixels
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    document.body.appendChild(clone);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(clone, {
        scale: 1.7,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: clone.scrollHeight,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdfWidth = 210;
      const pdfHeight = 297;

      const canvasWidthMm = pdfWidth;
      const canvasHeightMm = (canvas.height * canvasWidthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const marginTop = 0;
      const marginBottom = 0;

      if (canvasHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, marginTop, canvasWidthMm, canvasHeightMm);
      } else {
        const pageHeightInCanvas = (pdfHeight * canvas.width) / canvasWidthMm;
        let currentPage = 1;
        let currentYPosition = 0;

        while (currentYPosition < canvas.height) {
          const heightToCrop = Math.min(pageHeightInCanvas, canvas.height - currentYPosition);

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = heightToCrop;

          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, currentYPosition,
              canvas.width, heightToCrop,
              0, 0,
              canvas.width, heightToCrop
            );
          }

          const croppedImgData = tempCanvas.toDataURL("image/jpeg", 0.98);

          if (currentPage > 1) {
            pdf.addPage();
          }

          const heightInMm = (heightToCrop * canvasWidthMm) / canvas.width;
          pdf.addImage(croppedImgData, "JPEG", 0, marginTop, canvasWidthMm, heightInMm);

          currentYPosition += heightToCrop;
          currentPage++;
        }
      }

      const fileName = `Contrato_Rastreamento_${
        data.clientName.trim().replace(/\s+/g, "_") || "Cliente"
      }.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      document.body.removeChild(clone);
      setIsGeneratingPDF(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === data.selectedPlan) || PLANS[0];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 lg:flex-row print-container select-none" onContextMenu={(e) => { e.preventDefault(); }}>
      {/* SELETOR MOBILE */}
      <div className="flex lg:hidden sticky top-0 bg-brand-black border-b border-zinc-800 z-30 no-print shadow-md">
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            mobileTab === "form"
              ? "border-brand-yellow text-brand-yellow bg-zinc-900/10"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Editar Contrato
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "border-brand-yellow text-brand-yellow bg-zinc-900/10"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Visualizar Documento
        </button>
      </div>

      {/* MODAL DE BLOQUEIO */}
      {showPrintBlockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-brand-black to-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-brand-yellow shrink-0" />
                <h2 className="text-lg font-bold text-white">Proteção Ativa</h2>
              </div>
              <button
                onClick={() => setShowPrintBlockDialog(false)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
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
                className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black cursor-pointer font-bold text-sm rounded-md transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL DE CONTROLE */}
      <aside className={`w-full lg:w-[45%] xl:w-[38%] bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-auto lg:h-screen lg:sticky lg:top-0 no-print z-10 shadow-sm ${mobileTab === 'form' ? 'flex' : 'hidden lg:flex'}`}>

        {/* CABEÇALHO */}
        <header className="p-6 bg-brand-black text-white flex flex-col gap-4 border-b-4 border-brand-yellow">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-7 w-auto shrink-0" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wider leading-tight text-white">
                  Protect<span className="text-brand-yellow"> Rastreamento</span>
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
            <div className="mt-3.5 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[10px] text-amber-300 font-semibold leading-normal flex gap-2.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
              <span>
                A impressão e download do PDF só serão liberados após você preencher todos os dados, assinar e clicar em <strong className="text-brand-yellow font-bold">Enviar por Email</strong> na aba "Assinar".
              </span>
            </div>
          )}
        </header>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="flex bg-zinc-100 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("client")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "client"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
            }`}
          >
            <User className="w-4 h-4" /> Cliente
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "plan"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
            }`}
          >
            <Settings className="w-4 h-4" /> Plano
          </button>

          <button
            onClick={() => setActiveTab("signature")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "signature"
                ? "bg-white border-brand-black text-brand-black"
                : "border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50"
            }`}
          >
            <PenTool className="w-4 h-4" /> Assinar
          </button>
        </nav>

        {/* FORMULÁRIO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB: CLIENTE */}
          {activeTab === "client" && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Dados do Contratante
                </h3>
                <p className="text-xs text-zinc-500">Insira os dados cadastrais do cliente</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Nome Completo / Razão Social
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={data.clientName}
                    onChange={handleChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Ex: Gustavo Sauro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      name="clientDoc"
                      value={data.clientDoc}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 000.000.000-00"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      RG ou CNH
                    </label>
                    <input
                      type="text"
                      name="clientRg"
                      value={data.clientRg}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 00.000.000-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      name="clientPhone"
                      value={data.clientPhone}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={data.clientEmail}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: cliente@provedor.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Endereço (Rua, Av.)
                    </label>
                    <input
                      type="text"
                      name="clientAddress"
                      value={data.clientAddress}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Av. Paulista"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      Número
                    </label>
                    <input
                      type="text"
                      name="clientNumber"
                      value={data.clientNumber}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: 1000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="clientComp"
                      value={data.clientComp}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Apto 12"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="clientBairro"
                      value={data.clientBairro}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="clientCity"
                      value={data.clientCity}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Estado
                    </label>
                    <input
                      type="text"
                      name="clientState"
                      value={data.clientState}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    CEP
                  </label>
                  <input
                    type="text"
                    name="clientCep"
                    value={data.clientCep}
                    onChange={handleChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Ex: 01000-000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANO */}
          {activeTab === "plan" && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Plano e Rastreamento
                </h3>
                <p className="text-xs text-zinc-500">Selecione o plano de rastreamento e vencimentos</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col relative">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Plano de Rastreamento
                  </label>
                  
                  {/* Botão de Controle do Dropdown */}
                  <button
                    type="button"
                    onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                    className="w-full flex items-center justify-between text-left p-3.5 border border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 active:bg-zinc-100 focus:outline-none focus:border-brand-black transition-all duration-150 cursor-pointer shadow-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Plano Selecionado</span>
                      <span className="text-sm font-bold text-zinc-900 leading-tight">{activePlan.name}</span>
                      <span className="text-xs text-zinc-500 font-semibold">{activePlan.tracker} ({activePlan.billing})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-brand-yellow/15 text-brand-black border border-brand-yellow/30 font-bold text-xs rounded-full shadow-2xs whitespace-nowrap">
                        {activePlan.priceText}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${isPlanDropdownOpen ? 'transform rotate-180 text-brand-black' : ''}`} />
                    </div>
                  </button>

                  {/* Backdrop para fechar ao clicar fora */}
                  {isPlanDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsPlanDropdownOpen(false)}
                    />
                  )}

                  {/* Lista de Opções Premium */}
                  {isPlanDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-zinc-200/90 rounded-lg shadow-xl max-h-[320px] overflow-y-auto divide-y divide-zinc-100/80 animate-in fade-in slide-in-from-top-2 duration-150">
                      {PLANS.map((plan) => {
                        const isSelected = plan.id === data.selectedPlan;
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => {
                              setData((prev) => ({ ...prev, selectedPlan: plan.id }));
                              setIsPlanDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between text-left p-3.5 hover:bg-zinc-50 active:bg-zinc-100/80 transition-colors cursor-pointer ${
                              isSelected ? 'bg-amber-50/40 border-l-4 border-l-brand-yellow' : 'border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex flex-col gap-0.5 pr-2">
                              <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-zinc-950' : 'text-zinc-800'}`}>
                                {plan.name}
                              </span>
                              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                                {plan.tracker} • {plan.billing}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 ${
                              isSelected 
                                ? 'bg-brand-yellow text-brand-black border-brand-yellow shadow-2xs' 
                                : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                            }`}>
                              {plan.priceText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Dia de Vencimento
                    </label>
                    <select
                      name="dueDate"
                      value={data.dueDate}
                      onChange={handleChange}
                      className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 cursor-pointer"
                    >
                      <option value="05">Todo dia 05</option>
                      <option value="10">Todo dia 10</option>
                      <option value="15">Todo dia 15</option>
                      <option value="20">Todo dia 20</option>
                      <option value="25">Todo dia 25</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Data do Contrato
                    </label>
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
            </div>
          )}

          {/* TAB: ASSINATURA */}
          {activeTab === "signature" && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Assinatura Digital
                </h3>
                <p className="text-xs text-zinc-500">Desenhe a assinatura do cliente abaixo para incluí-la no contrato</p>
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

              <div className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm">
                <SignatureCanvas
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

              {/* SEÇÃO DE TERMOS E ENVIO POR EMAIL */}
              {renderTermsSection()}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <a href="https://www.instagram.com/xfassessoria/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-black">
            Desenvolvido com <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" /> por X Family
          </a>
          <span className="font-semibold text-brand-black">Contrato R+ v1.0</span>
        </footer>
      </aside>

      {/* CONTÊINER DO CONTRATO */}
      <main 
        className={`flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto flex justify-center bg-zinc-100 min-h-screen select-none ${
          mobileTab === "preview" ? "flex" : "hidden lg:flex"
        }`} 
        style={{ userSelect: "none" }}
      >
        <div 
          className="a4-wrapper" 
          style={{ height: windowWidth < 794 ? `${contractHeight * scale}px` : "auto" }}
        >
          <div 
            className="print-container w-full max-w-[210mm] transition-transform duration-200"
            style={{
              transform: windowWidth < 794 ? `scale(${scale})` : "none",
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
                    <h1 className="font-extrabold text-base uppercase tracking-wider">
                      Protect<span className="text-brand-yellow"> Rastreamento</span>
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
                CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE RASTREAMENTO VEICULAR
              </h2>

              {/* CORPO */}
              <div className="space-y-4 text-justify text-[9pt] leading-normal text-zinc-800">

                <p>
                  <strong>CONTRATADA:</strong> <strong>GRUPO PROTECT LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob nº <strong>42.818.864/0001-65</strong>, nome fantasia <strong>ProtectRastreamento.com</strong>, com sede na Rua General Andrade Neves, 622 – Bairro Grajaú – Belo Horizonte – MG – CEP 30431-128, telefone +55 (31) 3371-8600, e-mail info@protectrastreamento.com, doravante denominada simplesmente <strong>CONTRATADA</strong>.
                </p>

                <p>
                  <strong>CONTRATANTE:</strong><br/>
                  Nome: <strong>{data.clientName || "___________________________________________"}</strong><br/>
                  CPF/CNPJ: <strong>{data.clientDoc || "_____________________"}</strong><br/>
                  Endereço: <strong>{data.clientAddress || "_________________________________"}, nº {data.clientNumber || "___"} - {data.clientBairro || "_________"} - {data.clientCity || "_______"}/{data.clientState || "__"} - CEP {data.clientCep || "________"}</strong><br/>
                  Telefone: <strong>{data.clientPhone || "_________________"}</strong><br/>
                  E-mail: <strong>{data.clientEmail || "_________________________________"}</strong>
                </p>

                <p>
                  As partes resolvem firmar o presente Contrato de Prestação de Serviços de Rastreamento Veicular, mediante as seguintes cláusulas:
                </p>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 1 – OBJETO
                  </h4>
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
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 2 – NATUREZA DO SERVIÇO
                  </h4>
                  <p>
                    A CONTRATADA não é seguradora. O serviço prestado consiste exclusivamente em rastreamento e monitoramento do veículo, não havendo garantia de:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5 text-[8.5pt]">
                    <li>Recuperação do veículo em caso de furto ou roubo</li>
                    <li>Prevenção de crimes</li>
                    <li>Funcionamento contínuo em locais sem cobertura de sinal.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 3 – LIMITAÇÃO DE RESPONSABILIDADE
                  </h4>
                  <p>
                    A CONTRATADA não será responsável por perdas ou danos, incluindo: roubo ou furto do veículo, danos materiais, lucros cessantes, interrupções de sinal, falhas de rede GSM/GPS, e bloqueio de sinal por terceiros. A CONTRATADA compromete-se apenas a empregar os recursos tecnológicos disponíveis para auxiliar na localização do veículo.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 4 – EQUIPAMENTO EM COMODATO
                  </h4>
                  <p>
                    O equipamento rastreador instalado no veículo permanece como propriedade exclusiva da CONTRATADA, sendo cedido ao CONTRATANTE em regime de comodato. O CONTRATANTE compromete-se a não violar ou remover o equipamento, não permitir que terceiros manipulem o dispositivo, e comunicar imediatamente qualquer problema. Em caso de dano, perda ou retirada indevida, o CONTRATANTE deverá pagar o valor do equipamento.
                  </p>
                  <p className="mt-1 text-[8.5pt]">
                    <strong>Tipo de Serviço / Plano selecionado:</strong> {activePlan.name} (Equipamento: {activePlan.tracker})
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 5 – PAGAMENTO
                  </h4>
                  <p>
                    O CONTRATANTE pagará à CONTRATADA o valor mensal fixado de acordo com o plano de serviço selecionado:
                  </p>
                  <p className="mt-1 font-bold text-[9.5pt]">
                    Mensalidade: {activePlan.priceText} ({activePlan.detailText})
                  </p>
                  <p>
                    Data de vencimento: <strong>Todo dia {data.dueDate || "__"}</strong> de cada período subsequente.
                  </p>
                  <p className="mt-1">
                    O não pagamento poderá resultar em: suspensão do serviço, cancelamento do contrato, e cobrança judicial ou extrajudicial.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 6 – INADIMPLÊNCIA
                  </h4>
                  <p>
                    O atraso no pagamento implicará em multa de 2%, juros de 1% ao mês e correção monetária. Após 15 dias de atraso, o serviço poderá ser suspenso.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 7 – PRAZO DE CONTRATO
                  </h4>
                  <p>
                    O presente contrato possui prazo mínimo de 12 meses. Após esse período, passa a vigorar por prazo indeterminado.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 8 – CANCELAMENTO
                  </h4>
                  <p>
                    Em caso de cancelamento antes do prazo mínimo, será cobrada multa correspondente a 30% do valor restante do contrato. Também deverá ocorrer a devolução do equipamento rastreador.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 9 – RETIRADA DO EQUIPAMENTO
                  </h4>
                  <p>
                    Em caso de cancelamento, o CONTRATANTE deverá agendar a retirada do equipamento. Caso o equipamento não seja devolvido nas condições recebidas, será cobrado o valor padrão de <strong>R$ 1.000,00</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 10 – PRIVACIDADE E LGPD
                  </h4>
                  <p>
                    Os dados coletados pelo sistema de rastreamento serão utilizados exclusivamente para prestação do serviço, segurança do cliente, e atendimento e suporte. A CONTRATADA compromete-se a cumprir a Lei Geral de Proteção de Dados – LGPD (Lei 13.709/2018).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1 uppercase text-[8pt] tracking-wider print:border-black">
                    CLÁUSULA 11 – FORO
                  </h4>
                  <p>
                    Fica eleito o foro da comarca de <strong>Belo Horizonte – MG</strong> para dirimir quaisquer dúvidas decorrentes deste contrato.
                  </p>
                </div>

              </div>

              {/* ASSINATURA */}
              <div className="mt-6 pt-4 border-t border-zinc-200" style={{ pageBreakBefore: "auto", pageBreakInside: "avoid", breakInside: "avoid" }}>

                <div className="text-xs text-zinc-600 mb-6 font-semibold flex items-center justify-between">
                  <span>Declaração de Aceite: [X] Li e concordo com os termos deste contrato.</span>
                  <span>Local e data: Belo Horizonte, {data.contractDate || "___/___/_____"}</span>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-[9pt]">

                  <div className="flex flex-col items-center">
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[7.5pt] text-zinc-500 font-bold uppercase tracking-wider">CONTRATADA</span>
                    </div>
                    <div className="w-4/5 border-t border-zinc-400 mt-1 mb-1"></div>
                    <p className="font-bold text-zinc-900 text-[8.5pt]">GRUPO PROTECT LTDA</p>
                    <p className="text-[7pt] text-zinc-500 font-mono">CNPJ: 42.818.864/0001-65</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-16 flex items-center justify-center">
                      {signatureImage ? (
                        <img
                          src={signatureImage}
                          alt="Assinatura do Contratante"
                          className="max-h-12 object-contain"
                        />
                      ) : (
                        <div className="text-[7pt] text-zinc-400 italic font-medium">Aguardando assinatura digital...</div>
                      )}
                    </div>
                    <div className="w-4/5 border-t border-zinc-400 mt-1 mb-1"></div>
                    <p className="font-bold text-zinc-900 text-[8.5pt] truncate max-w-full">
                      {data.clientName || "CONTRATANTE"}
                    </p>
                    <p className="text-[7pt] text-zinc-500 font-mono">
                      {data.clientDoc ? `CPF/CNPJ: ${data.clientDoc}` : "CPF/CNPJ do Contratante"}
                    </p>
                  </div>

                </div>
              </div>

            </article>
          </div>
        </div>
      </main>
    </div>
  );
}