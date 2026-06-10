import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nomeCompleto,
      cpf,
      rg,
      email,
      phone,
      cursoTecnico,
      certificadoInstalacao,
      tiposInstalacao,
      outrosInstalacao,
      cnpj,
      nomeContato,
      telefoneEmpresa,
      comentarios,
      autorizacao,
      documentoBase64,
      documentoNome,
      documentoTipo,
    } = body;

    // Validações de campos obrigatórios
    if (!nomeCompleto || !cpf || !rg || !email || !phone || !tiposInstalacao || tiposInstalacao.length === 0 || !autorizacao) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Preparar os anexos
    const attachments = [];
    if (documentoBase64 && documentoNome) {
      // Remove o prefixo data:image/...;base64, se houver
      const cleanBase64 = documentoBase64.includes(';base64,')
        ? documentoBase64.split(';base64,')[1]
        : documentoBase64;

      attachments.push({
        filename: documentoNome,
        content: Buffer.from(cleanBase64, 'base64'),
      });
    }

    // Criar o template HTML do e-mail com design premium e limpo
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1f2937; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Protect Rastreamento</h1>
          <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Novo Cadastro de Instalador de Dispositivos</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-bottom: none;">
          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            Informações Pessoais
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 180px; color: #64748b;">Nome Completo:</td>
              <td style="padding: 6px 0; color: #0f172a;">${nomeCompleto}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">CPF:</td>
              <td style="padding: 6px 0; color: #0f172a;">${cpf}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">RG:</td>
              <td style="padding: 6px 0; color: #0f172a;">${rg}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">E-mail:</td>
              <td style="padding: 6px 0; color: #0f172a;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Telefone:</td>
              <td style="padding: 6px 0; color: #0f172a;">${phone}</td>
            </tr>
          </table>

          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            Experiência & Certificações
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 220px; color: #64748b;">Possui Curso Técnico:</td>
              <td style="padding: 6px 0; color: #0f172a;">${cursoTecnico ? 'Sim' : 'Não'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Possui Certificado de Rastreadores:</td>
              <td style="padding: 6px 0; color: #0f172a;">${certificadoInstalacao ? 'Sim' : 'Não'}</td>
            </tr>
          </table>

          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            Tipos de Instalação Realizados
          </h2>
          <div style="margin-bottom: 25px;">
            <ul style="margin: 0; padding-left: 20px; color: #0f172a;">
              ${tiposInstalacao.map((tipo: string) => `<li style="margin-bottom: 4px;">${tipo}</li>`).join('')}
            </ul>
            ${outrosInstalacao ? `
              <div style="margin-top: 10px; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <strong style="font-size: 13px; color: #475569;">Descrição do campo Outros:</strong>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;">${outrosInstalacao}</p>
              </div>
            ` : ''}
          </div>

          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            Referência Profissional
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 180px; color: #64748b;">CNPJ da Empresa:</td>
              <td style="padding: 6px 0; color: #0f172a;">${cnpj || 'Não Informado'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Nome do Contato:</td>
              <td style="padding: 6px 0; color: #0f172a;">${nomeContato || 'Não Informado'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Telefone de Contato:</td>
              <td style="padding: 6px 0; color: #0f172a;">${telefoneEmpresa || 'Não Informado'}</td>
            </tr>
          </table>

          ${comentarios ? `
            <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
              Comentários / Observações
            </h2>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; color: #334155; font-size: 14px;">
              ${comentarios.replace(/\n/g, '<br/>')}
            </div>
          ` : ''}

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-top: 10px;">
            <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 500;">
              ✓ O instalador declarou que todas as informações fornecidas são verdadeiras e completas e autorizou a verificação dos dados.
            </p>
          </div>
        </div>

        <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Este é um e-mail automático gerado pelo Formulário de Cadastro da Protect Rastreamento.
          </p>
        </div>
      </div>
    `;

    // Enviar o e-mail via Resend
    const response = await resend.emails.send({
      from: 'Protect Rastreamento <noreply@clube.gustavorizzo.net.br>',
      to: ['noreply@clube.gustavorizzo.net.br', email],
      subject: `🛠️ Novo Cadastro de Instalador: ${nomeCompleto}`,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (response.error) {
      console.error('Erro Resend:', response.error);
      return NextResponse.json({
        error: `Falha ao enviar email: ${response.error.message || 'Erro desconhecido no Resend'}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cadastro enviado com sucesso!',
    });

  } catch (error) {
    console.error('Erro no processamento do cadastro:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro interno ao processar cadastro: ${msg}` }, { status: 500 });
  }
}
