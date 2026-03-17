import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ⚠️  IMPORTANTE: Sustituye estos valores por los de tu proyecto Firebase.
// Los encuentras en: Firebase Console → tu proyecto → ⚙️ → Configuración del proyecto → Tu app web
const firebaseConfig = {
  apiKey: "AIzaSyDCS7c4ULrcwrfkaM92DLhuR-D91-kfvmI",
  authDomain: "scleroapp.firebaseapp.com",
  projectId: "scleroapp",
  storageBucket: "scleroapp.firebasestorage.app",
  messagingSenderId: "237835268254D",
  appId: "1:237835268254:web:24d812624cab30ad798b8f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
