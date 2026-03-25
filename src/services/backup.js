import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAllPDFs, savePDF, clearAllPDFs } from './storage';

const COLECCIONES = ['tension', 'cuestionarios', 'citas', 'pruebas', 'medicacion'];

export async function exportarDatosJSON(uid) {
  const datos = {};
  for (const col of COLECCIONES) {
    const q = query(collection(db, col), where('uid', '==', uid));
    const snap = await getDocs(q);
    datos[col] = snap.docs.map(d => {
      const data = d.data();
      // Convert Firestore timestamps to strings
      const clean = {};
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v.toDate === 'function') clean[k] = v.toDate().toISOString();
        else clean[k] = v;
      }
      return { _id: d.id, ...clean };
    });
  }
  return datos;
}

export async function hacerBackup(uid) {
  // 1. Get all Firebase data
  const datos = await exportarDatosJSON(uid);

  // 2. Get all local PDFs
  const pdfs = await getAllPDFs();

  // 3. Build ZIP manually (without external lib) as a structured JSON + base64 PDFs
  const backup = {
    version: '1.0',
    fecha: new Date().toISOString(),
    uid,
    datos,
    pdfs: pdfs.map(p => ({
      id: p.id,
      nombre: p.nombre,
      fecha: p.fecha,
      data: arrayBufferToBase64(p.data)
    }))
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scleroapp-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return { registros: Object.values(datos).reduce((s, arr) => s + arr.length, 0), pdfs: pdfs.length };
}

export async function restaurarBackup(uid, file) {
  const text = await file.text();
  const backup = JSON.parse(text);

  if (!backup.version || !backup.datos) throw new Error('Fichero de backup no válido');

  // Restore Firebase data
  let restaurados = 0;
  for (const col of COLECCIONES) {
    if (!backup.datos[col]) continue;
    for (const item of backup.datos[col]) {
      const { _id, uid: _uid, ...data } = item;
      await addDoc(collection(db, col), { ...data, uid, timestamp: serverTimestamp() });
      restaurados++;
    }
  }

  // Restore PDFs
  if (backup.pdfs && backup.pdfs.length > 0) {
    for (const p of backup.pdfs) {
      const arrayBuffer = base64ToArrayBuffer(p.data);
      await savePDF(p.id, p.nombre, arrayBuffer);
    }
  }

  return { restaurados, pdfs: backup.pdfs?.length || 0 };
}

export async function exportarExcel(uid) {
  const datos = await exportarDatosJSON(uid);

  // Build CSV for each collection
  let contenido = '';

  for (const col of COLECCIONES) {
    if (!datos[col] || datos[col].length === 0) continue;
    contenido += `\n=== ${col.toUpperCase()} ===\n`;
    const keys = Object.keys(datos[col][0]).filter(k => k !== '_id' && k !== 'uid');
    contenido += keys.join(';') + '\n';
    for (const row of datos[col]) {
      contenido += keys.map(k => {
        const v = row[k];
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return JSON.stringify(v).replace(/;/g, ',');
        return String(v).replace(/;/g, ',');
      }).join(';') + '\n';
    }
  }

  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scleroapp-datos-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return Object.values(datos).reduce((s, arr) => s + arr.length, 0);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
