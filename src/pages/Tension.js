import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function clasificar(s, d) {
  if (s < 120 && d < 80) return { label: 'Normal', cls: 'badge-green' };
  if (s < 130 && d < 80) return { label: 'Elevada', cls: 'badge-amber' };
  if (s < 140 || d < 90) return { label: 'Alta I', cls: 'badge-amber' };
  return { label: 'Alta II', cls: 'badge-red' };
}

export default function Tension() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ sistolica: '', diastolica: '', frecuencia_cardiaca: '', momento: 'manana', notas: '' });

  async function cargarRegistros() {
    try {
      const q = query(collection(db, 'tension'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
    setLoading(false);
  }

  useEffect(() => { cargarRegistros(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    await addDoc(collection(db, 'tension'), {
      uid: user.uid,
      sistolica: parseInt(form.sistolica),
      diastolica: parseInt(form.diastolica),
      frecuencia_cardiaca: form.frecuencia_cardiaca ? parseInt(form.frecuencia_cardiaca) : null,
      momento: form.momento,
      notas: form.notas,
      timestamp: serverTimestamp(),
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
    });
    setForm({ sistolica: '', diastolica: '', frecuencia_cardiaca: '', momento: 'manana', notas: '' });
    setMostrarForm(false);
    setGuardando(false);
    cargarRegistros();
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    await deleteDoc(doc(db, 'tension', id));
    cargarRegistros();
  }

  const ultima = registros[0];

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Tensión arterial</h1>
        {ultima && (
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>Última lectura · {ultima.fecha} {ultima.hora}</p>
              <p style={{ color: 'white', fontSize: 32, fontWeight: 600, lineHeight: 1 }}>
                {ultima.sistolica}<span style={{ fontSize: 18, opacity: 0.7 }}>/</span>{ultima.diastolica}
                <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8, marginLeft: 6 }}>mmHg</span>
              </p>
              {ultima.frecuencia_cardiaca && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>FC: {ultima.frecuencia_cardiaca} ppm</p>}
            </div>
            <span className={`badge ${clasificar(ultima.sistolica, ultima.diastolica).cls}`} style={{ fontSize: 13 }}>
              {clasificar(ultima.sistolica, ultima.diastolica).label}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Botón añadir */}
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)} style={{ marginBottom: 16 }}>
          {mostrarForm ? 'Cancelar' : '+ Registrar nueva toma'}
        </button>

        {/* Formulario */}
        {mostrarForm && (
          <form onSubmit={guardar} className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p className="section-header">Nueva toma</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Sistólica</label>
                <input className="input-field" type="number" value={form.sistolica} onChange={e => setForm({ ...form, sistolica: e.target.value })} placeholder="120" required min="60" max="250" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Diastólica</label>
                <input className="input-field" type="number" value={form.diastolica} onChange={e => setForm({ ...form, diastolica: e.target.value })} placeholder="80" required min="40" max="150" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>F. Card.</label>
                <input className="input-field" type="number" value={form.frecuencia_cardiaca} onChange={e => setForm({ ...form, frecuencia_cardiaca: e.target.value })} placeholder="70" min="40" max="200" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 8 }}>Momento</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['manana', 'tarde', 'noche'].map(m => (
                  <button type="button" key={m} onClick={() => setForm({ ...form, momento: m })} className="tag-pill" style={{ flex: 1, justifyContent: 'center' }}
                    data-selected={form.momento === m}>
                    <span className={form.momento === m ? 'selected' : ''} style={{ display: 'contents' }}>
                      {m === 'manana' ? 'Mañana' : m === 'tarde' ? 'Tarde' : 'Noche'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Notas (opcional)</label>
              <textarea className="input-field" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Ej: después de ejercicio..." rows={2} style={{ resize: 'none' }} />
            </div>
            <button className="btn-primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar toma'}</button>
          </form>
        )}

        {/* Lista */}
        <p className="section-header">Historial</p>
        {loading && <p style={{ color: 'var(--slate-400)', fontSize: 14, textAlign: 'center', padding: 20 }}>Cargando...</p>}
        {!loading && registros.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--slate-400)' }}>
            <p style={{ fontSize: 15 }}>Sin registros todavía</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Añade tu primera toma arriba</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {registros.map(r => {
            const cls = clasificar(r.sistolica, r.diastolica);
            return (
              <div key={r.id} className="card" style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--slate-800)' }}>{r.sistolica}/{r.diastolica}</span>
                    <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>mmHg</span>
                    {r.frecuencia_cardiaca && <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>· FC {r.frecuencia_cardiaca}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3 }}>{r.fecha} · {r.hora} · {r.momento === 'manana' ? 'Mañana' : r.momento === 'tarde' ? 'Tarde' : 'Noche'}</p>
                  {r.notas && <p style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 4, fontStyle: 'italic' }}>{r.notas}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${cls.cls}`}>{cls.label}</span>
                  <button onClick={() => eliminar(r.id)} style={{ background: 'none', border: 'none', color: 'var(--slate-300)', cursor: 'pointer', padding: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
