import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getNextContractNumber } from '@/lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

// Função para extrair imagens base64 do HTML
function extractBase64Images(html: string): { cleanHtml: string; images: Array<{ data: string; filename: string }> } {
  const images: Array<{ data: string; filename: string }> = [];
  let imageCounter = 0;
  
  // Regex para encontrar imagens base64
  const base64ImageRegex = /src="data:image\/([a-z]+);base64,([^"]+)"/g;
  
  let cleanHtml = html;
  let match;
  
  while ((match = base64ImageRegex.exec(html)) !== null) {
    const imageType = match[1]; // png, jpeg, etc
    const base64Data = match[2];
    const filename = `signature-${imageCounter}.${imageType}`;
    
    images.push({
      data: base64Data,
      filename: filename
    });
    
    // Substitui a imagem base64 por uma referência de CID (Content ID) para inline
    cleanHtml = cleanHtml.replace(
      match[0],
      `src="cid:${filename}"`
    );
    
    imageCounter++;
  }
  
  return { cleanHtml, images };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientEmail, clientName, contractHtml } = body;

    // Validações
    if (!clientEmail || !clientName || !contractHtml) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Extrai as imagens base64 do HTML
    const { cleanHtml, images } = extractBase64Images(contractHtml);

    // Prepara os anexos a partir das imagens extraídas
    const attachments = images.map(img => {
      const ext = img.filename.split('.').pop() || 'png';
      return {
        filename: img.filename,
        content: Buffer.from(img.data, 'base64'),
      };
    });

    // Build o objeto de email com anexos apenas se houver
    const emailPayload: any = {
      from: 'Protect Rastreamento <noreply@clube.gustavorizzo.net.br>',
      to: ['Info@protectrastreamento.com', clientEmail],
      subject: `📄 Novo Contrato de Rastreamento Assinado - ${clientName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffd700; margin: 0; font-size: 24px;">Protect Rastreamento</h1>
            <p style="color: #ccc; margin: 5px 0 0 0; font-size: 12px;">Novo contrato assinado por ${clientName}</p>
          </div>
          
          <div style="padding: 30px; background: #fff; border: 1px solid #e5e5e5;">
            <p style="color: #333; font-size: 14px; margin-bottom: 20px;">
              Olá,
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Um novo contrato de prestação de serviços de rastreamento foi preenchido e assinado digitalmente por <strong>${clientName}</strong> (Email: ${clientEmail}).
            </p>

            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #ffd700; border-radius: 4px; margin: 20px 0;">
              <p style="color: #333; font-size: 13px; margin: 0;">
                Este e-mail é uma cópia de segurança enviada automaticamente tanto para a administração da <strong>Protect Rastreamento</strong> quanto para o <strong>Contratante</strong>.
              </p>
            </div>
          </div>

          <!-- CONTRATO EMBUTIDO -->
          <div style="padding: 30px; background: #f8f9fa; border: 1px solid #e5e5e5; border-top: none; font-size: 12px; line-height: 1.5; color: #333;">
            <h2 style="text-align: center; font-size: 16px; margin-bottom: 20px; color: #000;">
              CONTEÚDO DO CONTRATO ASSINADO
            </h2>
            ${cleanHtml}
          </div>

          <div style="padding: 20px; background: #f8f9fa; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #999; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} Protect Rastreamento. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `,
    };

    // Adiciona anexos se houver
    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    // Envia o email via Resend
    const response = await resend.emails.send(emailPayload);

    // Verifica se enviou com sucesso
    if (response.error) {
      console.error('Erro Resend:', response.error);
      return NextResponse.json({ 
        error: `Falha ao enviar email: ${response.error.message || response.error.name || 'Erro no provedor Resend'}` 
      }, { status: 500 });
    }

    const nextContractNumber = await getNextContractNumber();

    return NextResponse.json({
      success: true,
      contractNumber: nextContractNumber,
      message: `Contrato enviado com sucesso para Info@protectrastreamento.com e ${clientEmail}`
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro interno ao processar requisição: ${msg}` }, { status: 500 });
  }
}
