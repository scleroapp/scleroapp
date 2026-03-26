import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { cuestionarioManana, cuestionarioNoche } from '../data/cuestionarios';
import { getOpcionesExtra } from '../services/opcionesExtra';

function ScaleInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => {
        const isSelected = value === n;
        const colorClass = n <= 3 ? '' : n <= 6 ? 'medium' : 'high';
        return (
          <button type="button" key={n} onClick={() => onChange(n)}
            className={`scale-btn${isSelected ? ` selected ${colorClass}` : ''}`}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

function OptionsInput({ opciones, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {opciones.map(op => (
        <button type="button" key={op} onClick={() => onChange(op)}
          className={`tag-pill${value === op ? ' selected' : ''}`}>
          {op}
        </button>
      ))}
    </div>
  );
}

function MultiSelectInput({ opciones, opcionesExtra = [], value = [], onChange }) {
  const toggle = (op) => {
    const next = value.includes(op) ? value.filter(v => v !== op) : [...value, op];
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {[...opciones, ...opcionesExtra].map(op => (
        <button type="button" key={op} onClick={() => toggle(op)}
          className={`tag-pill${value.includes(op) ? ' selected' : ''}`}>
          {op}
        </button>
      ))}
    </div>
  );
}

export default function CuestionarioForm({ tipo }) {
  const { user } = useAuth();
  const [respuestas, setRespuestas] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');
  const preguntas = tipo === 'manana' ? cuestionarioManana : cuestionarioNoche;

  const [opcionesExtra, setOpcionesExtra] = useState({});

  useEffect(() => {
    async function loadOpciones() {
      const extras = await getOpcionesExtra(user.uid);
      setOpcionesExtra(extras);
    }
    loadOpciones();
  }, [user.uid]);

  useEffect(() => {
    async function check() {
      try {
        const q = query(collection(db, 'cuestionarios'), where('uid', '==', user.uid), where('fecha', '==', fechaHoy), where('tipo', '==', tipo));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setYaExiste(true);
          const data = snap.docs[0].data().respuestas || {};
          setRespuestas(data);
        }
      } catch (e) {}
    }
    check();
  }, [tipo, fechaHoy, user.uid]);

  const set = (id, val) => setRespuestas(prev => ({ ...prev, [id]: val }));

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    await addDoc(collection(db, 'cuestionarios'), {
      uid: user.uid,
      tipo,
      fecha: fechaHoy,
      respuestas,
      timestamp: serverTimestamp(),
    });
    setGuardado(true);
    setYaExiste(true);
    setGuardando(false);
  }

  if (guardado) return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ width: 56, height: 56, background: 'var(--green-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--slate-800)' }}>¡Guardado!</p>
      <p style={{ fontSize: 14, color: 'var(--slate-400)', marginTop: 8 }}>Cuestionario de {tipo === 'manana' ? 'mañana' : 'noche'} completado</p>
    </div>
  );

  return (
    <form onSubmit={guardar} style={{ padding: '0 16px 100px' }}>
      {yaExiste && (
        <div style={{ background: 'var(--amber-50)', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', margin: '12px 0', fontSize: 13, color: 'var(--amber-500)' }}>
          Ya completaste este cuestionario hoy. Puedes editarlo y volver a guardar.
        </div>
      )}
      {preguntas.map(seccion => (
        <div key={seccion.seccion} style={{ marginTop: 20 }}>
          <p className="section-header">{seccion.seccion}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {seccion.preguntas.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 14px' }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--slate-700)' }}>{p.label}</label>
                {p.tipo === 'scale' && <ScaleInput value={respuestas[p.id]} onChange={v => set(p.id, v)} />}
                {p.tipo === 'options' && <OptionsInput opciones={p.opciones} value={respuestas[p.id]} onChange={v => set(p.id, v)} />}
                {p.tipo === 'multiselect' && <MultiSelectInput opciones={p.opciones} opcionesExtra={opcionesExtra[p.id] || []} value={respuestas[p.id]} onChange={v => set(p.id, v)} />}
                {p.tipo === 'time' && <input type="time" className="input-field" value={respuestas[p.id] || ''} onChange={e => set(p.id, e.target.value)} style={{ marginTop: 8, width: 140 }} />}
                {p.tipo === 'texto' && <textarea className="input-field" value={respuestas[p.id] || ''} onChange={e => set(p.id, e.target.value)} placeholder={p.placeholder} rows={2} style={{ marginTop: 8, resize: 'none' }} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-primary" type="submit" disabled={guardando} style={{ marginTop: 24 }}>
        {guardando ? 'Guardando...' : 'Guardar cuestionario'}
      </button>
    </form>
  );
}
