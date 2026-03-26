import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const PREGUNTAS_AMPLIABLES = [
  { id: 'contenido_desayuno', label: 'Desayuno', formulario: 'Mañana' },
  { id: 'suplementacion_tomada', label: 'Suplementación', formulario: 'Mañana' },
  { id: 'alimentos_almuerzo', label: 'Alimentos del almuerzo', formulario: 'Noche' },
  { id: 'alimentos_cena', label: 'Alimentos de la cena', formulario: 'Noche' },
  { id: 'infusiones_tomadas', label: 'Infusiones', formulario: 'Noche' },
  { id: 'medicacion_extra', label: 'Medicación extra tomada', formulario: 'Noche' },
];

export async function getOpcionesConfig(uid) {
  try {
    const snap = await getDoc(doc(db, 'configuracion', uid));
    if (snap.exists()) {
      return {
        extras: snap.data().opcionesExtra || {},
        ocultas: snap.data().opcionesOcultas || {},
      };
    }
  } catch (e) {}
  return { extras: {}, ocultas: {} };
}

// Keep old function for backward compatibility
export async function getOpcionesExtra(uid) {
  const config = await getOpcionesConfig(uid);
  return config.extras;
}

export async function saveOpcionesExtra(uid, opcionesExtra) {
  await setDoc(doc(db, 'configuracion', uid), { opcionesExtra }, { merge: true });
}

export async function saveOpcionesOcultas(uid, opcionesOcultas) {
  await setDoc(doc(db, 'configuracion', uid), { opcionesOcultas }, { merge: true });
}
