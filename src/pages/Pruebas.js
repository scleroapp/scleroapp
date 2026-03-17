import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

const TIPOS_PRUEBA = ['Analítica de sangre', 'Analítica de orina', 'Radiografía', 'Ecografía', 'TAC', 'RMN', 'Espirometría', 'Ecocardiograma', 'Capilaroscopia', 'Electromiografía', 'Biopsia', 'Prueba de esfuerzo', 'Otra'];

export default function Pruebas() {
  const { user } = useAuth();
  const [pruebas, setPruebas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ tipo: '', fecha: '', lugar: '', doctor_solicitante: '', resultado: '', notas: '' });

  async function cargar() {
    try {
      const q = query(collection(db, 'pruebas'), where('uid', '==', user.uid), orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      setPruebas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    await addDoc(collection(db, 'pruebas'), { uid: user.uid, ...form, timestamp: serverTimestamp() });
    setForm({ tipo: '', fecha: '', lugar: '', doctor_solicitante: '', resultado: '', notas: '' });
    setMostrarForm(false);
    setGuardando(false);
    cargar();
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta prueba?')) return;
    await deleteDoc(doc(db, 'pruebas', id));
    cargar();
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: '#dc2626', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Pruebas médicas</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{pruebas.length} registradas</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)} style={{ background: '#dc2626' }}>
          {mostrarForm ? 'Cancelar' : '+ Registrar prueba'}
        </button>

        {mostrarForm && (
          <form onSubmit={guardar} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="section-header">Nueva prueba</p>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Tipo de prueba</label>
              <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} required style={{ appearance: 'none' }}>
                <option value="">Seleccionar...</option>
                {TIPOS_PRUEBA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Fecha</label>
                <input className="input-field" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Centro / Hospital</label>
              <input className="input-field" value={form.lugar} onChange={e => setForm({ ...form, lugar: e.target.value })} placeholder="Hospital Valle Verde" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Doctor solicitante</label>
              <input className="input-field" value={form.doctor_solicitante} onChange={e => setForm({ ...form, doctor_solicitante: e.target.value })} placeholder="Dra. Martínez" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Resultado / Valores</label>
              <textarea className="input-field" value={form.resultado} onChange={e => setForm({ ...form, resultado: e.target.value })} placeholder="Resultados principales..." rows={3} style={{ resize: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Notas adicionales</label>
              <textarea className="input-field" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones, indicaciones del médico..." rows={2} style={{ resize: 'none' }} />
            </div>
            <button className="btn-primary" type="submit" disabled={guardando} style={{ background: '#dc2626' }}>{guardando ? 'Guardando...' : 'Guardar prueba'}</button>
          </form>
        )}

        {loading && <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: 20 }}>Cargando...</p>}

        {!loading && pruebas.length === 0 && !mostrarForm && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--slate-400)' }}>
            <p style={{ fontSize: 15 }}>Sin pruebas registradas</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pruebas.map(p => (
            <div key={p.id} className="card" style={{ padding: '14px 16px', borderLeft: '3px solid #dc2626' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-800)' }}>{p.tipo}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3 }}>{p.fecha}{p.lugar ? ` · ${p.lugar}` : ''}{p.doctor_solicitante ? ` · ${p.doctor_solicitante}` : ''}</p>
                  {p.resultado && <p style={{ fontSize: 13, color: 'var(--slate-600)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--slate-100)' }}>{p.resultado}</p>}
                  {p.notas && <p style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 4, fontStyle: 'italic' }}>{p.notas}</p>}
                </div>
                <button onClick={() => eliminar(p.id)} style={{ background: 'none', border: 'none', color: 'var(--slate-300)', cursor: 'pointer', paddingLeft: 12, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
