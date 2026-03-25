import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './useAuth';

export function usePerfil() {
  const { user } = useAuth();
  const [nombre, setNombreState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function cargar() {
      try {
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        if (snap.exists() && snap.data().nombre) {
          setNombreState(snap.data().nombre);
        }
      } catch (e) {}
      setLoading(false);
    }
    cargar();
  }, [user]);

  async function guardarNombre(nuevoNombre) {
    setNombreState(nuevoNombre);
    await setDoc(doc(db, 'usuarios', user.uid), { nombre: nuevoNombre }, { merge: true });
  }

  return { nombre, guardarNombre, loading };
}
