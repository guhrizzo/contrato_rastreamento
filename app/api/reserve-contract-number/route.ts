import { NextResponse } from 'next/server';
import { getNextContractNumber } from '@/lib/firebaseAdmin';

// Reserva o próximo número de contrato ANTES de gerar o PDF, para o
// documento já sair com o número real em vez de aparecer em branco/pendente.
export async function POST() {
  try {
    const contractNumber = await getNextContractNumber();
    return NextResponse.json({ contractNumber });
  } catch (error) {
    console.error('Erro ao reservar número do contrato:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json({ error: `Erro ao reservar número do contrato: ${msg}` }, { status: 500 });
  }
}
