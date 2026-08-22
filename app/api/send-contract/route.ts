import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getNextContractNumber } from '@/lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientEmail, clientName, contractPdfBase64, contractPdfNome, contractNumber: reservedContractNumber } = body;

    // Validações
    if (!clientEmail || !clientName || !contractPdfBase64) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // O número do contrato normalmente já foi reservado pelo frontend (via
    // /api/reserve-contract-number) ANTES de gerar o PDF anexado, para o
    // documento sair com o número real em vez de ficar em branco. Se por
    // algum motivo não vier (ex.: chamada antiga), gera um novo aqui mesmo.
    const contractNumber = reservedContractNumber ?? String(await getNextContractNumber());

    // Anexa o contrato completo (com todas as cláusulas e assinaturas) em
    // PDF. Antes, o contrato inteiro era embutido como HTML no corpo do
    // e-mail — isso costumava sair "cortado", porque o Gmail (e outros
    // clientes de e-mail) trunca mensagens cujo corpo HTML passa de
    // ~102KB. Um PDF anexado não sofre esse limite.
    const cleanPdfBase64 = contractPdfBase64.includes(';base64,')
      ? contractPdfBase64.split(';base64,')[1]
      : contractPdfBase64;

    const attachments = [{
      filename: contractPdfNome || `Contrato_Rastreamento_${clientName}.pdf`,
      content: Buffer.from(cleanPdfBase64, 'base64'),
    }];

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #09090b; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #09090b 0%, #27272a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 4px solid #facc15;">
          <h1 style="color: #facc15; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Protect Rastreamento</h1>
          <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">Contrato de Rastreamento Veicular Nº ${contractNumber}</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e4e4e7; border-top: none; border-bottom: none;">
          <p style="color: #333; font-size: 14px; margin-bottom: 20px;">Olá,</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Um novo contrato de prestação de serviços de rastreamento foi preenchido e assinado digitalmente por <strong>${clientName}</strong> (${clientEmail}).
          </p>

          <div style="background-color: #fef9c3; border: 1px solid #eab308; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #09090b; font-weight: 500;">
              Este e-mail é uma cópia de segurança enviada automaticamente tanto para a administração da Protect Rastreamento quanto para o Contratante.
            </p>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <p style="margin: 0; font-size: 13px; color: #09090b; font-weight: 500;">
              📎 O contrato completo, com todas as cláusulas e as assinaturas coletadas, está anexado a este e-mail em PDF.
            </p>
          </div>
        </div>

        <div style="padding: 20px; background-color: #09090b; border: 1px solid #27272a; border-top: 3px solid #facc15; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Protect Rastreamento. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;

    // Envia o email via Resend
    const response = await resend.emails.send({
      from: 'Protect Rastreamento <noreply@clube.gustavorizzo.net.br>',
      to: ['Info@protectrastreamento.com', clientEmail],
      subject: `📄 Novo Contrato de Rastreamento Assinado - ${clientName}`,
      html: emailHtml,
      attachments,
    });

    // Verifica se enviou com sucesso
    if (response.error) {
      console.error('Erro Resend:', response.error);
      return NextResponse.json({
        error: `Falha ao enviar email: ${response.error.message || response.error.name || 'Erro no provedor Resend'}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contractNumber,
      message: `Contrato enviado com sucesso para Info@protectrastreamento.com e ${clientEmail}`
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro interno ao processar requisição: ${msg}` }, { status: 500 });
  }
}
