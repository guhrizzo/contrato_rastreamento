'use strict';
'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
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
  Info
} from 'lucide-react';

interface FormState {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cursoTecnico: boolean;
  certificadoInstalacao: boolean;
  tiposInstalacao: string[];
  outrosInstalacao: string;
  cnpj: string;
  nomeContato: string;
  telefoneEmpresa: string;
  comentarios: string;
  autorizacao: boolean;
}

export default function CadastroInstalador() {
  const [formData, setFormData] = useState<FormState>({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    email: '',
    phone: '',
    cursoTecnico: false,
    certificadoInstalacao: false,
    tiposInstalacao: [],
    outrosInstalacao: '',
    cnpj: '',
    nomeContato: '',
    telefoneEmpresa: '',
    comentarios: '',
    autorizacao: false,
  });

  const [documentoFile, setDocumentoFile] = useState<{
    base64: string;
    nome: string;
    tipo: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'client' | 'skills' | 'professional' | 'finish'>('client');
  const [showPrintBlockDialog, setShowPrintBlockDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // States para responsividade mobile
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Listener para redimensionamento de janela
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = windowWidth < 794 ? (windowWidth - 32) / 794 : 1;

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
      return { ...prev, tiposInstalacao: novaLista };
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('O arquivo excede o tamanho máximo permitido de 8MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentoFile({
        base64: reader.result as string,
        nome: file.name,
        tipo: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const isFormComplete = (): boolean => {
    return (
      formData.nomeCompleto.trim() !== '' &&
      formData.cpf.trim() !== '' &&
      formData.rg.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.tiposInstalacao.length > 0 &&
      formData.autorizacao === true
    );
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
      const payload = {
        ...formData,
        documentoBase64: documentoFile?.base64 || null,
        documentoNome: documentoFile?.nome || null,
        documentoTipo: documentoFile?.tipo || null,
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

      setEmailSent(true);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!isFormComplete() || !emailSent) {
      alert('Preencha os dados obrigatórios e submeta o formulário por e-mail antes de imprimir.');
      return;
    }
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 lg:flex-row print-container select-none" onContextMenu={(e) => { e.preventDefault(); }}>
      
      {/* SELETOR MOBILE */}
      <div className="flex lg:hidden sticky top-0 bg-brand-black border-b border-zinc-800 z-30 no-print shadow-md">
        <button
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            mobileTab === 'form'
              ? 'border-brand-yellow text-brand-yellow bg-zinc-900/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Editar Cadastro
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            mobileTab === 'preview'
              ? 'border-brand-yellow text-brand-yellow bg-zinc-900/10'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Visualizar Ficha
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
      <aside className={`w-full lg:w-[45%] xl:w-[38%] bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-auto lg:h-screen lg:sticky lg:top-0 no-print z-10 shadow-sm ${mobileTab === 'form' ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* CABEÇALHO DA BARRA LATERAL */}
        <header className="p-6 bg-brand-black text-white flex flex-col gap-4 border-b-4 border-brand-yellow">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/protectrastreamento.png" alt="Protect Rastreamento" className="h-7 w-auto shrink-0" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wider leading-tight text-white">
                  Protect<span className="text-brand-yellow"> Rastreamento</span>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handlePrint}
              disabled={!isFormComplete() || !emailSent}
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-xs rounded-md shadow-md hover:shadow-lg transition-all duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Imprimir
            </button>
            <button
              onClick={() => {
                if (!emailSent) {
                  alert('Envie o formulário primeiro para habilitar.');
                  return;
                }
                window.print();
              }}
              disabled={!isFormComplete() || !emailSent}
              className="flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg border border-zinc-700 transition-all duration-200 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              Salvar PDF
            </button>
          </div>

          {!emailSent && (
            <div className="mt-1 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-md text-[10px] text-amber-300 font-semibold leading-normal flex gap-2.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
              <span>
                A impressão e download da ficha só serão liberados após você preencher todos os dados obrigatórios e clicar em <strong className="text-brand-yellow font-bold">Enviar Cadastro</strong> na aba "Finalizar".
              </span>
            </div>
          )}
        </header>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="flex bg-zinc-100 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'client'
                ? 'bg-white border-brand-black text-brand-black'
                : 'border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50'
            }`}
          >
            <User className="w-4 h-4" /> Pessoal
          </button>
          
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-white border-brand-black text-brand-black'
                : 'border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Habilidades
          </button>

          <button
            onClick={() => setActiveTab('professional')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'professional'
                ? 'bg-white border-brand-black text-brand-black'
                : 'border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50'
            }`}
          >
            <Building2 className="w-4 h-4" /> Profissional
          </button>

          <button
            onClick={() => setActiveTab('finish')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'finish'
                ? 'bg-white border-brand-black text-brand-black'
                : 'border-transparent text-zinc-500 hover:text-brand-black hover:bg-zinc-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Finalizar
          </button>
        </nav>

        {/* CONTEÚDO DAS ABAS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB: PESSOAL */}
          {activeTab === 'client' && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Dados do Instalador
                </h3>
                <p className="text-xs text-zinc-500">Insira suas informações pessoais de identificação</p>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                  placeholder="Nome completo do instalador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5" /> CPF <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5" /> RG <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Apenas números"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> E-mail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Celular (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: HABILIDADES */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
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
                  {tiposDisponiveis.map(tipo => (
                    <label
                      key={tipo}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition duration-150 ${
                        formData.tiposInstalacao.includes(tipo)
                          ? 'bg-amber-50/70 border-brand-yellow-dark text-amber-950 font-semibold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.tiposInstalacao.includes(tipo)}
                        onChange={() => handleTipoInstalacaoChange(tipo)}
                        className="h-4 w-4 accent-brand-yellow text-brand-black focus:ring-brand-black"
                      />
                      <span className="text-xs">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.tiposInstalacao.includes('Outros') && (
                <div className="flex flex-col animate-fadeIn">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1">
                    Especifique os outros tipos de instalação <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="outrosInstalacao"
                    value={formData.outrosInstalacao}
                    onChange={handleInputChange}
                    rows={3}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 resize-none"
                    placeholder="Descreva sua experiência especial..."
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFISSIONAL */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Histórico e Anexos
                </h3>
                <p className="text-xs text-zinc-500">Última empresa onde prestou serviços de instalação</p>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1">
                  CNPJ da Empresa
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1">
                    Nome de Contato
                  </label>
                  <input
                    type="text"
                    name="nomeContato"
                    value={formData.nomeContato}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-zinc-700 uppercase mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefoneEmpresa"
                    value={formData.telefoneEmpresa}
                    onChange={handleInputChange}
                    className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-2 block">
                  Documentação de Apoio
                </label>
                <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-lg p-5 text-center flex flex-col items-center">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs font-bold text-zinc-800">
                    {documentoFile ? documentoFile.nome : 'Selecione certificados ou currículo'}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1 mb-3 block">PDF ou Imagem (Máx: 8MB)</span>
                  <label className="bg-white border border-zinc-350 hover:bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer shadow-sm transition">
                    Upload de Documento
                    <input
                      type="file"
                      accept=".pdf, image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FINALIZAR */}
          {activeTab === 'finish' && (
            <div className="space-y-4">
              <div className="border-l-4 border-brand-yellow pl-3 mb-2">
                <h3 className="text-sm font-bold uppercase text-brand-black tracking-wide">
                  Autorização e Envio
                </h3>
                <p className="text-xs text-zinc-500">Envie o cadastro completo para nossa aprovação</p>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700 uppercase mb-1">
                  Comentários / Observações
                </label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows={4}
                  className="p-2.5 border border-zinc-200 rounded-md text-sm focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black bg-zinc-50 focus:bg-white transition-all duration-150 resize-none"
                  placeholder="Instale periféricos adicionais ou observações..."
                />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 leading-relaxed flex gap-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  Ao clicar em <strong>Enviar Cadastro</strong>, suas informações serão validadas e transmitidas com segurança para a central da Protect Rastreamento.
                </span>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md space-y-3">
                <p className="text-[11px] text-zinc-600 leading-normal">
                  Declaro que as informações fornecidas neste formulário são verdadeiras e completas, e autorizo a verificação dos dados aqui informados.
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autorizacao}
                    onChange={() => handleCheckboxChange('autorizacao')}
                    className="h-4.5 w-4.5 accent-brand-yellow rounded text-brand-black focus:ring-brand-black border-zinc-350"
                  />
                  <span className="text-xs font-bold text-zinc-800">Li e concordo com os termos <span className="text-rose-500">*</span></span>
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
          )}

        </div>
      </aside>

      {/* COLUNA DIREITA: DOCUMENTO DE VISUALIZAÇÃO A4 (Tempo real) */}
      <section className={`flex-1 overflow-y-auto bg-zinc-200 py-10 px-4 justify-center items-start lg:h-screen lg:sticky lg:top-0 ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
        <div 
          className="a4-wrapper"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            height: windowWidth < 794 ? `${1123 * scale}px` : 'auto'
          }}
        >
          <div id="contract-pdf" className="a4-page text-brand-black relative">
            
            {/* Cabeçalho do Documento */}
            <div className="flex justify-between items-center border-b-2 border-brand-black pb-5 mb-6">
              <div className="flex items-center gap-3">
                <img src="/protectrastreamento.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight leading-none text-zinc-950">
                    PROTECT RASTREAMENTO
                  </h2>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Rede Credenciada de Instaladores
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-brand-yellow border-2 border-brand-black text-[10px] font-black uppercase tracking-wider">
                  FICHA Nº {Math.floor(100000 + Math.random() * 900000)}
                </div>
              </div>
            </div>

            <h3 className="text-center font-black text-sm uppercase tracking-widest border-2 border-brand-black py-2.5 mb-6 bg-zinc-50">
              FICHA DE REGISTRO E QUALIFICAÇÃO DE INSTALADOR
            </h3>

            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="mb-6 avoid-break">
              <h4 className="text-[11px] font-extrabold uppercase bg-brand-black text-white px-2 py-1 mb-3 tracking-wider">
                1. Identificação do Profissional
              </h4>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 w-1/4 uppercase">Nome Completo:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.nomeCompleto || '________________________________________'}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">CPF / RG:</td>
                    <td className="py-2 text-zinc-900 font-medium">
                      {formData.cpf ? `CPF: ${formData.cpf}` : 'CPF: _________________'} &nbsp;|&nbsp; 
                      {formData.rg ? `RG: ${formData.rg}` : 'RG: _________________'}
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">E-mail:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.email || '________________________________________'}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">WhatsApp:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.phone || '________________________________________'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO 2: CERTIFICAÇÃO E HABILIDADES */}
            <div className="mb-6 avoid-break">
              <h4 className="text-[11px] font-extrabold uppercase bg-brand-black text-white px-2 py-1 mb-3 tracking-wider">
                2. Formação Técnica e Capacitação
              </h4>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 w-2/5 uppercase">Curso Técnico na Área:</td>
                    <td className="py-2 text-zinc-900 font-bold">{formData.cursoTecnico ? 'SIM [x] / NÃO [ ]' : 'SIM [ ] / NÃO [x]'}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">Certificado em Rastreadores:</td>
                    <td className="py-2 text-zinc-900 font-bold">{formData.certificadoInstalacao ? 'SIM [x] / NÃO [ ]' : 'SIM [ ] / NÃO [x]'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-zinc-500 uppercase valign-top">Habilidades declaradas:</td>
                    <td className="py-2 text-zinc-900">
                      {formData.tiposInstalacao.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {formData.tiposInstalacao.map(t => (
                            <span key={t} className="bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-sm text-[10px] font-semibold text-zinc-800">
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400">Nenhum tipo de instalação selecionado</span>
                      )}
                      {formData.tiposInstalacao.includes('Outros') && formData.outrosInstalacao && (
                        <div className="mt-2 p-2 bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600 rounded">
                          <strong>Outros:</strong> {formData.outrosInstalacao}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO 3: EXPERIÊNCIA E REFERÊNCIA */}
            <div className="mb-6 avoid-break">
              <h4 className="text-[11px] font-extrabold uppercase bg-brand-black text-white px-2 py-1 mb-3 tracking-wider">
                3. Última Empresa / Referência Comercial
              </h4>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 w-1/4 uppercase">CNPJ Parceiro:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.cnpj || '________________________________________'}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">Nome Contato:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.nomeContato || '________________________________________'}</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 uppercase">Telefone:</td>
                    <td className="py-2 text-zinc-900 font-medium">{formData.telefoneEmpresa || '________________________________________'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SEÇÃO 4: ANEXOS E COMENTÁRIOS */}
            <div className="mb-6 avoid-break">
              <h4 className="text-[11px] font-extrabold uppercase bg-brand-black text-white px-2 py-1 mb-3 tracking-wider">
                4. Documentos e Informações Adicionais
              </h4>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-zinc-200">
                    <td className="py-2 font-bold text-zinc-500 w-1/4 uppercase">Anexo Enviado:</td>
                    <td className="py-2 text-zinc-900 font-bold">{documentoFile ? `SIM (${documentoFile.nome})` : 'NÃO ANEXADO'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-zinc-500 uppercase valign-top">Comentários:</td>
                    <td className="py-2 text-zinc-900 font-medium whitespace-pre-line leading-relaxed">
                      {formData.comentarios || 'Nenhum comentário adicional fornecido.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Declaração e Rodapé de Assinatura */}
            <div className="mt-auto avoid-break border-t-2 border-brand-black pt-6">
              <p className="text-[10px] text-zinc-600 leading-normal text-justify mb-8">
                Declaro para os devidos fins de direito que todas as informações prestadas nesta ficha de qualificação são verdadeiras e completas. Fica a Protect Rastreamento autorizada a realizar a validação e auditoria dos referidos dados e documentos junto aos órgãos competentes ou às empresas indicadas como referências profissionais para a homologação do meu cadastro operacional.
              </p>
              
              <div className="flex justify-between items-end gap-10 mt-10">
                <div className="flex-1 text-center border-t border-zinc-400 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Assinatura do Instalador</span>
                  <span className="text-xs text-zinc-900 font-semibold mt-1 block h-5">
                    {formData.nomeCompleto || '___________________________'}
                  </span>
                </div>
                <div className="w-1/3 text-center border-t border-zinc-400 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Data do Cadastro</span>
                  <span className="text-xs text-zinc-900 font-semibold mt-1 block">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
