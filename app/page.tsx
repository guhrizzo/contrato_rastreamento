"use client";

import React, { useState, useEffect } from "react";
import SignatureCanvas from "./components/SignatureCanvas";
import { User, Car, Settings, PenTool, Heart, Printer, FileDown, CheckCircle, AlertCircle, MapPin, Phone, Mail, Building2, IdCard, Zap, DollarSign, Calendar, Hash, X } from "lucide-react";

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
  trackerModel: string;
  installationFee: string;
  monthlyFee: string;
  dueDate: string;
  contractDate: string;
}

export default function Home() {
  // Inicializamos com dados de exemplo realistas para dar o WOW-factor imediato
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
    trackerModel: "",
    installationFee: "",
    monthlyFee: "",
    dueDate: "05",
    contractDate: "",
  });

  const [activeTab, setActiveTab] = useState<"client" | "vehicle" | "plan" | "signature">("client");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showPrintBlockDialog, setShowPrintBlockDialog] = useState(false);

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
      data.trackerModel.trim() !== "" &&
      data.installationFee.trim() !== "" &&
      data.monthlyFee.trim() !== "" &&
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

  // Previne a impressão via Ctrl+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowPrintBlockDialog(true);
        setTimeout(() => setShowPrintBlockDialog(false), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = async () => {
    const element = document.getElementById("contract-pdf");
    if (!element || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      // html2canvas-pro é um fork que suporta oklch(), oklab() e lab() do Tailwind CSS v4
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Renderiza o elemento HTML para um canvas de alta resolução
      const canvas = await html2canvas(element, {
        scale: 2.5,          // resolução premium super nítida
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        // Informa a largura/altura real do A4 para o engine
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Dimensões A4 em mm
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Calcula a altura proporcional da imagem em mm
      const canvasWidthMm = pdfWidth;
      const canvasHeightMm = (canvas.height * canvasWidthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Se o conteúdo for maior que uma página, pagina automaticamente
      if (canvasHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, canvasWidthMm, canvasHeightMm);
      } else {
        let yOffset = 0;
        let remainingHeight = canvasHeightMm;

        while (remainingHeight > 0) {
          pdf.addImage(imgData, "JPEG", 0, -yOffset, canvasWidthMm, canvasHeightMm);
          remainingHeight -= pdfHeight;
          yOffset += pdfHeight;
          if (remainingHeight > 0) pdf.addPage();
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
      setIsGeneratingPDF(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 lg:flex-row print-container">
      {/* MODAL DE BLOQUEIO DE IMPRESSÃO */}
      {showPrintBlockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-brand-black to-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-brand-yellow shrink-0" />
                <h2 className="text-lg font-bold text-white">Impressão Bloqueada</h2>
              </div>
              <button
                onClick={() => setShowPrintBlockDialog(false)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </button>
            </div>
            
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-zinc-700">
                A impressão direta via <strong>Ctrl+P</strong> não é permitida nesta aplicação.
              </p>
              <p className="text-sm text-zinc-600">
                Para imprimir o contrato com segurança, utilize o botão <strong className="text-brand-yellow">Imprimir</strong> no painel de controle após preencher todos os campos e realizar a assinatura.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <p className="text-xs text-blue-900 font-semibold">
                  ℹ️ Todos os dados devem estar preenchidos antes de imprimir ou salvar o PDF.
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setShowPrintBlockDialog(false)}
                className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-sm rounded-md transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAINEL DE CONTROLE (Oculto na impressão) ================= */}
      <aside className="w-full lg:w-[45%] xl:w-[38%] bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-auto lg:h-screen lg:sticky lg:top-0 no-print z-10 shadow-sm">
        
        {/* CABEÇALHO DO PAINEL */}
         <header className="p-6 bg-brand-black text-white flex flex-col gap-4 border-b-4 border-brand-yellow">
           <div className="flex items-center justify-between w-full">
             <div className="flex items-center gap-3">
               <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-8 w-auto" />
               <div>
                 <h1 className="font-extrabold text-lg uppercase tracking-wider flex items-center gap-1.5">
                   Protect<span className="text-brand-yellow"> Rastreamento</span>
                 </h1>
                 <p className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
                   Painel Corporativo de Contratos
                 </p>
               </div>
             </div>
             <div className="flex items-center gap-2">
               {isFormComplete() ? (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900 text-green-100 rounded-full text-xs font-semibold">
                   <CheckCircle className="w-4 h-4" />
                   Pronto para Assinar
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 text-amber-100 rounded-full text-xs font-semibold">
                   <AlertCircle className="w-4 h-4" />
                   Incomplete
                 </div>
               )}
             </div>
           </div>

          <div className="grid grid-cols-2 gap-3 w-full">
             <button
               onClick={handlePrint}
               disabled={isGeneratingPDF || !isFormComplete()}
               title={!isFormComplete() ? "Preencha todos os campos e adicione a assinatura para imprimir" : ""}
               className="flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-xs rounded-md shadow-md hover:shadow-lg transition-all duration-200 uppercase cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Printer className="w-4 h-4 shrink-0" />
               Imprimir
             </button>
             <button
               onClick={handleSavePDF}
               disabled={isGeneratingPDF || !isFormComplete()}
               title={!isFormComplete() ? "Preencha todos os campos e adicione a assinatura para salvar em PDF" : ""}
               className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg border border-zinc-700 transition-all duration-200 uppercase cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed"
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

        {/* FORMULÁRIO (Rolagem interna) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB: CONTRATANTE */}
          {activeTab === "client" && (
            <div className="space-y-4 animate-fadeIn">
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

          {/* TAB: DETALHES DO PLANO */}
          {activeTab === "plan" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Plano e Rastreamento
                </h3>
                <p className="text-xs text-zinc-500">Valores, modelo do rastreador e vencimentos</p>
              </div>

               <div className="grid grid-cols-1 gap-4">
                 <div className="flex flex-col">
                   <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                     <Zap className="w-3.5 h-3.5" />
                     Modelo do Rastreador
                   </label>
                   <input
                     type="text"
                     name="trackerModel"
                     value={data.trackerModel}
                     onChange={handleChange}
                     className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                     placeholder="Ex: OBD-II Smart Tracker 4G"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col">
                     <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                       <DollarSign className="w-3.5 h-3.5" />
                       Taxa de Adesão/Instalação (R$)
                     </label>
                     <input
                       type="text"
                       name="installationFee"
                       value={data.installationFee}
                       onChange={handleChange}
                       className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                       placeholder="Ex: 150,00"
                     />
                   </div>
                   <div className="flex flex-col">
                     <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                       <DollarSign className="w-3.5 h-3.5" />
                       Mensalidade (R$)
                     </label>
                     <input
                       type="text"
                       name="monthlyFee"
                       value={data.monthlyFee}
                       onChange={handleChange}
                       className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                       placeholder="Ex: 89,90"
                     />
                   </div>
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
                       className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                       placeholder="Ex: DD/MM/AAAA"
                     />
                   </div>
                 </div>
               </div>
            </div>
          )}

           {/* TAB: ASSINATURA */}
           {activeTab === "signature" && (
             <div className="space-y-4 animate-fadeIn">
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
                     <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Assinatura Capturada com Sucesso!</span>
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
             </div>
           )}

        </div>

        {/* FOOTER DO PAINEL */}
        <footer className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <a href="https://www.instagram.com/xfassessoria/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-black">
            Desenvolvido com <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" /> por X Family
          </a>
          <span className="font-semibold text-brand-black">Contrato R+ v1.0</span>
        </footer>

      </aside>

      {/* ================= CONTÊINER DA VISUALIZAÇÃO DO CONTRATO (LADO DIREITO) ================= */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto flex justify-center bg-zinc-100 min-h-screen">
        <div className="print-container w-full max-w-[210mm] transform scale-100 origin-top transition-transform duration-200">
          
          {/* A FOLHA A4 */}
          <article id="contract-pdf" className="a4-page shadow-2xl rounded-sm text-[11pt] leading-relaxed text-zinc-950 font-sans">
            
            {/* CABEÇALHO DO CONTRATO */}
            <div className="flex items-center justify-between border-b-2 border-brand-black pb-4 mb-6">
              <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-8 w-auto" />
              <div>
                <h1 className="font-extrabold text-base uppercase tracking-wider">
                  Protect<span className="text-brand-yellow"> Rastreamento</span>
                </h1>
                <div className="text-[7pt] text-zinc-500 uppercase tracking-wider font-semibold">
                  Segurança &amp; Rastreamento Veicular
                </div>
              </div>
            </div>
              </div>

              <div className="text-right">
                <div className="text-[8pt] font-bold text-zinc-700">INSTRUMENTO PARTICULAR</div>
                <div className="text-[7pt] font-semibold text-zinc-500 uppercase tracking-wider">CONTRATO DE COMODATO E SERVIÇOS</div>
              </div>
            </div>

            {/* TÍTULO DO CONTRATO */}
            <h2 className="text-center font-extrabold text-sm uppercase tracking-wide mb-6 border-b border-zinc-200 pb-2">
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MONITORAMENTO E RASTREAMENTO VEICULAR EM REGIME DE COMODATO
            </h2>

            {/* CORPO DO TEXTO */}
            <div className="space-y-4 text-justify text-[9pt] leading-normal text-zinc-800">
              
              {/* QUALIFICAÇÃO DA CONTRATADA */}
              <p>
                <strong>CONTRATADA:</strong> <strong>PROTECT RASTREAMENTO LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº <strong>12.345.678/0001-90</strong>, com sede na Avenida Paulista, nº 1000, CEP 01310-100, Bela Vista,  doravante denominada simplesmente <strong>CONTRATADA</strong>.
              </p>

              {/* QUALIFICAÇÃO DO CONTRATANTE */}
              <p>
                <strong>CONTRATANTE:</strong> <strong>{data.clientName || "___________________________________________"}</strong>, 
                inscrito(a) no CPF/CNPJ sob o nº <strong>{data.clientDoc || "_____________________"}</strong>, 
                portador(a) do RG/CNH nº <strong>{data.clientRg || "_____________________"}</strong>, 
                residente e domiciliado(a) na <strong>{data.clientAddress || "_________________________________"}</strong>, 
                nº <strong>{data.clientNumber || "_______"}</strong>, {data.clientComp && <span>compl. <strong>{data.clientComp}</strong>,</span>} 
                Bairro <strong>{data.clientBairro || "_________________"}</strong>, na cidade de <strong>{data.clientCity || "_________________"}</strong> - <strong>{data.clientState || "___"}</strong>, 
                CEP <strong>{data.clientCep || "________"}</strong>, celular/WhatsApp <strong>{data.clientPhone || "_________________"}</strong>, 
                e-mail <strong>{data.clientEmail || "_________________________________"}</strong>, doravante denominado simplesmente <strong>CONTRATANTE</strong>.
              </p>

              <p>
                As partes acima identificadas têm, entre si, justo e acertado o presente Contrato, que se regerá pelas cláusulas e condições seguintes:
              </p>

              {/* CLÁUSULAS */}
              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA PRIMEIRA – DO OBJETO
                </h4>
                <p>
                  1.1. O presente instrumento tem por objeto a prestação de serviços de rastreamento veicular pela <strong>CONTRATADA</strong>, bem como a cessão em regime de <strong>COMODATO</strong> (empréstimo gratuito) de 01 (um) equipamento rastreador modelo <strong>{data.trackerModel || "GPS/GPRS"}</strong> de propriedade da CONTRATADA, a ser instalado no veículo de propriedade do CONTRATANTE adiante descrito:
                </p>

              </div>

              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA SEGUNDA – DO COMODATO DO EQUIPAMENTO
                </h4>
                <p>
                  2.1. O equipamento rastreador descrito na cláusula anterior é de propriedade exclusiva da <strong>CONTRATADA</strong> e é entregue ao <strong>CONTRATANTE</strong> a título de COMODATO exclusivamente para a vigência deste contrato. 
                  2.2. O CONTRATANTE obriga-se a conservar o equipamento em perfeito estado de funcionamento e conservação. Em caso de rescisão do contrato, por qualquer motivo, o CONTRATANTE compromete-se a devolver o equipamento nas mesmas condições em que o recebeu em até 10 (dez) dias úteis, sob pena de incorrer em multa equivalente ao valor de custo do equipamento, estipulado em R$ 450,00 (quatrocentos e cinquenta reais).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA TERCEIRA – DO FUNCIONAMENTO E LIMITAÇÕES DO SERVIÇO
                </h4>
                <p>
                  3.1. A tecnologia utilizada pela CONTRATADA consiste na transmissão de dados via rede celular GSM/GPRS e localização via satélite GPS. 
                  3.2. O CONTRATANTE declara-se ciente de que o serviço poderá sofrer interrupções ou falhas decorrentes de fatores fora do controle da CONTRATADA, tais como ausência de sinal de telefonia celular no local, áreas de sombra, condições atmosféricas adversas ou ações intencionais de terceiros utilizando bloqueadores de sinal ("jammers"). 
                  3.3. O rastreamento veicular é uma ferramenta auxiliar de segurança, <strong>NÃO constituindo seguro contra roubo ou furto</strong>, não cabendo qualquer obrigação de indenização à CONTRATADA em caso de sinistro veicular.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA QUARTA – DOS VALORES E FORMA DE PAGAMENTO
                </h4>
                <p>
                  4.1. Como contraprestação pelos serviços de monitoramento e cessão do equipamento, o <strong>CONTRATANTE</strong> pagará à <strong>CONTRATADA</strong>:
                </p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li>Taxa de instalação/ativação no valor de <strong>R$ {data.installationFee || "___,__"}</strong> paga em parcela única na assinatura deste contrato.</li>
                  <li>Mensalidade recorrente no valor de <strong>R$ {data.monthlyFee || "___,__"}</strong>, vencendo no <strong>dia {data.dueDate || "__"}</strong> de cada mês subsequente ao início dos serviços.</li>
                </ul>
                <p className="mt-1">
                  4.2. O atraso no pagamento acarretará multa de 2% (dois por cento) sobre o valor da mensalidade acrescido de juros de mora de 1% ao mês. O inadimplemento superior a 15 (quinze) dias ensejará a suspensão dos serviços e acima de 30 (trinta) dias a rescisão contratual imediata e encaminhamento aos órgãos de proteção ao crédito.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA QUINTA – VIGÊNCIA E RESCISÃO
                </h4>
                <p>
                  5.1. O presente instrumento vigorará pelo prazo determinado de <strong>12 (doze) meses</strong>, contados da data de instalação, renovando-se automaticamente por igual período caso nenhuma das partes se manifeste por escrito em contrário com antecedência de 30 dias.
                  5.2. O cancelamento antecipado por iniciativa do CONTRATANTE sem justa causa ensejará multa rescisória equivalente a 20% (vinte por cento) das parcelas restantes para o término da vigência regulamentar do contrato.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 border-l-2 border-brand-yellow pl-1.5 mb-1.5 uppercase text-[8pt] tracking-wider print:border-black">
                  CLÁUSULA SEXTA – DO FORO
                </h4>
                <p>
                  6.1. Fica eleito o foro da Comarca do domicílio do CONTRATANTE para dirimir qualquer dúvida ou controvérsia decorrente da interpretação ou execução deste instrumento de comum acordo.
                </p>
              </div>

            </div>

            {/* SEÇÃO DE ASSINATURA (Evitar quebra de página se possível) */}
            <div className="mt-8 pt-8 border-t border-zinc-200 avoid-break flex flex-col justify-end grow">

              <div className="grid grid-cols-2 gap-12 text-center text-[9pt] mt-6">
                
                {/* REPRESENTANTE CONTRATADA */}
                <div className="flex flex-col items-center">
                 <div className="h-16"></div>
                  <div className="w-4/5 border-t border-zinc-400 my-1"></div>
                  <p className="font-bold text-zinc-900">PROTECT RASTREAMENTO</p>
                  <p className="text-[7.5pt] text-zinc-500 uppercase tracking-wider font-semibold">Representante Legal</p>
                </div>

                {/* CLIENTE CONTRATANTE */}
                <div className="flex flex-col items-center">
                  <div className="h-16 flex items-center justify-center">
                    {signatureImage ? (
                      <img
                        src={signatureImage}
                        alt="Assinatura do Contratante"
                        className="max-h-16 object-contain"
                      />
                    ) : (
                      <div className="text-[7.5pt] text-zinc-400 italic">Aguardando assinatura digital...</div>
                    )}
                  </div>
                  <div className="w-4/5 border-t border-zinc-400 my-1"></div>
                  <p className="font-bold text-zinc-900 truncate max-w-full">
                    {data.clientName || "CONTRATANTE"}
                  </p>
                  <p className="text-[7.5pt] text-zinc-500 uppercase tracking-wider font-semibold">Contratante</p>
                  {data.clientDoc && <p className="text-[7.5pt] text-zinc-500 font-mono">CPF/CNPJ: {data.clientDoc}</p>}
                </div>

              </div>
            </div>

          </article>
        </div>
      </main>
    </div>
  );
}
