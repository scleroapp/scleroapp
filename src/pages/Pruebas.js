import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { savePDF, getPDF, deletePDF, openPDFInBrowser } from '../services/storage';
import { HospitalSelector } from '../components/HospitalSelector';

const TIPOS_PRUEBA = ['Analítica de sangre', 'Analítica de orina', 'Radiografía', 'Ecografía', 'TAC', 'RMN', 'Espirometría', 'Ecocardiograma', 'Capilaroscopia', 'Electromiografía', 'Biopsia', 'Prueba de esfuerzo', 'Otra'];

export default function Pruebas() {
  const { user } = useAuth();
  const [pruebas, setPruebas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [pdfLocal, setPdfLocal] = useState(null);
  const [abriendo, setAbriendo] = useState(null);
  const fileRef = useRef();
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

  function onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Solo se admiten ficheros PDF'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('El fichero no puede superar 20 MB'); return; }
    setPdfLocal(file);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      let pdfId = null;
      let pdfNombre = null;
      if (pdfLocal) {
        pdfId = `prueba_${user.uid}_${Date.now()}`;
        pdfNombre = pdfLocal.name;
        const buffer = await pdfLocal.arrayBuffer();
        await savePDF(pdfId, pdfNombre, buffer);
      }
      await addDoc(collection(db, 'pruebas'), {
        uid: user.uid, ...form,
        pdf_id: pdfId,
        pdf_nombre: pdfNombre,
        timestamp: serverTimestamp()
      });
      setForm({ tipo: '', fecha: '', lugar: '', doctor_solicitante: '', resultado: '', notas: '' });
      setPdfLocal(null);
      if (fileRef.current) fileRef.current.value = '';
      setMostrarForm(false);
      cargar();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
    setGuardando(false);
  }

  async function eliminar(prueba) {
    if (!window.confirm('¿Eliminar esta prueba?')) return;
    if (prueba.pdf_id) await deletePDF(prueba.pdf_id);
    await deleteDoc(doc(db, 'pruebas', prueba.id));
    cargar();
  }

  async function abrirPDF(pdfId, nombre) {
    setAbriendo(pdfId);
    try {
      const stored = await getPDF(pdfId);
      if (!stored) { alert('PDF no encontrado en este dispositivo. El PDF solo está disponible en el dispositivo donde se guardó.'); return; }
      openPDFInBrowser(stored.data, nombre);
    } catch (err) {
      alert('Error al abrir el PDF');
    }
    setAbriendo(null);
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Pruebas médicas</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{pruebas.length} registradas</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)} style={{ background: 'var(--teal-500)' }}>
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
              <HospitalSelector value={form.lugar} onChange={v => setForm({ ...form, lugar: v })} />
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

            {/* PDF adjunto */}
            <div style={{ background: 'var(--slate-50)', border: '1.5px dashed var(--slate-200)', borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate-700)', marginBottom: 6 }}>Adjuntar PDF (opcional)</p>
              <p style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 10, lineHeight: 1.5 }}>
                El PDF se guardará solo en este dispositivo, nunca se sube a internet.
              </p>
              <input ref={fileRef} type="file" accept="application/pdf" onChange={onFileChange}
                style={{ fontSize: 13, color: 'var(--slate-600)', width: '100%' }} />
              {pdfLocal && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF3DE', borderRadius: 8, padding: '8px 12px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ fontSize: 12, color: '#27500A', flex: 1 }}>{pdfLocal.name}</span>
                  <button type="button" onClick={() => { setPdfLocal(null); if(fileRef.current) fileRef.current.value=''; }}
                    style={{ background: 'none', border: 'none', color: '#3B6D11', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={guardando} style={{ background: 'var(--teal-500)' }}>
              {guardando ? 'Guardando...' : 'Guardar prueba'}
            </button>
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
                  <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3 }}>
                    {p.fecha}{p.lugar ? ` · ${p.lugar}` : ''}{p.doctor_solicitante ? ` · ${p.doctor_solicitante}` : ''}
                  </p>
                  {p.resultado && <p style={{ fontSize: 13, color: 'var(--slate-600)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--slate-100)' }}>{p.resultado}</p>}
                  {p.notas && <p style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 4, fontStyle: 'italic' }}>{p.notas}</p>}

                  {p.pdf_id && (
                    <button onClick={() => abrirPDF(p.pdf_id, p.pdf_nombre)}
                      disabled={abriendo === p.pdf_id}
                      style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: '#FCEBEB', border: '1px solid #fca5a5', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {abriendo === p.pdf_id ? 'Abriendo...' : p.pdf_nombre || 'Ver PDF'}
                    </button>
                  )}
                </div>
                <button onClick={() => eliminar(p)} style={{ background: 'none', border: 'none', color: 'var(--slate-300)', cursor: 'pointer', paddingLeft: 12, flexShrink: 0 }}>
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
