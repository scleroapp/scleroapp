import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

const FARMACOS = [
  'Omeprazol', 'Acxxel', 'Inmunosupresor', 'Symbicort', 'Antihistamínico',
  'Paracetamol', 'Aciclovir', 'Curcumina', 'Metotrexato', 'Micofenolato',
  'Prednisona', 'Hidroxicloroquina', 'Bosentan', 'Sildenafilo', 'Nifedipino',
  'Otro'
];

const MOMENTOS = ['Mañana', 'Mediodía', 'Tarde', 'Noche', 'Con el desayuno', 'Con la comida', 'Con la cena', 'En ayunas'];

export default function Medicacion() {
  const { user } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ farmaco: '', dosis: '', momento: '', tomada: true, notas: '' });
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');

  async function cargar() {
    try {
      const q = query(collection(db, 'medicacion'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    await addDoc(collection(db, 'medicacion'), {
      uid: user.uid, ...form,
      fecha: fechaHoy,
      hora: format(new Date(), 'HH:mm'),
      timestamp: serverTimestamp(),
    });
    setForm({ farmaco: '', dosis: '', momento: '', tomada: true, notas: '' });
    setMostrarForm(false);
    setGuardando(false);
    cargar();
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    await deleteDoc(doc(db, 'medicacion', id));
    cargar();
  }

  const hoy = registros.filter(r => r.fecha === fechaHoy);
  const anteriores = registros.filter(r => r.fecha !== fechaHoy);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Medicación</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{hoy.length} tomas registradas hoy</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)} style={{ background: 'var(--teal-500)' }}>
          {mostrarForm ? 'Cancelar' : '+ Registrar toma'}
        </button>

        {mostrarForm && (
          <form onSubmit={guardar} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="section-header">Nueva toma</p>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 8 }}>Fármaco</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FARMACOS.map(f => (
                  <button type="button" key={f} onClick={() => setForm({ ...form, farmaco: f })}
                    className={`tag-pill${form.farmaco === f ? ' selected' : ''}`} style={{ fontSize: 12 }}>{f}</button>
                ))}
              </div>
              {form.farmaco === 'Otro' && (
                <input className="input-field" value={form.farmaco_otro || ''} onChange={e => setForm({ ...form, farmaco_otro: e.target.value })} placeholder="Nombre del fármaco" style={{ marginTop: 8 }} />
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Dosis</label>
              <input className="input-field" value={form.dosis} onChange={e => setForm({ ...form, dosis: e.target.value })} placeholder="Ej: 20mg, 1 comprimido..." />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 8 }}>Momento</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {MOMENTOS.map(m => (
                  <button type="button" key={m} onClick={() => setForm({ ...form, momento: m })}
                    className={`tag-pill${form.momento === m ? ' selected' : ''}`} style={{ fontSize: 12 }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 14, color: 'var(--slate-700)', flex: 1 }}>¿Tomada?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[true, false].map(v => (
                  <button type="button" key={String(v)} onClick={() => setForm({ ...form, tomada: v })}
                    className={`tag-pill${form.tomada === v ? ' selected' : ''}`}>{v ? 'Sí' : 'No'}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Notas</label>
              <textarea className="input-field" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones..." rows={2} style={{ resize: 'none' }} />
            </div>
            <button className="btn-primary" type="submit" disabled={guardando || !form.farmaco} style={{ background: 'var(--teal-500)' }}>{guardando ? 'Guardando...' : 'Guardar toma'}</button>
          </form>
        )}

        {loading && <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: 20 }}>Cargando...</p>}

        {hoy.length > 0 && (
          <>
            <p className="section-header">Hoy · {fechaHoy}</p>
            {hoy.map(r => (
              <div key={r.id} className="card" style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${r.tomada ? '#0284c7' : 'var(--slate-200)'}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: r.tomada ? '#e0f2fe' : 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.tomada
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-800)' }}>{r.farmaco}{r.dosis ? ` · ${r.dosis}` : ''}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{r.hora}{r.momento ? ` · ${r.momento}` : ''}</p>
                </div>
                <button onClick={() => eliminar(r.id)} style={{ background: 'none', border: 'none', color: 'var(--slate-300)', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            ))}
          </>
        )}

        {anteriores.length > 0 && (
          <>
            <p className="section-header" style={{ marginTop: 8 }}>Historial</p>
            {anteriores.slice(0, 30).map(r => (
              <div key={r.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate-800)' }}>{r.farmaco}{r.dosis ? ` · ${r.dosis}` : ''}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{r.fecha} · {r.hora}{r.momento ? ` · ${r.momento}` : ''}</p>
                </div>
                <span className={`badge ${r.tomada ? 'badge-teal' : 'badge-slate'}`}>{r.tomada ? 'Tomada' : 'No tomada'}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
