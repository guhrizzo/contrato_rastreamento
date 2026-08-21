# Painel retrátil (collapse/expand) — contrato e cadastro

## Contexto

As páginas [app/page.tsx](../../../app/page.tsx) (gerador de contrato) e
[app/cadastro/page.tsx](../../../app/cadastro/page.tsx) (cadastro de instalador)
usam o mesmo layout de duas colunas no desktop (`lg:` e acima):

- `<aside>` à esquerda (`lg:w-[45%] xl:w-[38%]`, `lg:h-screen lg:sticky lg:top-0`) com o
  formulário.
- `<section>` à direita, com o preview A4 do documento (`#contract-pdf`).

No mobile (`< lg`), já existe uma alternância própria ("Editar Cadastro" /
"Visualizar Ficha" ou equivalente) que resolve o mesmo problema de espaço —
esse fluxo não muda.

## Objetivo

No desktop, permitir que o painel de formulário retraia totalmente, deixando o
documento ocupar 100% da largura da tela, e reabra sob demanda — para
visualizar/imprimir/conferir o contrato sem a distração do formulário.

## Design

**Estado e persistência**

- Um novo estado local `panelOpen: boolean` em cada página (`page.tsx` e
  `cadastro/page.tsx`), inicializado a partir do `localStorage`
  (`localStorage.getItem('painelAberto') !== 'false'`, ou seja, aberto por
  padrão na primeira visita).
- Cada mudança de estado grava em `localStorage.setItem('painelAberto', ...)`.
- Chave de storage separada por página (`painelAberto:contrato` e
  `painelAberto:cadastro`) para não acoplar o estado das duas telas.
- Aplicado somente em telas `lg:` e acima — no mobile o `<aside>` continua
  seguindo a lógica atual de `mobileTab`, ignorando `panelOpen`.

**Fechar o painel**

- Botão de seta (`ChevronLeft`, ícone já disponível via `lucide-react`) no
  cabeçalho do `<aside>`, ao lado do botão "Site" existente. Ao clicar, seta
  `panelOpen(false)`.

**Reabrir o painel**

- Quando `panelOpen === false`, o `<aside>` inteiro deixa de renderizar (ou
  fica com `display:none` via classe condicional) e um botão flutuante
  pequeno aparece fixo no canto superior esquerdo da tela
  (`fixed top-4 left-4 z-40`, `lg:block hidden` — só desktop), com ícone
  `ChevronRight`, mesmo estilo visual do resto do header (fundo escuro,
  detalhe amarelo). Ao clicar, `panelOpen(true)`.

**Layout do `<section>` (documento)**

- Quando `panelOpen === false`, a classe de largura do `<section>` passa a
  ocupar 100% (`w-full`) em vez de dividir espaço com o `<aside>`; quando
  `panelOpen === true`, comportamento atual é mantido.

**Transição**

- `transition-all duration-300 ease-in-out` no `<aside>` (largura/opacity) e
  no botão flutuante (fade-in), para a troca não parecer um corte brusco.
  Como o `<aside>` some do fluxo quando fechado, a transição visual principal
  é a resposta do `<section>` ocupando o espaço liberado.

**Escopo**

- Implementação idêntica (mesmo padrão de estado, mesmos ícones) nas duas
  páginas, sem extrair componente compartilhado — ambas já têm bastante
  lógica própria embutida em client components de arquivo único, e o padrão
  desse repositório (visto nas duas páginas e no `cadastro`) é duplicar
  pequenos trechos de header/controles em vez de compartilhar componentes.
  Isso evita introduzir uma abstração nova só para ~15 linhas de JSX/estado
  repetidas.

## Fora de escopo

- Comportamento mobile (`< lg`) não muda.
- Não há redimensionamento manual (arrastar borda) do painel — é só
  aberto/fechado.
- `produtos/page.tsx` não tem esse layout de duas colunas e não é afetado.

## Teste manual

- Abrir `/` e `/cadastro` em viewport desktop (≥1024px), fechar o painel,
  confirmar que o documento ocupa a largura toda e o botão flutuante aparece.
- Reabrir e confirmar que o layout volta ao normal.
- Recarregar a página com o painel fechado e confirmar que continua fechado
  (persistência via `localStorage`).
- Redimensionar para mobile com o painel "fechado" no estado salvo e
  confirmar que o formulário aparece normalmente (estado desktop não vaza
  pro mobile).
