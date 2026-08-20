// app/api/send-contact/route.ts
// Endpoint que recebe o POST do formulário de contato (fetch direto do navegador)
// e envia o e-mail de notificação usando Resend.

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// E-mail(s) que devem receber a notificação de novo contato
const TO_EMAIL = 'Info@protectrastreamento.com';
const FROM_EMAIL = 'Protect Rastreamento <noreply@clube.gustavorizzo.net.br>'; // domínio verificado no Resend

// Troque pelo domínio real onde o formulário fica publicado (confira www vs sem www).
const ALLOWED_ORIGINS = [
  'https://protectrastreamento.com.br',
  'https://www.protectrastreamento.com.br',
];

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Navegadores mandam um preflight OPTIONS antes do POST real quando é cross-origin.
// Sem isso, o fetch() do navegador falha antes mesmo de chegar no POST.
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500, headers });
    }

    // O formulário envia os campos como form-urlencoded ou JSON, dependendo da origem.
    // Tratamos os dois casos para não depender de configuração exata.
    const contentType = request.headers.get('content-type') || '';
    const fields: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const body: any = await request.json();
      // O Elementor costuma mandar { fields: { nome: { value: "..." }, ... } }
      const rawFields = body.fields ?? body;
      for (const key in rawFields) {
        fields[key] = rawFields[key]?.value ?? rawFields[key];
      }
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        fields[key] = String(value);
      });
    }

    const {
      nome = 'Não informado',
      email = 'Não informado',
      telefone = 'Não informado',
      cidade = 'Não informado',
      tipo_de_pessoa = 'Não informado',
      cpf_cnpj = 'Não informado',
      como_nos_conheceu = 'Não informado',
      assunto = 'Contato pelo site',
      mensagem = 'Sem mensagem',
    } = fields;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #09090b; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #09090b 0%, #27272a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 4px solid #facc15;">
          <h1 style="color: #facc15; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Protect Rastreamento</h1>
          <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">Novo contato pelo site — ${assunto}</p>
        </div>

        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e4e4e7; border-top: none; border-bottom: none;">
          <h2 style="font-size: 18px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #facc15; padding-bottom: 8px;">
            Dados do Contato
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 180px; color: #71717a;">Nome:</td>
              <td style="padding: 6px 0; color: #09090b;">${nome}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">E-mail:</td>
              <td style="padding: 6px 0; color: #09090b;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Telefone:</td>
              <td style="padding: 6px 0; color: #09090b;">${telefone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Cidade:</td>
              <td style="padding: 6px 0; color: #09090b;">${cidade}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Tipo de pessoa:</td>
              <td style="padding: 6px 0; color: #09090b;">${tipo_de_pessoa}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">CPF/CNPJ:</td>
              <td style="padding: 6px 0; color: #09090b;">${cpf_cnpj}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Como conheceu:</td>
              <td style="padding: 6px 0; color: #09090b;">${como_nos_conheceu}</td>
            </tr>
          </table>

          <h2 style="font-size: 18px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #facc15; padding-bottom: 8px;">
            Mensagem
          </h2>
          <div style="background-color: #fefce8; padding: 15px; border-radius: 8px; border: 1px solid #facc15; color: #27272a; font-size: 14px; white-space: pre-wrap;">
            ${mensagem}
          </div>
        </div>

        <div style="padding: 20px; background-color: #09090b; border: 1px solid #27272a; border-top: 3px solid #facc15; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
            Este é um e-mail automático gerado pelo formulário de contato do site da Protect Rastreamento.
          </p>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email !== 'Não informado' ? email : undefined,
      subject: `Novo contato — ${assunto}`,
      html: emailHtml,
    });

    if (response.error) {
      console.error('Erro Resend:', response.error);
      return NextResponse.json({
        error: `Falha ao enviar email: ${response.error.message || 'Erro desconhecido no Resend'}`,
      }, { status: 500, headers });
    }

    return NextResponse.json({ success: true, id: response.data?.id }, { headers });
  } catch (error) {
    console.error('Erro no webhook de contato:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro interno ao processar o contato: ${msg}` }, { status: 500, headers });
  }
}