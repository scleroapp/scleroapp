import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { hacerBackup, restaurarBackup, exportarExcel } from '../services/backup';

function ActionCard({ title, description, buttonLabel, buttonColor, onClick, loading, loadingLabel, icon, warning }) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: buttonColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-800)' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 3, lineHeight: 1.5 }}>{description}</p>
        </div>
      </div>
      {warning && (
        <div style={{ background: 'var(--amber-50)', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--amber-500)', marginBottom: 10 }}>
          {warning}
        </div>
      )}
      <button onClick={onClick} disabled={loading}
        style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: buttonColor, color: 'white', border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? loadingLabel : buttonLabel}
      </button>
    </div>
  );
}

function ResultMsg({ msg }) {
  if (!msg) return null;
  const isError = msg.startsWith('Error');
  return (
    <div style={{ background: isError ? 'var(--red-50)' : 'var(--green-50)', border: `1px solid ${isError ? '#fca5a5' : '#86efac'}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: isError ? 'var(--red-600)' : 'var(--green-700)', marginTop: -4 }}>
      {msg}
    </div>
  );
}

export default function Configuracion() {
  const { user } = useAuth();
  const { nombre, guardarNombre } = usePerfil();
  const [nombreEdit, setNombreEdit] = useState('');
  const [nombreGuardado, setNombreGuardado] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  React.useEffect(() => { setNombreEdit(nombre); }, [nombre]);

  async function onGuardarNombre(e) {
    e.preventDefault();
    if (!nombreEdit.trim()) return;
    await guardarNombre(nombreEdit.trim());
    setNombreGuardado(true);
    setTimeout(() => setNombreGuardado(false), 2000);
  }

  async function onBackup() {
    setMsg('');
    setLoadingBackup(true);
    try {
      const res = await hacerBackup(user.uid);
      setMsg(`Backup descargado correctamente. ${res.registros} registros y ${res.pdfs} PDFs exportados.`);
    } catch (err) {
      setMsg('Error al crear el backup: ' + err.message);
    }
    setLoadingBackup(false);
  }

  async function onRestoreFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm('¿Restaurar backup? Se añadirán todos los registros del fichero. Los registros existentes no se borrarán.')) {
      fileRef.current.value = '';
      return;
    }
    setMsg('');
    setLoadingRestore(true);
    try {
      const res = await restaurarBackup(user.uid, file);
      setMsg(`Backup restaurado. ${res.restaurados} registros y ${res.pdfs} PDFs importados.`);
    } catch (err) {
      setMsg('Error al restaurar: ' + err.message);
    }
    setLoadingRestore(false);
    fileRef.current.value = '';
  }

  async function onExcel() {
    setMsg('');
    setLoadingExcel(true);
    try {
      const total = await exportarExcel(user.uid);
      setMsg(`Exportación completada. ${total} registros exportados a CSV.`);
    } catch (err) {
      setMsg('Error al exportar: ' + err.message);
    }
    setLoadingExcel(false);
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600 }}>Configuración</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>Perfil y copia de seguridad</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Nombre */}
        <p className="section-header">Perfil</p>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-800)', marginBottom: 4 }}>Tu nombre</p>
          <p style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 12 }}>Aparecerá en el saludo de la pantalla de inicio.</p>
          <form onSubmit={onGuardarNombre} style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" value={nombreEdit} onChange={e => setNombreEdit(e.target.value)}
              placeholder="Escribe tu nombre..." style={{ flex: 1 }} />
            <button type="submit"
              style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: nombreGuardado ? '#22c55e' : 'var(--teal-500)', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 0.3s', whiteSpace: 'nowrap' }}>
              {nombreGuardado ? '✓ Guardado' : 'Guardar'}
            </button>
          </form>
        </div>

        {/* Backup */}
        <p className="section-header" style={{ marginTop: 8 }}>Copia de seguridad</p>

        <ActionCard
          title="Hacer backup"
          description="Descarga un fichero con todos tus datos de Firebase y los PDFs guardados en este dispositivo."
          buttonLabel="Descargar backup"
          buttonColor="var(--teal-500)"
          onClick={onBackup}
          loading={loadingBackup}
          loadingLabel="Generando backup..."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
        />

        <ActionCard
          title="Restaurar backup"
          description="Importa un fichero de backup generado anteriormente. Los PDFs se restaurarán en este dispositivo."
          buttonLabel="Seleccionar fichero de backup"
          buttonColor="#7c3aed"
          onClick={() => fileRef.current.click()}
          loading={loadingRestore}
          loadingLabel="Restaurando..."
          warning="Los registros existentes no se borran. Se añaden los del backup."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
        />
        <input ref={fileRef} type="file" accept=".json" onChange={onRestoreFile} style={{ display: 'none' }} />

        <p className="section-header" style={{ marginTop: 8 }}>Exportación</p>

        <ActionCard
          title="Exportar a CSV"
          description="Descarga todos tus datos en formato CSV, compatible con Excel y Google Sheets."
          buttonLabel="Exportar CSV"
          buttonColor="#d97706"
          onClick={onExcel}
          loading={loadingExcel}
          loadingLabel="Exportando..."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
        />

        <ResultMsg msg={msg} />

        <div className="card" style={{ padding: '14px 16px', marginTop: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-600)', marginBottom: 8 }}>Sobre el almacenamiento local</p>
          <p style={{ fontSize: 12, color: 'var(--slate-400)', lineHeight: 1.6 }}>
            Los PDFs adjuntos a pruebas médicas se guardan <strong>solo en este dispositivo</strong>, en el almacenamiento interno del navegador. Nunca se suben a internet. Si cambias de dispositivo, restaura un backup para recuperarlos.
          </p>
        </div>

      </div>
    </div>
  );
}
