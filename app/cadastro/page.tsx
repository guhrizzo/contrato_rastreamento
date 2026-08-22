'use strict';
'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from '../components/SignatureCanvas';
import {
  User,
  FileText,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Printer,
  FileDown,
  X,
  AlertCircle,
  Building2,
  IdCard,
  Info,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HabilidadePreco {
  tipo: string;
  valor: number | '';
}

interface FormState {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cursoTecnico: boolean;
  nomeCursoTecnico: string;
  certificadoInstalacao: boolean;
  tiposInstalacao: string[];
  precosHabilidades: HabilidadePreco[];
  outrosInstalacao: string;
  cnpj: string;
  nomeContato: string;
  telefoneEmpresa: string;
  comentarios: string;
  formaPagamento: string;
  autorizacao: boolean;
}

// Estilos reutilizados pelas cláusulas do contrato (documento A4 à direita)
const clauseSectionStyle: React.CSSProperties = { marginBottom: '18px' };
const clauseHeaderStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#09090b',
  color: '#ffffff', padding: '8px 8px', marginBottom: '12px', letterSpacing: '0.05em',
};
const clauseSubHeaderStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#09090b',
  marginBottom: '6px', marginTop: '10px', letterSpacing: '0.03em',
};
const clauseBodyStyle: React.CSSProperties = { fontSize: '10.5px', color: '#3f3f46', lineHeight: 1.55, textAlign: 'justify' };
const clauseParaStyle: React.CSSProperties = { margin: '0 0 8px 0' };
const clauseListStyle: React.CSSProperties = { margin: '0 0 8px 0', paddingLeft: '18px' };

export default function CadastroInstalador() {
  const [formData, setFormData] = useState<FormState>({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    email: '',
    phone: '',
    cursoTecnico: false,
    nomeCursoTecnico: '',
    certificadoInstalacao: false,
    tiposInstalacao: [],
    precosHabilidades: [],
    outrosInstalacao: '',
    cnpj: '',
    nomeContato: '',
    telefoneEmpresa: '',
    comentarios: '',
    formaPagamento: '',
    autorizacao: false,
  });

  const MAX_DOCUMENTOS = 3;
  const [documentos, setDocumentos] = useState<{
    base64: string;
    nome: string;
    tipo: string;
  }[]>([]);

  const [showPrintBlockDialog, setShowPrintBlockDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [fichaNumero, setFichaNumero] = useState<number | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [contratanteSignatureImage, setContratanteSignatureImage] = useState<string | null>(null);

  // States para responsividade mobile
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Painel do formulário retrátil (desktop): permite ver a ficha em tela cheia
  const [panelOpen, setPanelOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('painelAberto:cadastro');
    if (saved === 'false') setPanelOpen(false);
  }, []);
  useEffect(() => {
    localStorage.setItem('painelAberto:cadastro', String(panelOpen));
  }, [panelOpen]);

  // Listener para redimensionamento de janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 869px = 230mm (largura real da folha em tela; ver .a4-page em globals.css)
  const scale = windowWidth < 869 ? (windowWidth - 32) / 869 : 1;

  const tiposDisponiveis = [
    'Motos e Veiculos',
    'Veiculos Elétricos',
    'Caminhões e Utilitários',
    'Identficação de Motoristas RFID e I-Button',
    'Perifericos, Teclados e Itens de Telemetria',
    'Instalações de Sensores e Bloqueadores',
    'Outros'
  ];

  // Proteção contra impressão e clique direito (Igual à home)
  useEffect(() => {
    const showBlockDialog = () => {
      setShowPrintBlockDialog(true);
      setTimeout(() => setShowPrintBlockDialog(false), 5000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        e.stopPropagation();
        showBlockDialog();
        return;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showBlockDialog();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof FormState) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleTipoInstalacaoChange = (tipo: string) => {
    setFormData(prev => {
      const existe = prev.tiposInstalacao.includes(tipo);
      const novaLista = existe
        ? prev.tiposInstalacao.filter(t => t !== tipo)
        : [...prev.tiposInstalacao, tipo];

      const novaListaPrecos: HabilidadePreco[] = existe
        ? prev.precosHabilidades.filter(p => p.tipo !== tipo)
        : [...prev.precosHabilidades, { tipo, valor: '' }];

      return { ...prev, tiposInstalacao: novaLista, precosHabilidades: novaListaPrecos };
    });
  };

  const handlePrecoChange = (tipo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      precosHabilidades: prev.precosHabilidades.map(p =>
        p.tipo === tipo ? { ...p, valor: valor === '' ? '' : Number(valor) } : p
      )
    }));
  };

  const formatCurrency = (valor: number | '' | undefined): string => {
    if (valor === '' || valor === undefined || valor === null || isNaN(Number(valor))) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(valor));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const vagas = MAX_DOCUMENTOS - documentos.length;
    if (vagas <= 0) {
      alert(`Você já anexou o máximo de ${MAX_DOCUMENTOS} documentos. Remova um para adicionar outro.`);
      e.target.value = '';
      return;
    }

    const aceitos = files.slice(0, vagas);
    if (files.length > vagas) {
      alert(`Só é possível anexar até ${MAX_DOCUMENTOS} documentos. Apenas os ${vagas} primeiros arquivos selecionados foram adicionados.`);
    }

    aceitos.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`O arquivo "${file.name}" excede o tamanho máximo permitido de 8MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentos((prev) => {
          if (prev.length >= MAX_DOCUMENTOS) return prev;
          return [...prev, { base64: reader.result as string, nome: file.name, tipo: file.type }];
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const isFormComplete = (): boolean => {
    return (
      formData.nomeCompleto.trim() !== '' &&
      formData.cpf.trim() !== '' &&
      formData.rg.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.tiposInstalacao.length > 0 &&
      (!formData.cursoTecnico || formData.nomeCursoTecnico.trim() !== '') &&
      formData.formaPagamento !== '' &&
      formData.autorizacao === true &&
      signatureImage !== null &&
      contratanteSignatureImage !== null
    );
  };

  const handleSignatureSave = (signatureBase64: string) => {
    setSignatureImage(signatureBase64);
  };

  const handleSignatureClear = () => {
    setSignatureImage(null);
  };

  const handleContratanteSignatureSave = (signatureBase64: string) => {
    setContratanteSignatureImage(signatureBase64);
  };

  const handleContratanteSignatureClear = () => {
    setContratanteSignatureImage(null);
  };

  const generateDocumentPdf = async () => {
    const element = document.getElementById("contract-pdf");
    if (!element) throw new Error("Elemento não encontrado");

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.display = 'block';
    clone.style.width = '794px';
    clone.style.minHeight = 'auto';
    clone.style.height = 'auto';
    clone.style.padding = '15mm';
    clone.style.transform = 'none';
    clone.style.overflow = 'hidden';
    document.body.appendChild(clone);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794,
        height: clone.scrollHeight,
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas gerado vazio.");
      }

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

      // O documento agora tem várias seções e pode ser bem mais alto que
      // uma única folha A4. Antes isso forçava tudo (texto, tabelas etc.)
      // a encolher para caber numa página só, ficando minúsculo. Aqui,
      // igual ao PDF da página "/", fatiamos o canvas em blocos do
      // tamanho de uma A4 e criamos uma página nova para cada bloco.
      if (canvasHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, canvasWidthMm, canvasHeightMm);
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
            tempCtx.drawImage(canvas, 0, currentYPosition, canvas.width, heightToCrop, 0, 0, canvas.width, heightToCrop);
          }

          const croppedImgData = tempCanvas.toDataURL("image/jpeg", 0.98);
          if (currentPage > 1) pdf.addPage();

          const heightInMm = (heightToCrop * canvasWidthMm) / canvas.width;
          pdf.addImage(croppedImgData, "JPEG", 0, 0, canvasWidthMm, heightInMm);

          currentYPosition += heightToCrop;
          currentPage++;
        }
      }

      return pdf;
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handleSavePDF = async () => {
    if (isGeneratingPDF || !isFormComplete() || !emailSent) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = await generateDocumentPdf();
      const fileName = `Ficha_Instalador_${formData.nomeCompleto.trim().replace(/\s+/g, "_") || "Instalador"}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Não foi possível gerar o PDF. Tente novamente. Erro: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    if (!isFormComplete() || !emailSent) {
      alert('Preencha todos os campos obrigatórios e envie o cadastro antes de imprimir.');
      return;
    }
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = await generateDocumentPdf();
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
      iframe.src = url;

      let printed = false;
      const cleanup = () => {
        URL.revokeObjectURL(url);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(cleanup, 1000);
      };

      iframe.onload = () => setTimeout(triggerPrint, 100);
      setTimeout(triggerPrint, 2000);
    } catch (err) {
      console.error("Erro ao imprimir:", err);
      alert("Não foi possível preparar a impressão. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios e aceite a declaração.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Gera o PDF do contrato completo (com todas as cláusulas) para
      // anexar ao e-mail — antes só os dados do formulário eram enviados,
      // sem o instrumento assinado.
      let contratoPdfBase64: string | null = null;
      const contratoPdfNome = `Contrato_Instalador_${formData.nomeCompleto.trim().replace(/\s+/g, "_") || "Instalador"}.pdf`;
      try {
        const pdf = await generateDocumentPdf();
        contratoPdfBase64 = pdf.output('datauristring');
      } catch (pdfErr) {
        console.error('Erro ao gerar PDF do contrato para o e-mail:', pdfErr);
      }

      const payload = {
        ...formData,
        documentos,
        assinaturaBase64: signatureImage || null,
        assinaturaContratanteBase64: contratanteSignatureImage || null,
        contratoPdfBase64,
        contratoPdfNome,
      };

      const response = await fetch('/api/send-installer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao enviar o formulário.');
      }

      if (data.fichaNumero) {
        setFichaNumero(data.fichaNumero);
      }
      setEmailSent(true);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 lg:flex-row print-container select-none" onContextMenu={(e) => { e.preventDefault(); }}>

      {/* SELETOR MOBILE */}
      <div className="flex lg:hidden sticky top-0 bg-brand-black border-b border-zinc-800 z-30 no-print shadow-md">
        <button
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${mobileTab === 'form'
              ? 'border-brand-yellow text-brand-yellow bg-zinc-900/10'
              : 'border-transparent text-zinc-400 hover:text-white'
            }`}
        >
          Editar Cadastro
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${mobileTab === 'preview'
              ? 'border-brand-yellow text-brand-yellow bg-zinc-900/10'
              : 'border-transparent text-zinc-400 hover:text-white'
            }`}
        >
          Visualizar Ficha
        </button>
      </div>

      {/* BOTÃO FLUTUANTE: reabrir painel do formulário (desktop) */}
      <AnimatePresence>
        {!panelOpen && (
          <motion.button
            key="reopen-panel"
            onClick={() => setPanelOpen(true)}
            title="Mostrar formulário de cadastro"
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
                A cópia e impressão direta estão desabilitadas por razões de segurança.
              </p>
              <p className="text-sm text-zinc-700">
                Para imprimir com segurança, envie o formulário por e-mail e use a opção oficial na barra de tarefas.
              </p>
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

      {/* COLUNA ESQUERDA: FORMULÁRIO */}
      <aside className={`w-full bg-white border-b lg:border-b-0 border-zinc-200 flex flex-col h-auto lg:max-h-screen lg:self-start lg:sticky lg:top-0 lg:min-w-0 no-print z-10 shadow-sm overflow-x-hidden transition-all duration-300 ease-in-out ${mobileTab === 'form' ? 'flex' : 'hidden'} ${panelOpen ? 'lg:flex lg:w-[54%] xl:w-[46%] lg:border-r lg:opacity-100' : 'lg:flex lg:w-0 lg:opacity-0 lg:border-r-0 lg:pointer-events-none'}`}>

        {/* CABEÇALHO DA BARRA LATERAL */}
        <header className="p-4 sm:p-6 bg-brand-black text-white flex flex-col gap-4 border-b-4 border-brand-yellow">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-7 w-auto shrink-0" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wider leading-tight text-white">
                  Protect<span className="text-brand-yellow">Rastreamento</span>.com
                </h1>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold tracking-wider sm:tracking-widest uppercase truncate">
                  Cadastro de Instalador
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isFormComplete() ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-950/80 border border-green-800 text-green-300 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
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
                <Home className="w-3.5 h-3.5" />
                Voltar ao site
              </a>
              <button
                onClick={() => setPanelOpen(false)}
                title="Ocultar formulário e ver a ficha em tela cheia"
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
                  ? "Preencha todos os campos antes de imprimir"
                  : !emailSent
                  ? "Envie o cadastro primeiro para liberar a impressão"
                  : "Imprimir contrato"
              }
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-xs rounded-md shadow-md hover:shadow-lg transition-all duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 shrink-0" />
                  Imprimir
                </>
              )}
            </button>
            <button
              onClick={handleSavePDF}
              disabled={!isFormComplete() || isGeneratingPDF || !emailSent}
              title={
                !isFormComplete()
                  ? "Preencha todos os campos antes de salvar PDF"
                  : !emailSent
                  ? "Envie o cadastro primeiro para liberar o PDF"
                  : "Salvar contrato em PDF"
              }
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg border border-zinc-700 transition-all duration-200 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
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
            <div className="mt-1 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[10px] text-amber-300 font-semibold leading-normal flex gap-2.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
              <span>
                A impressão e download da ficha só serão liberados após você preencher todos os dados obrigatórios e clicar em <strong className="text-brand-yellow font-bold">Enviar Cadastro</strong>.
              </span>
            </div>
          )}
        </header>

        {/* CONTEÚDO DO FORMULÁRIO (uma única aba contínua) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col space-y-8">

          {/* SEÇÃO: PESSOAL */}
          <div className="space-y-5">
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Dados do Instalador
                </h3>
                <p className="text-xs text-zinc-500">Insira suas informações pessoais de identificação</p>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                  placeholder="Nome completo do instalador"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5" /> CPF <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5" /> RG <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Apenas números"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> E-mail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Celular (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

          {/* SEÇÃO: HABILIDADES */}
          <div className="space-y-5">
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Experiência e Formação
                </h3>
                <p className="text-xs text-zinc-500">Certificações e tipos de rastreadores que instala</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-100 transition duration-150">
                  <input
                    type="checkbox"
                    checked={formData.cursoTecnico}
                    onChange={() => handleCheckboxChange('cursoTecnico')}
                    className="mt-0.5 h-4 w-4 rounded text-brand-black focus:ring-brand-black bg-white accent-brand-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">Possuo Curso Técnico</span>
                    <span className="text-[10px] text-zinc-500">Formação na área elétrica, eletrônica ou correlata</span>
                  </div>
                </label>

                {formData.cursoTecnico && (
                  <div className="flex flex-col pl-3 animate-fadeIn">
                    <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                      Qual curso técnico? <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nomeCursoTecnico"
                      value={formData.nomeCursoTecnico}
                      onChange={handleInputChange}
                      className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                      placeholder="Ex: Técnico em Eletrônica, Elétrica Automotiva..."
                    />
                  </div>
                )}

                <label className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md cursor-pointer hover:bg-zinc-100 transition duration-150">
                  <input
                    type="checkbox"
                    checked={formData.certificadoInstalacao}
                    onChange={() => handleCheckboxChange('certificadoInstalacao')}
                    className="mt-0.5 h-4 w-4 rounded text-brand-black focus:ring-brand-black bg-white accent-brand-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">Possuo Certificado de Instalação de Rastreadores</span>
                    <span className="text-[10px] text-zinc-500">Curso específico de dispositivos de telemetria</span>
                  </div>
                </label>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-2 block">
                  Tipos de Instalação Praticados <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {tiposDisponiveis.map(tipo => {
                    const isSelected = formData.tiposInstalacao.includes(tipo);
                    const precoAtual = formData.precosHabilidades.find(p => p.tipo === tipo)?.valor;
                    return (
                      <div
                        key={tipo}
                        className={`border rounded-md transition duration-150 ${isSelected
                            ? 'bg-amber-50/70 border-brand-yellow-dark text-amber-950 font-semibold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                      >
                        <label className="flex items-center gap-3 p-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTipoInstalacaoChange(tipo)}
                            className="h-4 w-4 accent-brand-yellow text-brand-black focus:ring-brand-black"
                          />
                          <span className="text-xs flex-1">{tipo}</span>
                        </label>
                        {isSelected && (
                          <div className="px-3 pb-3 pt-0 animate-fadeIn">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pl-7">
                              <label className="text-[10px] font-bold text-zinc-600 uppercase whitespace-nowrap">
                                Valor do Serviço (R$):
                              </label>
                              <div className="relative flex-1 max-w-[200px]">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-semibold pointer-events-none">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={precoAtual === undefined || precoAtual === '' ? '' : precoAtual}
                                  onChange={(e) => handlePrecoChange(tipo, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-9 pr-2 py-1.5 border border-zinc-300 rounded-md text-xs focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-white transition-all duration-150"
                                  placeholder="0,00"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {formData.tiposInstalacao.includes('Outros') && (
                <div className="flex flex-col animate-fadeIn">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                    Especifique os outros tipos de instalação <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="outrosInstalacao"
                    value={formData.outrosInstalacao}
                    onChange={handleInputChange}
                    rows={3}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 resize-none"
                    placeholder="Descreva sua experiência especial..."
                  />
                </div>
              )}
            </div>

          {/* SEÇÃO: PROFISSIONAL */}
          <div className="space-y-5">
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Histórico e Anexos
                </h3>
                <p className="text-xs text-zinc-500">Última empresa onde prestou serviços de instalação</p>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                    Nome de Contato
                  </label>
                  <input
                    type="text"
                    name="nomeContato"
                    value={formData.nomeContato}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefoneEmpresa"
                    value={formData.telefoneEmpresa}
                    onChange={handleInputChange}
                    className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase block">
                    Documentação de Apoio
                  </label>
                  <span className="text-[10px] font-semibold text-zinc-400">{documentos.length}/{MAX_DOCUMENTOS}</span>
                </div>

                {documentos.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {documentos.map((doc, index) => (
                      <div key={`${doc.nome}-${index}`} className="flex items-center justify-between gap-2 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="text-xs font-semibold text-zinc-800 truncate">{doc.nome}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocumento(index)}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition shrink-0 cursor-pointer"
                          aria-label={`Remover ${doc.nome}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {documentos.length < MAX_DOCUMENTOS && (
                  <label className="bg-zinc-50 border border-dashed border-zinc-300 rounded-lg p-5 text-center flex flex-col items-center cursor-pointer hover:bg-zinc-100 transition">
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    <span className="text-xs font-bold text-zinc-800">
                      Selecione certificados ou currículo
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1 mb-3 block">
                      PDF ou Imagem (Máx: 8MB cada) &middot; até {MAX_DOCUMENTOS} documentos
                    </span>
                    <span className="bg-white border border-zinc-300 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 min-h-[44px] rounded-md text-xs font-semibold shadow-sm transition flex items-center">
                      Upload de Documento
                    </span>
                    <input
                      type="file"
                      accept=".pdf, image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

          {/* SEÇÃO: FINALIZAR */}
          <div className="space-y-5">
              <div className="border-l-4 border-brand-yellow pl-3 mb-3">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Autorização e Envio
                </h3>
                <p className="text-xs text-zinc-500">Envie o cadastro completo para nossa aprovação</p>
              </div>

              <div className="flex flex-col mb-4">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-2 block">
                  Modo de Recebimento de Pagamentos <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {['PAGAMENTO MENSAL', 'PAGAMENTO QUINZENAL', 'OUTRO'].map(opcao => (
                    <label
                      key={opcao}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition duration-150 ${formData.formaPagamento === opcao
                          ? 'bg-amber-50/70 border-brand-yellow-dark text-amber-950 font-semibold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                    >
                      <input
                        type="radio"
                        name="formaPagamento"
                        value={opcao}
                        checked={formData.formaPagamento === opcao}
                        onChange={handleInputChange}
                        className="h-4 w-4 accent-brand-yellow text-brand-black focus:ring-brand-black"
                      />
                      <span className="text-xs">{opcao}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1.5">
                  Comentários / Observações
                </label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows={4}
                  className="p-3 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 resize-none"
                  placeholder="Instale periféricos adicionais ou observações..."
                />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 leading-relaxed flex gap-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  Ao clicar em <strong>Enviar Cadastro</strong>, suas informações serão validadas e transmitidas com segurança para a central da Protect Rastreamento.
                </span>
              </div>

              <div>
                <SignatureCanvas
                  label="Assinatura do Instalador"
                  onSave={handleSignatureSave}
                  onClear={handleSignatureClear}
                />
                {!signatureImage && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1.5">Assine no campo acima para poder enviar o cadastro.</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-px bg-zinc-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2">Protect</span>
                <div className="flex-1 h-px bg-zinc-200"></div>
              </div>

              <div>
                <SignatureCanvas
                  label="Assinatura da Contratante (Protect)"
                  onSave={handleContratanteSignatureSave}
                  onClear={handleContratanteSignatureClear}
                />
                {!contratanteSignatureImage && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1.5">Assine no campo acima para poder enviar o cadastro.</p>
                )}
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-3">
                <p className="text-[11px] text-zinc-600 leading-normal">
                  Declaro que as informações fornecidas neste formulário são verdadeiras e completas, autorizo a verificação dos dados aqui informados e concordo com o tratamento dos meus dados pessoais pela GRUPO PROTECT LTDA nos termos da Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018), conforme descrito no contrato.
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autorizacao}
                    onChange={() => handleCheckboxChange('autorizacao')}
                    className="h-5 w-5 accent-brand-yellow rounded text-brand-black focus:ring-brand-black"
                  />
                  <span className="text-xs font-bold text-zinc-800">Li e concordo com os termos e com o tratamento de dados (LGPD) <span className="text-rose-500">*</span></span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-900 flex gap-2 items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="font-semibold">Cadastro transmitido com sucesso!</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !isFormComplete()}
                className="w-full flex items-center justify-center cursor-pointer gap-2 py-3 px-4 bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-black font-extrabold text-xs uppercase rounded-md shadow-md transition duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando Cadastro...
                  </>
                ) : (
                  <>
                    Enviar Cadastro
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

        </div>

      </aside>

      {/* COLUNA DIREITA: DOCUMENTO DE VISUALIZAÇÃO A4 (Tempo real) */}
      <section
        className={`flex-1 overflow-y-auto bg-zinc-200 pt-0 pb-4 sm:pb-6 px-4 lg:pl-2 lg:pr-6 justify-center items-start lg:h-screen lg:sticky lg:top-0 ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}
      >
        <div
          className="a4-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            height: windowWidth < 869 ? `${1198 * scale}px` : 'auto'
          }}
        >
          <div id="contract-pdf" className="a4-page text-brand-black relative">

             {/* Cabeçalho do Documento */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #09090b', paddingBottom: '16px', marginBottom: '18px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <img src="/protectrastreamento.png" alt="Logo" style={{ height: '40px', width: 'auto', pointerEvents: 'auto' }} />
                 <div>
                   <h2 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.025em', lineHeight: 1, margin: 0, color: '#09090b' }}>
                     ProtectRastreamento.com
                   </h2>
                   <p style={{ fontSize: '9px', color: '#71717a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', margin: 0 }}>
                     Rede Credenciada de Instaladores
                   </p>
                 </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#facc15', border: '2px solid #09090b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#09090b' }}>
                    FICHA Nº {fichaNumero || 'PENDENTE'}
                 </div>
               </div>
             </div>

             <h3 style={{ textAlign: 'center', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', border: '2px solid #09090b', padding: '8px', marginBottom: '4px', backgroundColor: '#f4f4f5', color: '#09090b', margin: '0 0 4px 0' }}>
               Ficha Cadastral e Contrato de Prestação de Serviços de Instalação
             </h3>
             <p style={{ textAlign: 'center', fontSize: '9.5px', color: '#71717a', fontWeight: '700', letterSpacing: '0.03em', margin: '0 0 18px 0' }}>
               CONTRATANTE: GRUPO PROTECT LTDA &nbsp;·&nbsp; CONTRATADO: INSTALADOR / PRESTADOR DE SERVIÇOS
             </p>

             {/* SEÇÃO 1: IDENTIFICAÇÃO DAS PARTES */}
             <div style={clauseSectionStyle}>
               <h4 style={clauseHeaderStyle}>1. Identificação das Partes</h4>

               <p style={clauseSubHeaderStyle}>1.1. Contratante</p>
               <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '10px' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', width: '25%', textTransform: 'uppercase', fontSize: '11px' }}>Razão Social:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>GRUPO PROTECT LTDA</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>CNPJ:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>42.818.864/0001-65</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>Endereço:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>Rua General Andrade Neves, 622 – Bairro Grajaú – Belo Horizonte – MG – CEP 30431-128</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>Telefone:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>+55 (31) 3371-8600</td>
                   </tr>
                   <tr>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>E-mail:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>info@protectrastreamento.com</td>
                   </tr>
                 </tbody>
               </table>
               <p style={{ ...clauseBodyStyle, margin: '0 0 10px 0' }}>
                 Doravante denominada simplesmente <strong>CONTRATANTE</strong> ou <strong>GRUPO PROTECT LTDA</strong>.
               </p>

               <p style={clauseSubHeaderStyle}>1.2. Contratado – Instalador / Prestador de Serviços</p>
               <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', width: '25%', textTransform: 'uppercase', fontSize: '11px' }}>Nome Completo:</td>
                     <td style={{ padding: '8px', color: formData.nomeCompleto ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.nomeCompleto ? 'normal' : 'italic' }}>{formData.nomeCompleto || 'Não informado'}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>CPF / RG:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: '500' }}>
                       <span style={!formData.cpf ? { color: '#a1a1aa', fontStyle: 'italic' } : undefined}>{formData.cpf ? `CPF: ${formData.cpf}` : 'CPF não informado'}</span> &nbsp;|&nbsp;
                       <span style={!formData.rg ? { color: '#a1a1aa', fontStyle: 'italic' } : undefined}>{formData.rg ? `RG: ${formData.rg}` : 'RG não informado'}</span>
                     </td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>E-mail:</td>
                     <td style={{ padding: '8px', color: formData.email ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.email ? 'normal' : 'italic' }}>{formData.email || 'Não informado'}</td>
                   </tr>
                   <tr>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>WhatsApp:</td>
                     <td style={{ padding: '8px', color: formData.phone ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.phone ? 'normal' : 'italic' }}>{formData.phone || 'Não informado'}</td>
                   </tr>
                 </tbody>
               </table>
               <p style={{ ...clauseBodyStyle, margin: '8px 0 0 0' }}>
                 Doravante denominado simplesmente <strong>CONTRATADO</strong> ou <strong>INSTALADOR/PRESTADOR DE SERVIÇOS</strong>.
               </p>

               <p style={clauseSubHeaderStyle}>1.3. Da Identificação e Aceite das Partes</p>
               <div style={clauseBodyStyle}>
                 <p style={{ margin: 0 }}>
                   A <strong>CONTRATANTE</strong> e o <strong>CONTRATADO</strong>, devidamente identificados neste instrumento, têm entre si justo e acordado o presente <strong>Contrato de Prestação de Serviços de Instalação</strong>, mediante as cláusulas e condições estabelecidas neste instrumento e em seus anexos.
                 </p>
               </div>
             </div>

            {/* SEÇÃO 2: QUALIFICAÇÃO E EXPERIÊNCIA */}
             <div style={clauseSectionStyle}>
               <h4 style={clauseHeaderStyle}>
                 2. Qualificação e Experiência
               </h4>
               <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', width: '40%', textTransform: 'uppercase', fontSize: '11px' }}>Curso Técnico na Área:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: 'bold', fontSize: '12px' }}>
                       {formData.cursoTecnico ? `SIM [x] / NÃO [ ] — ${formData.nomeCursoTecnico || 'curso não informado'}` : 'SIM [ ] / NÃO [x]'}
                     </td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>Certificado em Rastreadores:</td>
                     <td style={{ padding: '8px', color: '#09090b', fontWeight: 'bold', fontSize: '12px' }}>{formData.certificadoInstalacao ? 'SIM [x] / NÃO [ ]' : 'SIM [ ] / NÃO [x]'}</td>
                   </tr>
                    <tr>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px', verticalAlign: 'top' }}>Habilidades declaradas e valores:</td>
                      <td style={{ padding: '8px', color: '#09090b', fontSize: '12px' }}>
                        {formData.tiposInstalacao.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
                            <tbody>
                              {formData.tiposInstalacao.map(t => {
                                const preco = formData.precosHabilidades.find(p => p.tipo === t)?.valor;
                                return (
                                  <tr key={t} style={{ borderBottom: '1px solid #e4e4e7' }}>
                                    <td style={{ padding: '4px 0', fontSize: '11px', fontWeight: '600', color: '#27272a' }}>✓ {t}</td>
                                    <td style={{ padding: '4px 0', fontSize: '11px', fontWeight: 'bold', color: '#09090b', textAlign: 'right' }}>{formatCurrency(preco)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <span style={{ color: '#a1a1aa' }}>Nenhum tipo de instalação selecionado</span>
                        )}
                        {formData.tiposInstalacao.includes('Outros') && formData.outrosInstalacao && (
                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', fontSize: '10px', color: '#52525b', borderRadius: '2px' }}>
                            <strong>Outros:</strong> {formData.outrosInstalacao}
                          </div>
                        )}
                      </td>
                    </tr>
                 </tbody>
               </table>
             </div>

             {/* SEÇÃO 3: EXPERIÊNCIA E REFERÊNCIA */}
             <div style={{ marginBottom: '18px' }}>
               <h4 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', backgroundColor: '#09090b', color: '#ffffff', padding: '8px 8px', marginBottom: '12px', letterSpacing: '0.05em' }}>
                 3. Última Empresa / Referência Comercial
               </h4>
               <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                 <tbody>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', width: '25%', textTransform: 'uppercase', fontSize: '11px' }}>CNPJ Parceiro:</td>
                     <td style={{ padding: '8px', color: formData.cnpj ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.cnpj ? 'normal' : 'italic' }}>{formData.cnpj || 'Não informado'}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>Nome Contato:</td>
                     <td style={{ padding: '8px', color: formData.nomeContato ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.nomeContato ? 'normal' : 'italic' }}>{formData.nomeContato || 'Não informado'}</td>
                   </tr>
                   <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                     <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px' }}>Telefone:</td>
                     <td style={{ padding: '8px', color: formData.telefoneEmpresa ? '#09090b' : '#a1a1aa', fontWeight: '500', fontStyle: formData.telefoneEmpresa ? 'normal' : 'italic' }}>{formData.telefoneEmpresa || 'Não informado'}</td>
                   </tr>
                 </tbody>
               </table>
             </div>

              {/* SEÇÃO 4: DOCUMENTOS E COMPROVAÇÕES */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>4. Documentos e Comprovações</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>O CONTRATADO deverá apresentar, quando aplicável:</p>
                  <ul style={clauseListStyle}>
                    <li>Documento de identificação;</li>
                    <li>Comprovante de endereço;</li>
                    <li>Comprovante de formação/certificação;</li>
                    <li>CNPJ/CCMEI ou documentação empresarial;</li>
                    <li>Outros documentos solicitados pela GRUPO PROTECT LTDA.</li>
                  </ul>
                </div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginTop: '4px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e4e4e7' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', width: '25%', textTransform: 'uppercase', fontSize: '11px', verticalAlign: 'top' }}>Anexos Enviados:</td>
                      <td style={{ padding: '8px', color: '#09090b', fontWeight: 'bold', fontSize: '12px' }}>
                        {documentos.length > 0 ? documentos.map(d => d.nome).join(', ') : 'NENHUM ANEXO'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#71717a', textTransform: 'uppercase', fontSize: '11px', verticalAlign: 'top' }}>Comentários:</td>
                      <td style={{ padding: '8px', color: '#09090b', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                        {formData.comentarios || 'Nenhum comentário adicional fornecido.'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SEÇÃO 5: OBJETO DA PRESTAÇÃO DE SERVIÇOS */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>5. Objeto da Prestação de Serviços</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>5.1.</strong> O presente instrumento tem por objeto a prestação, pelo <strong>CONTRATADO</strong>, de serviços de instalação, retirada, substituição, manutenção e/ou configuração de rastreadores, acessórios, sensores e demais equipamentos relacionados aos serviços de rastreamento, telemetria e monitoramento disponibilizados pela <strong>GRUPO PROTECT LTDA</strong>, conforme cada ordem de serviço.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>5.2.</strong> Os serviços serão realizados de acordo com as especificações técnicas, procedimentos e orientações fornecidos pela CONTRATANTE.
                  </p>
                </div>
              </div>

              {/* SEÇÃO 6: AUTONOMIA DA PRESTAÇÃO DE SERVIÇOS */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>6. Autonomia da Prestação de Serviços</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>6.1.</strong> O CONTRATADO declara atuar com autonomia técnica e operacional, sem exclusividade e sem subordinação jurídica, observados os padrões técnicos, procedimentos de segurança e requisitos de qualidade estabelecidos pela <strong>GRUPO PROTECT LTDA</strong>, desde que tais condições correspondam efetivamente à realidade da relação entre as partes.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>6.2.</strong> O presente instrumento não estabelece, por si só, relação de emprego entre as partes, permanecendo o CONTRATADO responsável pela organização e execução de suas atividades, observada a legislação aplicável.
                  </p>
                </div>
              </div>

              {/* SEÇÃO 7: RESPONSABILIDADES DO CONTRATADO */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>7. Responsabilidades do Contratado</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>São responsabilidades do <strong>CONTRATADO</strong>:</p>
                  <ul style={clauseListStyle}>
                    <li>a) Executar os serviços com zelo, qualidade, segurança e observância das especificações técnicas;</li>
                    <li>b) Preservar a integridade do veículo, equipamento e demais bens do cliente;</li>
                    <li>c) Comunicar imediatamente à GRUPO PROTECT LTDA qualquer ocorrência, dano, falha ou impossibilidade de execução do serviço;</li>
                    <li>d) Utilizar adequadamente os equipamentos, ferramentas e materiais disponibilizados;</li>
                    <li>e) Manter sigilo sobre informações de clientes, veículos, localização, equipamentos e sistemas;</li>
                    <li>f) Não utilizar dados ou informações obtidos em razão dos serviços para finalidade própria ou de terceiros;</li>
                    <li>g) Cumprir os procedimentos técnicos estabelecidos pela GRUPO PROTECT LTDA;</li>
                    <li>h) Registrar corretamente a conclusão de cada serviço;</li>
                    <li>i) Zelar pelos equipamentos, materiais, documentos e demais bens que eventualmente estejam sob sua responsabilidade;</li>
                    <li>j) Responsabilizar-se pelos danos comprovadamente causados por ação ou omissão decorrente da execução inadequada dos serviços;</li>
                    <li>k) Comunicar previamente qualquer impedimento que possa comprometer o cumprimento de uma ordem de serviço previamente aceita;</li>
                    <li>l) Não realizar alterações, modificações ou procedimentos diferentes daqueles autorizados pela CONTRATANTE sem prévia autorização.</li>
                  </ul>
                </div>
              </div>

              {/* SEÇÃO 8: RESPONSABILIDADES DA CONTRATANTE */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>8. Responsabilidades da Contratante</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>São responsabilidades da <strong>GRUPO PROTECT LTDA</strong>:</p>
                  <ul style={clauseListStyle}>
                    <li>a) Disponibilizar as informações necessárias para a execução dos serviços;</li>
                    <li>b) Fornecer ou disponibilizar os equipamentos e materiais que forem de sua responsabilidade;</li>
                    <li>c) Efetuar o pagamento dos serviços regularmente executados e aprovados, conforme as condições previamente acordadas;</li>
                    <li>d) Informar os procedimentos técnicos e requisitos necessários à execução dos serviços;</li>
                    <li>e) Disponibilizar, quando necessário, as informações referentes à ordem de serviço e ao atendimento a ser realizado;</li>
                    <li>f) Informar ao CONTRATADO eventuais alterações relevantes nos procedimentos técnicos ou comerciais aplicáveis aos serviços.</li>
                  </ul>
                </div>
              </div>

              {/* SEÇÃO 9: VALORES, ORDEM DE SERVIÇO E PAGAMENTO */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>9. Valores, Ordem de Serviço e Pagamento</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>9.1.</strong> Os valores referentes aos serviços de instalação, retirada, manutenção, substituição, configuração, acessórios, equipamentos e demais serviços eventualmente prestados pelo CONTRATADO serão aqueles previamente estabelecidos pela GRUPO PROTECT LTDA, conforme as habilidades e valores declarados na Seção 2 deste instrumento, que integram o presente instrumento para todos os fins.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.2.</strong> Os valores poderão ser atualizados pela GRUPO PROTECT LTDA sempre que houver alteração nos valores, serviços, acessórios, equipamentos ou condições comerciais, mediante comunicação ao CONTRATADO.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.3.</strong> Cada serviço deverá ser previamente autorizado pela GRUPO PROTECT LTDA, por meio de ordem de serviço, solicitação ou outro meio de autorização utilizado pela empresa.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.4.</strong> O pagamento dos serviços será realizado mediante a apresentação da respectiva Nota Fiscal de Prestação de Serviços pelo CONTRATADO, devidamente emitida de acordo com a legislação fiscal aplicável.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.5.</strong> A Nota Fiscal deverá corresponder aos serviços efetivamente realizados, autorizados e validados pela GRUPO PROTECT LTDA.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.6.</strong> O pagamento será realizado após a conferência e aprovação dos serviços e da respectiva Nota Fiscal, observados os valores e prazos previamente estabelecidos entre as partes.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.7.</strong> Serviços, acessórios ou atividades que não estejam previamente autorizados pela GRUPO PROTECT LTDA poderão não ser reconhecidos para fins de pagamento.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.8.</strong> O valor devido ao CONTRATADO corresponderá exclusivamente aos serviços efetivamente realizados, autorizados e validados pela GRUPO PROTECT LTDA.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>9.9.</strong> Eventuais tributos, encargos ou obrigações fiscais decorrentes da emissão da Nota Fiscal e da prestação dos serviços serão de responsabilidade do CONTRATADO, observada a legislação aplicável.
                  </p>
                   <div style={{ padding: '10px', border: '1px solid #d4d4d8', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
                     <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Forma de recebimento selecionada: {formData.formaPagamento || 'Não selecionada'}</div>
                     <div style={{ fontSize: '10px', color: '#71717a' }}>O pagamento será efetuado via transferência bancária ou PIX exclusivamente para a conta vinculada ao mesmo CNPJ/CPF com o qual foi firmado o presente contrato, mediante expressa aprovação da GRUPO PROTECT LTDA.</div>
                   </div>
                </div>
              </div>

              {/* SEÇÃO 10: GARANTIA E RESPONSABILIDADE PELO SERVIÇO */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>10. Garantia e Responsabilidade pelo Serviço</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>10.1.</strong> O CONTRATADO responderá pela correção de falhas decorrentes de instalação inadequada, quando comprovadamente atribuíveis à execução do serviço.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>10.2.</strong> Quando constatada falha de instalação de sua responsabilidade, o CONTRATADO deverá realizar a correção necessária, observadas as condições estabelecidas pela GRUPO PROTECT LTDA.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>10.3.</strong> A responsabilidade do CONTRATADO não se aplica a defeitos preexistentes, falhas do equipamento, problemas elétricos ou eletrônicos do veículo, mau uso pelo cliente ou outras situações que não tenham relação com a execução do serviço.
                  </p>
                </div>
              </div>

              {/* SEÇÃO 11: CONFIDENCIALIDADE E PROTEÇÃO DE DADOS – LGPD */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>11. Confidencialidade e Proteção de Dados – Lei nº 13.709/2018 (LGPD)</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>11.1.</strong> O CONTRATADO deverá manter absoluto sigilo sobre todas as informações a que tiver acesso em razão dos serviços prestados à GRUPO PROTECT LTDA.
                  </p>
                  <p style={clauseParaStyle}><strong>11.2.</strong> Incluem-se, entre outras:</p>
                  <ul style={clauseListStyle}>
                    <li>dados pessoais;</li>
                    <li>dados de localização;</li>
                    <li>informações de clientes;</li>
                    <li>informações de veículos;</li>
                    <li>informações de equipamentos;</li>
                    <li>informações comerciais;</li>
                    <li>informações técnicas;</li>
                    <li>sistemas;</li>
                    <li>senhas;</li>
                    <li>credenciais de acesso.</li>
                  </ul>
                  <p style={clauseParaStyle}>
                    <strong>11.3.</strong> O CONTRATADO compromete-se a utilizar essas informações exclusivamente para a execução dos serviços autorizados.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>11.4.</strong> É vedada a utilização, compartilhamento, reprodução ou divulgação dessas informações para finalidade própria ou de terceiros sem autorização da GRUPO PROTECT LTDA.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>11.5.</strong> Os dados pessoais deverão ser tratados em conformidade com a <strong>Lei nº 13.709, de 14 de agosto de 2018 – Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>, observando-se os princípios, direitos e obrigações previstos na referida legislação.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>11.6.</strong> O CONTRATADO deverá adotar medidas de segurança técnicas e administrativas adequadas para impedir acesso não autorizado, perda, alteração, divulgação ou qualquer forma de tratamento inadequado ou ilícito dos dados pessoais aos quais tenha acesso em razão da prestação dos serviços.
                  </p>
                </div>
              </div>

              {/* SEÇÃO 12: RESCISÃO / CANCELAMENTO */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>12. Rescisão / Cancelamento</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>
                    <strong>12.1.</strong> Qualquer das partes poderá solicitar o encerramento da relação de prestação de serviços, observadas as condições estabelecidas neste instrumento e na legislação aplicável.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.2.</strong> Quando o cancelamento ou encerramento da prestação de serviços for solicitado pelo CONTRATADO, este deverá formalizar sua solicitação por escrito, mediante envio de e-mail para: <strong style={{ textDecoration: 'underline' }}>info@protectrastreamento.com</strong>.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.3.</strong> A comunicação deverá informar expressamente a intenção do CONTRATADO de encerrar sua relação de prestação de serviços com a GRUPO PROTECT LTDA.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.4.</strong> O simples fato de o CONTRATADO deixar de atender, deixar de responder mensagens ou interromper a execução dos serviços não substitui a formalização do pedido de cancelamento por e-mail, sem prejuízo das consequências eventualmente aplicáveis à situação concreta.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.5.</strong> O cancelamento não prejudicará os serviços previamente autorizados e ainda pendentes de conclusão, bem como eventuais valores, obrigações ou responsabilidades decorrentes de serviços já realizados.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.6.</strong> A GRUPO PROTECT LTDA poderá solicitar a devolução de equipamentos, materiais, documentos, acessos ou quaisquer outros bens pertencentes à empresa que estejam em posse do CONTRATADO.
                  </p>
                  <p style={clauseParaStyle}>
                    <strong>12.7.</strong> O CONTRATADO deverá devolver os equipamentos, materiais e demais bens da GRUPO PROTECT LTDA nas condições e no prazo determinados pela CONTRATANTE.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>12.8.</strong> Eventuais penalidades, perdas e danos ou outras consequências decorrentes do encerramento da prestação de serviços serão aplicadas quando previstas neste instrumento ou quando cabíveis nos termos da legislação vigente.
                  </p>
                </div>
              </div>

              {/* SEÇÃO 13: DECLARAÇÕES E ACEITE DO CONTRATADO */}
              <div style={clauseSectionStyle}>
                <h4 style={clauseHeaderStyle}>13. Declarações e Aceite do Contratado</h4>
                <div style={clauseBodyStyle}>
                  <p style={clauseParaStyle}>O CONTRATADO declara que:</p>
                  <ul style={clauseListStyle}>
                    <li>As informações fornecidas neste cadastro são verdadeiras e completas.</li>
                    <li>Possui capacidade técnica compatível com os serviços para os quais está se cadastrando.</li>
                    <li>Compromete-se a comunicar qualquer alteração relevante em seus dados cadastrais.</li>
                    <li>Leu e compreendeu todas as condições deste instrumento.</li>
                    <li>Concorda com as condições estabelecidas neste instrumento.</li>
                    <li>Autoriza a GRUPO PROTECT LTDA a verificar as informações e documentos apresentados para fins de cadastro, qualificação e homologação.</li>
                    <li>Compromete-se a manter sigilo sobre informações, dados e documentos aos quais tiver acesso em razão da prestação dos serviços.</li>
                    <li>Compromete-se a observar as disposições da Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD) no tratamento de dados pessoais aos quais tiver acesso em razão de suas atividades.</li>
                  </ul>
                  <div style={{ padding: '10px', border: '1px solid #d4d4d8', borderRadius: '4px', backgroundColor: formData.autorizacao ? '#f0fdf4' : '#f9fafb', marginTop: '4px' }}>
                    <div style={{ fontWeight: 'bold', color: formData.autorizacao ? '#166534' : '#71717a' }}>
                      {formData.autorizacao ? '☑ ' : '☐ '}
                      Li e concordo com os termos deste instrumento e com o tratamento dos meus dados pessoais nos termos da LGPD.
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 14: ACEITE E ASSINATURAS */}
             <div style={{ borderTop: '2px solid #09090b', paddingTop: '16px' }}>
               <h4 style={clauseHeaderStyle}>14. Aceite e Assinaturas</h4>
               <p style={{ fontSize: '10px', color: '#52525b', lineHeight: '1.5', textAlign: 'justify', marginBottom: '20px' }}>
                 As partes declaram que leram, compreenderam e concordam com as condições estabelecidas neste instrumento, manifestando sua livre vontade em relação à prestação dos serviços.
               </p>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', textAlign: 'center', fontSize: '9pt', marginTop: '20px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ height: '48px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', borderBottom: '2px solid #3f3f46', marginBottom: '6px' }}>
                     {contratanteSignatureImage ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={contratanteSignatureImage} alt="Assinatura da Contratante" style={{ maxHeight: '46px', maxWidth: '100%', objectFit: 'contain' }} />
                     ) : (
                       <span style={{ fontSize: '7pt', color: '#a1a1aa', fontStyle: 'italic' }}>Assinatura da Contratante</span>
                     )}
                   </div>
                   <p style={{ fontWeight: 700, color: '#18181b', fontSize: '8.5pt', margin: 0 }}>GRUPO PROTECT LTDA</p>
                   <p style={{ fontSize: '7pt', color: '#71717a', fontFamily: 'monospace', marginTop: '2px' }}>CNPJ: 42.818.864/0001-65</p>
                   <span style={{ marginTop: '4px', fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa', backgroundColor: '#f4f4f5', padding: '2px 8px', borderRadius: '4px' }}>Contratante</span>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ height: '48px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', borderBottom: '2px solid #3f3f46', marginBottom: '6px' }}>
                     {signatureImage ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={signatureImage} alt="Assinatura do Instalador" style={{ maxHeight: '46px', maxWidth: '100%', objectFit: 'contain' }} />
                     ) : (
                       <span style={{ fontSize: '7pt', color: '#a1a1aa', fontStyle: 'italic' }}>Assinatura do Instalador</span>
                     )}
                   </div>
                   <p style={{ fontWeight: 700, color: formData.nomeCompleto ? '#18181b' : '#a1a1aa', fontSize: '8.5pt', margin: 0, fontStyle: formData.nomeCompleto ? 'normal' : 'italic' }}>
                     {formData.nomeCompleto || 'Não informado'}
                   </p>
                   <p style={{ fontSize: '7pt', color: '#71717a', fontFamily: 'monospace', marginTop: '2px' }}>
                     {formData.cpf ? `CPF: ${formData.cpf}` : 'CPF do Instalador'}
                   </p>
                   <span style={{ marginTop: '4px', fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa', backgroundColor: '#f4f4f5', padding: '2px 8px', borderRadius: '4px' }}>Contratado</span>
                 </div>
               </div>

               {/* Testemunhas */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', marginBottom: '16px' }}>
                 <div style={{ flex: 1, height: '1px', backgroundColor: '#e4e4e7' }} />
                 <span style={{ fontSize: '7pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', padding: '0 8px' }}>Testemunhas</span>
                 <div style={{ flex: 1, height: '1px', backgroundColor: '#e4e4e7' }} />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', textAlign: 'center', fontSize: '9pt' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src="/assinatura2.png" alt="Assinatura" style={{ height: '56px', width: 'auto', objectFit: 'contain', marginBottom: '4px' }} />
                   <p style={{ fontWeight: 600, color: '#27272a', fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Antonio C. Costa Junior</p>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src="/assinatura1.png" alt="Assinatura" style={{ height: '56px', width: 'auto', objectFit: 'contain', marginBottom: '4px' }} />
                   <p style={{ fontWeight: 600, color: '#27272a', fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Emerson N. do Carmo</p>
                 </div>
               </div>

               <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e4e4e7', fontSize: '9.5px', color: '#71717a', lineHeight: '1.6' }}>
                 <strong style={{ color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Controle do Documento</strong>
                 <div style={{ marginTop: '4px' }}>
                   Ficha nº {fichaNumero || 'pendente'} &nbsp;·&nbsp; Data de emissão: {new Date().toLocaleDateString('pt-BR')}
                 </div>
                 <div>Contratante: GRUPO PROTECT LTDA &nbsp;·&nbsp; Nome comercial: ProtectRastreamento.com</div>
                 <div>E-mail oficial para cancelamento: info@protectrastreamento.com</div>
               </div>
             </div>

          </div>
        </div>
      </section>

    </div>
  );
}
