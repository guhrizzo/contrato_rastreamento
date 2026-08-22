import { NextResponse } from 'next/server';
import { getNextTrackerNumber } from '@/lib/firebaseAdmin';

// Reserva o próximo número de ficha ANTES de gerar o PDF do contrato do
// instalador. Sem isso, o PDF era gerado (e anexado ao e-mail) com "FICHA Nº
// PENDENTE" porque o número só existia depois do envio do e-mail.
export async function POST() {
  try {
    const fichaNumero = await getNextTrackerNumber();
    return NextResponse.json({ fichaNumero });
  } catch (error) {
    console.error('Erro ao reservar número da ficha:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro ao reservar número da ficha: ${msg}` }, { status: 500 });
  }
}
