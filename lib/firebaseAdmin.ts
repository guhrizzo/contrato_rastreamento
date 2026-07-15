import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Transaction } from 'firebase-admin/firestore';

// Evita inicializar várias vezes em ambiente de desenvolvimento (hot-reload)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function getNextContractNumber(): Promise<number> {
  const docRef = db.collection('config').doc('contratos');
  
  return await db.runTransaction(async (transaction: Transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      // Se não existir, inicia em 2500
      transaction.set(docRef, { proximoNumero: 2501 });
      return 2500;
    }
    
    const data = doc.data();
    const currentNumber = data?.proximoNumero || 2500;
    
    // Atualiza o próximo para o próximo envio
    transaction.update(docRef, { proximoNumero: currentNumber + 1 });
    
    return currentNumber;
  });
}

export async function getNextTrackerNumber(): Promise<number> {
  const docRef = db.collection('config').doc('rastreadores');
  
  return await db.runTransaction(async (transaction: Transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      // Se não existir, inicia em 2500
      transaction.set(docRef, { proximoNumero: 2501 });
      return 2500;
    }
    
    const data = doc.data();
    const currentNumber = data?.proximoNumero || 2500;
    
    // Atualiza o próximo para o próximo envio
    transaction.update(docRef, { proximoNumero: currentNumber + 1 });
    
    return currentNumber;
  });
}
