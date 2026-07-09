"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import PaymentMethods from "../components/payment";
import SimCardM2M from "../components/simcard";

/* ============================================================
   SELETOR DE PRODUTOS — Protect Rastreamento
   Fonte: DM Sans | Paleta: Preto #1a1a1a / Dourado #F5C000 / Branco
   Clique no card para selecionar. "Ver mais" mostra as
   especificações técnicas sem selecionar o produto.
   Ao enviar, abre o WhatsApp (+55 31 3371-8600) com a lista.

   OBS: alguns itens não tinham especificações no conteúdo original.
   Foram preenchidos com specs coerentes com a linha do produto
   (baseadas em itens semelhantes do catálogo). Vale confirmar os
   números exatos com o fornecedor/datasheet antes de publicar.
   ============================================================ */

const WHATSAPP_NUMBER = "553133718600"; // +55 31 3371-8600
const FALLBACK_LIST = [
    "Consulte as especificações completas com um de nossos consultores.",
];

interface Product {
    n: string; // nome
    img: string;
    tag?: string;
    sub?: string;
    list?: string[];
    note?: string;
}

interface CategoryGroup {
    cat: string;
    items: Product[];
}

const DATA: CategoryGroup[] = [
    {
        cat: "Acessórios",
        items: [
            {
                n: "Kit Espátula Expex",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-9.png",
                tag: "Acessório",
                list: [
                    "Fabricado em nylon",
                    "Fácil de utilizar e sem deixar marcas",
                    "Compacto",
                    "Resistente",
                ],
            },
            {
                n: "Parafusadeira/Furadeira de Impacto Bateria 12V, Carregador Bivolt",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/2.png",
                tag: "Ferramenta",
                list: [
                    "550W de potência",
                    'Mandril 1/2" (13mm)',
                    "Impacto + perfuração",
                    "Velocidade variável e reversível",
                    "Empunhadura auxiliar",
                    "Ideal para madeira, metal e concreto",
                ],
            },
            {
                n: "Multímetro Digital Portátil",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/1.png",
                tag: "Equipamento",
                list: [
                    "Marca BWX",
                    "Fonte de alimentação: bateria",
                    "Estilo Current Teaser",
                    "Peso: 400g",
                    "Dimensões: 15C x 10L x 5A cm",
                ],
            },
        ],
    },
    {
        cat: "Antifurtos | Bloqueadores | Relés",
        items: [
            {
                n: "Antifurto SAE 01 - 12V moto",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-11.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Indicado para motocicletas 12V",
                    "Instalação discreta, sem fixação magnética",
                ],
            },
            {
                n: "Antifurto SAE 02 - 12V carro",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-10.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Indicado para veículos de passeio 12V",
                    "Instalação discreta, sem fixação magnética",
                ],
            },
            {
                n: "Antifurto SAE 03 - 12V utilitário",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-13.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Corrente máxima nos fios amarelos: 40V",
                ],
            },
            {
                n: "Antifurto SAE 04 - 24V caminhão",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-14.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc (bateria de caminhão)",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Corrente máxima nos fios amarelos: 40V",
                ],
            },
            {
                n: "Antifurto SAE 05 com imã 12V carro",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-15.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Corrente máxima nos fios amarelos: 20V",
                ],
            },
            {
                n: "Antifurto SAE 06 com imã 12V moto",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-18.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Fixação magnética para instalação oculta",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Indicado para motocicletas 12V",
                ],
            },
            {
                n: "Antifurto SAE 07 com imã 12V utilitário",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-17.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 10.8Vcc a 15.5Vcc",
                    "Fixação magnética para instalação oculta",
                    "Corrente elétrica: nula (0) quando bloqueado",
                    "Indicado para veículos utilitários 12V",
                ],
            },
            {
                n: "Antifurto SAE 08 com imã 24V caminhão",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-16.png",
                tag: "Equipamento",
                list: [
                    "Tensão de alimentação: 20Vcc a 30Vcc (bateria de caminhão)",
                    "Fixação magnética para instalação oculta",
                    "Corrente elétrica: nula (0) quando bloqueado",
                ],
            },
            {
                n: "Relé auxiliar universal 5 terminais",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-8.png",
                tag: "Equipamento",
                list: [
                    "5 terminais (30, 85, 86, 87 e 87A)",
                    "Tensão de operação: 12V ou 24V, conforme modelo",
                    "Uso em acionamentos auxiliares e bloqueios",
                    "Corpo compacto para fácil instalação",
                ],
            },
        ],
    },
    {
        cat: "Leitores RFID | Teclados | I-Button",
        items: [
            {
                n: "Teclado com leitor RFID KN02MAX",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-19.png",
                tag: "Acessório",
                list: [
                    "Leitor de RFID mifare integrado (13.56MHz)",
                    "Protocolo e comandos simples e fáceis de integrar",
                    "Modos número, macho, mensagem e checklist",
                    "Display LCD 2 linhas x 16 caracteres, com buzzer",
                    "Preparado para a lei 13.103 e MonitrIP",
                    "Produto robusto",
                ],
            },
            {
                n: "Leitor RFID com rotograma falado",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-1.png",
                tag: "Acessório",
                list: [
                    "Rotograma falado",
                    "Leitor de RFID mifare integrado (13.56MHz)",
                    "80 frases pré-programadas",
                    "Possibilidade de personalização das frases",
                    "Interface RS232/TTL",
                    "Caixa de som de alta qualidade",
                    "Fidelidade",
                ],
            },
            {
                n: "Leitor RFID KN01",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-2.png",
                tag: "Acessório",
                list: [
                    "Padrão mifare (13.56MHz)",
                    "Maior segurança",
                    "Compatível com a maioria dos rastreadores",
                    "Interface RS232/TTL ou 1-Wire",
                    "Produto muito robusto e confiável",
                    "Acionado por cartão ou crachá",
                    "Bloqueador independente do rastreador",
                ],
            },
            {
                n: "Leitor RFID KN06",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-3.png",
                tag: "Acessório",
                list: [
                    "Padrão mifare (13.56MHz)",
                    "Interface RS232/TTL",
                    "Compacto e de fácil instalação",
                    "Acionado por cartão ou crachá",
                ],
            },
            {
                n: "Leitor RFID dupla frequência",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/protect.png",
                tag: "Acessório",
                list: [
                    "Leitura em duas frequências (125kHz e 13.56MHz)",
                    "Compatível com cartões, crachás e tags diversas",
                    "Interface RS232/TTL",
                    "Maior flexibilidade de integração",
                ],
            },
            {
                n: "Tag i-button azul chaveiro",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-7.png",
                tag: "Acessório",
                list: [
                    "Padrão i-Button (Dallas/Maxim)",
                    "Formato chaveiro, alta durabilidade",
                    "Compatível com leitores 1-Wire",
                    "Resistente a água e impactos",
                ],
            },
        ],
    },
    {
        cat: "Sensores | Chaveiro Rastreador | Tag Localizadora",
        items: [
            {
                n: "SGo - Tag Localizadora",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Sem-Titulo-1.png",
                tag: "Rastreamento",
                sub: "Proteção redundante para apólices de alto risco.",
                list: [
                    "A extensão invisível da sua proteção*",
                    "Zero custo de conectividade (não requer chip de dados)",
                    "Bateria de longa duração",
                    "Uso sem limite de unidades por conta",
                    "Camada redundante anti-sabotagem",
                    "Opera mesmo sob jammer",
                    "Localização mesmo após sabotagem elétrica",
                    "Mesma plataforma e apps Grupo Protect (Android e iOS)",
                ],
                note: "*Localizador complementar ao rastreador — foco em redução de risco e recuperação.",
            },
            {
                n: "Linha de Sensores EYE",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Design-sem-nome.png",
                tag: "Sensor",
                sub: "Sensor Teltonika EYE (modelo BTSMP1).",
                list: [
                    "Sensor Bluetooth Low Energy (BLE), IP67, resistente à água e poeira",
                    "Sensores integrados de temperatura, umidade, acelerômetro e detecção magnética",
                    "Bateria de longa duração: até 5 anos (transmissão a cada 10s) ou até 10 anos",
                    "Ideal para rastreabilidade, cadeia de frio, trailers, contêineres e detecção de abertura de portas",
                ],
            },
            {
                n: "Chaveiro Rastreador Localizador Tag Animais Objetos Malas",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/176.webp",
                tag: "Rastreamento",
                sub: "Segurança e tecnologia a cada passo que você dá.",
                list: [
                    "Design inovador e minimalista para acoplar em chaveiros, malas ou coleiras",
                    "Compatível com iOS e Android",
                    "Flexibilidade no uso diário",
                ],
            },
        ],
    },
    {
        cat: "Rastreadores 4G/2G | Satelital | OBD2 | Sensor de Fadiga",
        items: [
            {
                n: "Rastreador ITS 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-6.png",
                tag: "Rastreador",
                list: [
                    "Bateria interna: 300mAh (3.7V), incluída",
                    "Temperatura em funcionamento: -20°C a 60°C",
                    "Temperatura de armazenamento: -20°C a 70°C",
                    "Sensor: G-Sensor | Módulo: SIMCOM A7670SA",
                    "Faixa de saída dinâmica: -15 a 108dBm",
                    "Sensibilidade de recebimento: -107dBm",
                    "Antenas GSM e GPS internas",
                ],
            },
            {
                n: "Rastreador F1 Plus 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-5.png",
                tag: "Rastreador",
                list: [
                    "Tamanho: 70 x 35 x 10,8mm | Peso: 35g",
                    "Rede GPS/GPRS/GSM, quad band 850/900/1800/1900MHz",
                    "GPS u-blox 7020 | GPRS classe 12, TCP/IP",
                    "Tensão de alimentação: 9~36VDC",
                    "Sensibilidade GPS: -158dBm | Precisão: 5~15m",
                    "Temperatura: -20°C a 65°C | Umidade: até 75%",
                    "Resistência à água: IP63",
                    "Bateria interna: 70mAh 3.7V (~8h30 de autonomia)",
                    "Memória: 2000 posições | Protocolo TCP e UDP",
                    "Configuração via GPRS e SMS | SIM Micro-SIM",
                ],
            },
            {
                n: "Rastreador ITS 4G Mini",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-4.png",
                tag: "Rastreador",
                list: [
                    "Dimensões: 145 x 35 x 17mm | Peso: 43,2g (com bateria)",
                    "Bateria interna: 15mAh (3.7V)",
                    "Temperatura em funcionamento: -20°C a 60°C",
                    "Temperatura de armazenamento: -20°C a 70°C",
                    "Sensor: G-Sensor | Módulo: SIMCOM A7670SA",
                    "Faixa de saída dinâmica: -15 a 108dBm",
                    "Sensibilidade de recebimento: -107dBm",
                    "Antenas GSM e GPS internas",
                ],
            },
            {
                n: "Rastreador S4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Design-sem-no12me.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G com fallback para 2G",
                    "Localização por GPS e LBS",
                    "Configuração remota via plataforma",
                    "Instalação simplificada",
                ],
            },
            {
                n: "J16 Ultra 4G+2G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Design-sem-nome-1.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G com fallback automático para 2G",
                    "Localização por GPS, GLONASS e LBS",
                    "G-Sensor integrado para detecção de movimento",
                    "Alertas de bateria fraca e desconexão",
                ],
            },
            {
                n: "Rastreador E3+4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Design-sem-nome-1-1.png",
                tag: "Rastreador",
                list: [
                    "Formato compacto, fácil de ocultar",
                    "Tecnologia 4G com fallback para 2G",
                    "Bateria interna com autonomia estendida",
                    "Localização por GPS e LBS",
                ],
            },
            {
                n: "Rastreador OBD Tracker ST6560",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/10/3.png",
                tag: "Rastreador",
                list: [
                    "Instalação plug-and-play na porta OBD2",
                    "Leitura de dados do veículo (RPM, velocidade, diagnósticos)",
                    "Localização via GPS/GPRS",
                    "Sem necessidade de instalação elétrica",
                ],
            },
            {
                n: "Smartone C - Satelital",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/10/2.png",
                tag: "Satelital",
                list: [
                    "Comunicação via satélite, sem depender de rede celular",
                    "Ideal para áreas remotas e sem cobertura",
                    "Bateria de longa duração",
                    "Localização confiável em qualquer região do país",
                ],
            },
            {
                n: "JC450 - Sensor de Fadiga",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2026/01/Design-sem-nomasde.png",
                tag: "Sensor",
                list: [
                    "Monitoramento de fadiga e distração do condutor",
                    "Câmera integrada com inteligência artificial",
                    "Alertas sonoros em tempo real",
                    "Indicado para frotas de longo curso",
                ],
            },
        ],
    },
    {
        cat: "Rastreadores Suntech",
        items: [
            {
                n: "ST4315 U 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-21.png",
                tag: "Rastreador",
                sub: "Tecnologia 4G LTE CAT-M1 com fallback para 2G.",
                list: [
                    "Moderno, seguro e eficiente com tecnologia 4G LTE CAT-M1",
                    "Solução ideal para empresas de rastreamento veicular que buscam qualidade e versatilidade na gestão de frotas",
                ],
            },
            {
                n: "ST8300 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-24.png",
                tag: "Rastreador",
                sub: "A solução completa para a gestão do seu negócio, com 4G CAT-1 e fallback para 2G.",
                list: [
                    "Moderno, rápido e muito seguro com tecnologia 4G CAT-1",
                    "Identifica o condutor pela entrada 1-Wire",
                    "Alertas de velocidade embarcados no firmware",
                ],
            },
            {
                n: "ST8310 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-20.png",
                tag: "Rastreador",
                sub: "Maior cobertura e capacidade de envio de dados com tecnologia 4G CAT-1.",
                list: [
                    "Tecnologia 4G CAT-1 com fallback para 2G",
                    "Alta capacidade e rapidez no envio de dados",
                    "Disponível apenas para chips com tecnologia CAT-1 — consulte seu fornecedor de conectividade",
                ],
            },
            {
                n: "ST8395",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-21.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G CAT-1 com fallback para 2G",
                    "Identifica o condutor pela entrada 1-Wire",
                    "Alertas embarcados de velocidade e movimento",
                ],
            },
            {
                n: "ST4305 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-21.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G LTE CAT-M1 com fallback para 2G",
                    "Baixo consumo de energia",
                    "Ideal para gestão de frotas de médio porte",
                ],
            },
            {
                n: "ST4945 4G Portátil",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/1214.webp",
                tag: "Rastreador",
                list: [
                    "Formato portátil com bateria interna recarregável",
                    "Tecnologia 4G com fallback para 2G",
                    "Ideal para cargas, containers e ativos móveis",
                    "Resistente a impactos e intempéries",
                ],
            },
            {
                n: "ST8310UM 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-20.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G CAT-1 com fallback para 2G",
                    "Versão compacta da linha ST8310",
                    "Alta capacidade e rapidez no envio de dados",
                ],
            },
            {
                n: "ST8300R 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-21.png",
                tag: "Rastreador",
                list: [
                    "Tecnologia 4G CAT-1 com fallback para 2G",
                    "Versão reforçada da linha ST8300",
                    "Identifica o condutor pela entrada 1-Wire",
                ],
            },
        ],
    },
    {
        cat: "Iscas de Cargas",
        items: [
            {
                n: "ST410 M",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-23.png",
                tag: "Equipamento",
                sub: "O dispositivo ideal para auxiliar na recuperação de cargas.",
                list: [
                    "Ativa o modo emergência ao ser violado ou em proximidade com jammer",
                    "Possui LBS e comunicação GPRS",
                    "Módulo RF 433MHz para auxiliar na recuperação",
                    "Rastreável através do ST480",
                    "Tamanho compacto",
                    "Bateria com autonomia de até 30 dias (pode variar conforme uso e rede)",
                ],
            },
            {
                n: "ST419 NG LORA",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-22.png",
                tag: "Equipamento",
                sub: "A isca de carga completa e versátil.",
                list: [
                    "Rastreamento com LoRa e módulo RF 900MHz",
                    "Comunicação GPRS e LoRa, compatível com LoRaWAN",
                    "Backup em caso de jammer ou ausência de sinal GPRS",
                    "Localização por GPS, LBS/GPRS e rede LoRa",
                    "Rastreável através do ST489",
                    "Bateria com autonomia de até 23 dias (pode variar conforme uso)",
                ],
            },
            {
                n: "ST4410G 4G",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-25.png",
                tag: "Equipamento",
                sub: "Solução integrada com localização por GPS e LBS, tecnologia 4G CAT-M1.",
                list: [
                    "Tecnologia 4G CAT-M1, NB-IoT e 2G*",
                    "Localização por GPS e LBS",
                    "Ideal para grandes volumes ou pequenos objetos",
                    "*Disponível apenas para chips 4G CAT-M1/NB-IoT/2G — consulte seu fornecedor",
                ],
                note: "Verifique a proporção do equipamento nas especificações técnicas. Consulte disponibilidade em estoque. Imagens ilustrativas.",
            },
            {
                n: "ST410 MG",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-26.png",
                tag: "Equipamento",
                list: [
                    "Ativa o modo emergência ao ser violado ou em proximidade com jammer",
                    "Possui LBS e comunicação GPRS",
                    "Versão com módulo GSM otimizado da linha ST410",
                    "Bateria com autonomia estendida",
                ],
            },
            {
                n: "ST449 G LORA",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-22.png",
                tag: "Equipamento",
                list: [
                    "Rastreamento com LoRa e módulo RF 900MHz",
                    "Comunicação GPRS e LoRa, compatível com LoRaWAN",
                    "Rastreável através do ST489",
                    "Bateria com autonomia estendida",
                ],
            },
            {
                n: "Isca Descartável",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/89089.png",
                tag: "Equipamento",
                list: [
                    "Uso único, descartável após ativação",
                    "Baixo custo, ideal para cargas específicas",
                    "Comunicação via GPRS",
                    "Fácil instalação, sem necessidade de fiação",
                ],
            },
        ],
    },
    {
        cat: "Acessórios Suntech",
        items: [
            {
                n: "ST480",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-30.png",
                tag: "Equipamento",
                sub: "Eficiente ferramenta para buscar iscas.",
                list: [
                    "Auxilia na busca e ativação de iscas para recuperação de cargas",
                    "Identifica o ID do dispositivo buscado",
                    "Antena omnidirecional | Comunicação GPRS",
                    "Possui GPS e módulo RF 433MHz",
                ],
            },
            {
                n: "ST489 LORA",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-30.png",
                tag: "Equipamento",
                sub: "Aparelho buscador compatível com a tecnologia LoRa.",
                list: [
                    "Buscador ideal para os rastreadores ST419, ST449 e ST390",
                    "Identifica o ID do dispositivo buscado",
                    "Comunicação RF 900MHz | Antena direcional",
                    "Bateria recarregável | Display LCD com ajuste de brilho",
                    "Configuração manual",
                ],
            },
            {
                n: "ST20U",
                img: "https://protectrastreamento.com.br/wp-content/uploads/2025/09/03-9Prancheta-29.png",
                tag: "Acessório",
                sub: "Acessório para leitura de CAN.",
                list: [
                    "Leitura de parâmetros: RPM, odômetro, consumo de combustível, horímetro, pressão do óleo, entre outros*",
                    "Compatível com protocolos J1939, J1708, ISO15765 e os rastreadores ST4305 e ST8300/ST8300R",
                ],
                note: "*Parâmetros sujeitos à disponibilidade do veículo. Verifique a proporção do equipamento nas especificações técnicas.",
            },
        ],
    },
];

function makeId(gi: number, ii: number) {
    return `${gi}-${ii}`;
}

export default function ProductSelector() {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggleSelected = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleExpanded = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelected(new Set());

    // mapa id -> nome, para montar a lista final sem precisar varrer o DOM
    const idToName = useMemo(() => {
        const map = new Map<string, string>();
        DATA.forEach((group, gi) => {
            group.items.forEach((item, ii) => {
                map.set(makeId(gi, ii), item.n);
            });
        });
        return map;
    }, []);

    const selectedCount = selected.size;

    const handleSend = () => {
        if (selectedCount === 0) return;

        const names: string[] = [];
        selected.forEach((id) => {
            const name = idToName.get(id);
            if (name) names.push(name);
        });

        let msg = "Olá! Gostaria de solicitar um orçamento dos seguintes produtos:\n\n";
        names.forEach((name, i) => {
            msg += `${i + 1}. ${name}\n`;
        });
        msg += "\nAguardo o retorno, obrigado!";

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank", "noopener");
    };

    return (
        <div className="psel">
            <div className="psel-nav-wrap">
                <Navbar />
            </div>
            <div className="psel-content">
                <div className="psel-head">
                    <h2>
                        Monte seu <span>pedido</span>
                    </h2>
                    <p>Selecione os produtos de interesse e envie sua lista direto pelo WhatsApp.</p>
                </div>

                <div>
                    {DATA.map((group, gi) => {
                        const catCount = group.items.filter((_, ii) => selected.has(makeId(gi, ii))).length;

                        return (
                            <div className="psel-cat" key={group.cat}>
                                <div className="psel-cat-head">
                                    <div className="psel-cat-title">
                                        <h3>{group.cat}</h3>
                                        <span className={`psel-cat-count${catCount > 0 ? " show" : ""}`}>
                                            {catCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="psel-grid">
                                    {group.items.map((item, ii) => {
                                        const id = makeId(gi, ii);
                                        const isSelected = selected.has(id);
                                        const isExpanded = expanded.has(id);
                                        const list = item.list && item.list.length ? item.list : FALLBACK_LIST;

                                        return (
                                            <div
                                                key={id}
                                                className={`psel-card${isSelected ? " selected" : ""}`}
                                                onClick={() => toggleSelected(id)}
                                            >
                                                <div className="psel-img-wrap">
                                                    {item.tag && <span className="psel-tag">{item.tag}</span>}
                                                    <div className="psel-check">
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth={3}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M5 12l5 5L19 7" />
                                                        </svg>
                                                    </div>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.img} alt={item.n} loading="lazy" />
                                                </div>

                                                <div className="psel-body">
                                                    <div className="psel-body-top">
                                                        <p className="psel-name">{item.n}</p>
                                                        {item.sub && <p className="psel-sub">{item.sub}</p>}

                                                        <div className={`psel-extra${isExpanded ? " open" : ""}`}>
                                                            <div className="psel-extra-inner">
                                                                <ul>
                                                                    {list.map((li, li_i) => (
                                                                        <li key={li_i}>{li}</li>
                                                                    ))}
                                                                </ul>
                                                                {item.note && <p className="psel-extra-note">{item.note}</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="psel-more"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpanded(id);
                                                        }}
                                                    >
                                                        {isExpanded ? "Ver menos" : "Ver mais"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`psel-bar${selectedCount > 0 ? " show" : ""}`}>
                <div className="psel-bar-info">
                    <b>
                        {selectedCount} {selectedCount === 1 ? "produto" : "produtos"}
                    </b>
                    <small>selecionados para o orçamento</small>
                </div>
                <div className="psel-bar-actions">
                    <button className="psel-clear" onClick={clearSelection}>
                        Limpar
                    </button>
                    <button className="psel-send" onClick={handleSend}>
                        Enviar pedido
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                        >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
            </div>
            <SimCardM2M />
            <PaymentMethods />
            <Footer />
            <style jsx>{`
        .psel {
          --gold: #f5c000;
          --gold-deep: #c89400;
          --ink: #1a1a1a;
          --ink-soft: #4a4a4a;
          --line: #ececec;
          --bg: #fafafa;
          --imgbg: #f5f5f5;
          font-family: "DM Sans", sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .psel-nav-wrap {
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
        }
        .psel-content {
          max-width: 1240px;
          margin: 0 auto;
          padding: 20px 24px 140px;
          box-sizing: border-box;
          flex: 1;
          width: 100%;
        }
        .psel * {
          box-sizing: border-box;
        }

        .psel-head {
          text-align: center;
          margin-bottom: 32px;
        }
        .psel-head h2 {
          font-size: 28px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 8px;
        }
        .psel-head p {
          font-size: 15px;
          color: var(--ink-soft);
          margin: 0;
        }
        .psel-head span {
          color: var(--gold-deep);
          font-weight: 800;
        }

        .psel-cat {
          border: 1px solid var(--line);
          border-radius: 16px;
          margin-bottom: 14px;
          overflow: hidden;
          background: #fff;
        }
        .psel-cat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 22px;
          background: #fff;
          border-bottom: 1px solid var(--line);
        }
        .psel-cat-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .psel-cat-title h3 {
          font-size: 16px;
          font-weight: 800;
          color: var(--ink);
          margin: 0;
          letter-spacing: 0.2px;
        }
        .psel-cat-count {
          display: none;
          font-size: 11px;
          font-weight: 800;
          color: var(--ink);
          background: var(--gold);
          border-radius: 999px;
          padding: 3px 9px;
          line-height: 1;
        }
        .psel-cat-count.show {
          display: inline-block;
        }

        /* Grid: colunas de largura mínima fixa, distribuídas igualmente
           (auto-fit fecha os "buracos" quando sobram poucos itens na
           última linha) e todos os cards com a mesma altura de linha. */
        .psel-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
          align-items: stretch;
          gap: 20px;
          padding: 20px;
        }

        .psel-card {
          position: relative;
          height: 100%;
          border: 1.5px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          background: #fff;
        }
        .psel-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px -18px rgba(0, 0, 0, 0.22);
        }
        .psel-card.selected {
          border-color: var(--gold);
          box-shadow: 0 0 0 2px var(--gold) inset;
        }

        .psel-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--imgbg);
          padding: 24px;
          position: relative;
          flex-shrink: 0;
        }
        .psel-card :global(img) {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .psel-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--gold);
          color: var(--ink);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          border-radius: 5px;
          text-transform: uppercase;
        }
        .psel-check {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #d8d8d8;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 2;
        }
        .psel-check svg {
          width: 13px;
          height: 13px;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: var(--ink);
        }
        .psel-card.selected .psel-check {
          background: var(--gold);
          border-color: var(--gold);
        }
        .psel-card.selected .psel-check svg {
          opacity: 1;
        }

        /* Corpo do card ocupa o restante da altura da linha; o botão
           "Ver mais" fica sempre colado no rodapé (margin-top: auto),
           então todos os cards de uma mesma linha terminam alinhados. */
        .psel-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .psel-body-top {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .psel-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.35;
          margin: 0;
        }
        .psel-sub {
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-soft);
          line-height: 1.45;
          margin: 0;
        }

        .psel-extra {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .psel-extra.open {
          max-height: 600px;
        }
        .psel-extra-inner {
          padding-top: 10px;
          margin-top: 6px;
          border-top: 1px solid var(--line);
        }
        .psel-extra-inner ul {
          margin: 0;
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .psel-extra-inner ul li {
          font-size: 11.5px;
          color: #555;
          line-height: 1.55;
        }
        .psel-extra-note {
          font-size: 11px;
          color: #999;
          font-style: italic;
          line-height: 1.5;
          margin: 8px 0 0;
        }

        .psel-more {
          margin-top: auto;
          display: block;
          width: 100%;
          background: transparent;
          color: var(--ink);
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 700;
          text-align: center;
          padding: 9px;
          border-radius: 8px;
          border: 1px solid var(--ink);
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .psel-more:hover {
          background: var(--ink);
          color: var(--gold);
        }

        .psel-bar {
          position: fixed;
          left: 50%;
          bottom: 20px;
          transform: translate(-50%, 140%);
          width: min(560px, calc(100% - 32px));
          background: var(--ink);
          border-radius: 16px;
          padding: 14px 16px 14px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.5);
          z-index: 999;
          transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2);
        }
        .psel-bar.show {
          transform: translate(-50%, 0);
        }
        .psel-bar-info {
          color: #fff;
        }
        .psel-bar-info b {
          color: var(--gold);
          font-size: 15px;
          font-weight: 800;
        }
        .psel-bar-info small {
          display: block;
          font-size: 11.5px;
          color: #c9c9c9;
          font-weight: 500;
          margin-top: 1px;
        }
        .psel-bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .psel-clear {
          background: none;
          border: none;
          color: #c9c9c9;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 6px 2px;
        }
        .psel-clear:hover {
          color: #fff;
        }
        .psel-send {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--gold);
          color: var(--ink);
          border: none;
          border-radius: 999px;
          font-family: inherit;
          font-weight: 800;
          font-size: 13.5px;
          padding: 12px 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .psel-send:hover {
          background: #fff;
          transform: translateX(2px);
        }
        .psel-send svg {
          width: 17px;
          height: 17px;
        }

        @media (max-width: 1024px) {
          .psel-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .psel-grid {
            grid-template-columns: 1fr;
          }
          .psel-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 16px;
          }
          .psel-bar-actions {
            justify-content: space-between;
          }
          .psel-send {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

        </div>
    );
}