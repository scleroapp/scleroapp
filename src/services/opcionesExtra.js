import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// IDs de las preguntas que se pueden ampliar
export const PREGUNTAS_AMPLIABLES = [
  { id: 'contenido_desayuno', label: 'Desayuno', formulario: 'Mañana' },
  { id: 'alimentos_almuerzo', label: 'Alimentos del almuerzo', formulario: 'Noche' },
  { id: 'alimentos_cena', label: 'Alimentos de la cena', formulario: 'Noche' },
  { id: 'medicacion_extra', label: 'Medicación extra tomada', formulario: 'Noche' },
];

export async function getOpcionesExtra(uid) {
  try {
    const snap = await getDoc(doc(db, 'configuracion', uid));
    if (snap.exists() && snap.data().opcionesExtra) {
      return snap.data().opcionesExtra;
    }
  } catch (e) {}
  return {};
}

export async function saveOpcionesExtra(uid, opcionesExtra) {
  await setDoc(doc(db, 'configuracion', uid), { opcionesExtra }, { merge: true });
}
