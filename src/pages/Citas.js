import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format, isPast, differenceInDays, parseISO } from 'date-fns';
import { HospitalSelector } from '../components/HospitalSelector';
import { es } from 'date-fns/locale';

const ESPECIALIDADES = ['Reumatología', 'Cardiología', 'Neumología', 'Dermatología', 'Nefrología', 'Digestivo', 'Neurología', 'Medicina Interna', 'Fisioterapia', 'Otra'];

export default function Citas() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [verPasadas, setVerPasadas] = useState(false);
  const [form, setForm] = useState({ doctor: '', especialidad: '', lugar: '', fecha: '', hora: '', pruebas_solicitadas: '', detalles: '' });

  async function cargar() {
    try {
      const q = query(collection(db, 'citas'), where('uid', '==', user.uid), orderBy('fecha', 'asc'));
      const snap = await getDocs(q);
      setCitas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    await addDoc(collection(db, 'citas'), { uid: user.uid, ...form, timestamp: serverTimestamp() });
    setForm({ doctor: '', especialidad: '', lugar: '', fecha: '', hora: '', pruebas_solicitadas: '', detalles: '' });
    setMostrarForm(false);
    setGuardando(false);
    cargar();
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    await deleteDoc(doc(db, 'citas', id));
    cargar();
  }

  const hoy = format(new Date(), 'yyyy-MM-dd');
  const proximas = citas.filter(c => c.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pasadas = citas.filter(c => c.fecha < hoy).sort((a, b) => b.fecha.localeCompare(a.fecha));

  function diasRestantes(fecha) {
    const diff = differenceInDays(parseISO(fecha), new Date());
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  }

  function CitaCard({ cita, pasada }) {
    return (
      <div className="card" style={{ padding: '14px 16px', borderLeft: `3px solid ${pasada ? 'var(--slate-200)' : 'var(--teal-500)'}`, opacity: pasada ? 0.8 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-800)' }}>{cita.doctor}</p>
            <p style={{ fontSize: 13, color: 'var(--teal-500)', fontWeight: 500, marginTop: 2 }}>{cita.especialidad}</p>
            <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>{cita.fecha} · {cita.hora}{cita.lugar ? ` · ${cita.lugar}` : ''}</p>
            {!pasada && <span className="badge badge-teal" style={{ marginTop: 6, fontSize: 11 }}>{diasRestantes(cita.fecha)}</span>}
            {cita.pruebas_solicitadas && <p style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--slate-100)' }}><strong>Pruebas:</strong> {cita.pruebas_solicitadas}</p>}
            {cita.detalles && <p style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 4 }}>{cita.detalles}</p>}
          </div>
          <button onClick={() => eliminar(cita.id)} style={{ background: 'none', border: 'none', color: 'var(--slate-300)', cursor: 'pointer', padding: '0 0 0 12px', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Citas médicas</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{proximas.length} próximas · {pasadas.length} pasadas</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)} style={{ background: 'var(--teal-500)' }}>
          {mostrarForm ? 'Cancelar' : '+ Nueva cita'}
        </button>

        {mostrarForm && (
          <form onSubmit={guardar} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="section-header">Nueva cita</p>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Doctor / Doctora</label>
              <input className="input-field" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} placeholder="Dra. Martínez" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Especialidad</label>
              <select className="input-field" value={form.especialidad} onChange={e => setForm({ ...form, especialidad: e.target.value })} required style={{ appearance: 'none' }}>
                <option value="">Seleccionar...</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Centro / Hospital</label>
              <HospitalSelector value={form.lugar} onChange={v => setForm({ ...form, lugar: v })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Fecha</label>
                <input className="input-field" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </div>
              <div style={{ width: 120 }}>
                <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Hora</label>
                <input className="input-field" type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Pruebas solicitadas</label>
              <input className="input-field" value={form.pruebas_solicitadas} onChange={e => setForm({ ...form, pruebas_solicitadas: e.target.value })} placeholder="Analítica completa, ECG..." />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--slate-400)', display: 'block', marginBottom: 5 }}>Detalles / Notas</label>
              <textarea className="input-field" value={form.detalles} onChange={e => setForm({ ...form, detalles: e.target.value })} placeholder="Motivo de la consulta, lo que quiero preguntar..." rows={3} style={{ resize: 'none' }} />
            </div>
            <button className="btn-primary" type="submit" disabled={guardando} style={{ background: 'var(--teal-500)' }}>{guardando ? 'Guardando...' : 'Guardar cita'}</button>
          </form>
        )}

        {loading && <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: 20 }}>Cargando...</p>}

        {proximas.length > 0 && (
          <>
            <p className="section-header">Próximas</p>
            {proximas.map(c => <CitaCard key={c.id} cita={c} pasada={false} />)}
          </>
        )}

        {pasadas.length > 0 && (
          <>
            <button onClick={() => setVerPasadas(!verPasadas)} className="btn-ghost" style={{ textAlign: 'left', padding: '8px 0', fontSize: 13, color: 'var(--slate-500)' }}>
              {verPasadas ? '▾' : '▸'} Citas pasadas ({pasadas.length})
            </button>
            {verPasadas && pasadas.map(c => <CitaCard key={c.id} cita={c} pasada={true} />)}
          </>
        )}

        {!loading && citas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--slate-400)' }}>
            <p style={{ fontSize: 15 }}>Sin citas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
