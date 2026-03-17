import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ label, value, sub, color = 'var(--teal-500)' }) {
  return (
    <div className="card" style={{ padding: '14px 16px', flex: 1 }}>
      <p style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function SectionBtn({ icon, label, sub, to, color }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', width: '100%', background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'transform 0.1s' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--slate-800)' }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate-300)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ultimaTension, setUltimaTension] = useState(null);
  const [cuestionarioHoy, setCuestionarioHoy] = useState({ manana: false, noche: false });
  const hoy = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    async function cargar() {
      try {
        const qTension = query(collection(db, 'tension'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'), limit(1));
        const snap = await getDocs(qTension);
        if (!snap.empty) setUltimaTension(snap.docs[0].data());

        const qManana = query(collection(db, 'cuestionarios'), where('uid', '==', user.uid), where('fecha', '==', fechaHoy), where('tipo', '==', 'manana'));
        const snapM = await getDocs(qManana);
        const qNoche = query(collection(db, 'cuestionarios'), where('uid', '==', user.uid), where('fecha', '==', fechaHoy), where('tipo', '==', 'noche'));
        const snapN = await getDocs(qNoche);
        setCuestionarioHoy({ manana: !snapM.empty, noche: !snapN.empty });
      } catch (e) { /* índices pendientes */ }
    }
    cargar();
  }, [user, fechaHoy]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 28px', position: 'relative' }}>
        <button onClick={logout} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>Salir</button>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4, textTransform: 'capitalize' }}>{hoy}</p>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>{greeting}</h1>

        {/* Cuestionario hoy */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => navigate('/cuestionarios')}
            style={{ flex: 1, background: cuestionarioHoy.manana ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 12px', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 3 }}>Cuestionario mañana</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{cuestionarioHoy.manana ? '✓ Completado' : '→ Pendiente'}</div>
          </button>
          <button onClick={() => navigate('/cuestionarios')}
            style={{ flex: 1, background: cuestionarioHoy.noche ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 12px', color: 'white', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 3 }}>Cuestionario noche</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{cuestionarioHoy.noche ? '✓ Completado' : '→ Pendiente'}</div>
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Tensión rápida */}
        {ultimaTension && (
          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard label="Sistólica" value={ultimaTension.sistolica} sub="mmHg · última" />
            <StatCard label="Diastólica" value={ultimaTension.diastolica} sub="mmHg · última" />
            <StatCard label="F. Card." value={ultimaTension.frecuencia_cardiaca || '—'} sub="ppm" color="var(--slate-600)" />
          </div>
        )}

        {/* Secciones */}
        <p className="section-header" style={{ marginTop: 8 }}>Secciones</p>

        <SectionBtn to="/tension" color="var(--teal-500)" label="Tensión arterial" sub={ultimaTension ? `Última: ${ultimaTension.sistolica}/${ultimaTension.diastolica} mmHg` : 'Sin registros todavía'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />

        <SectionBtn to="/cuestionarios" color="#7c3aed" label="Cuestionarios" sub="Mañana y noche"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} />

        <SectionBtn to="/citas" color="#d97706" label="Citas médicas" sub="Próximas y pasadas"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />

        <SectionBtn to="/pruebas" color="#dc2626" label="Pruebas médicas" sub="Analíticas, exploraciones..."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 0V9m6 5V9"/></svg>} />

        <SectionBtn to="/medicacion" color="#0284c7" label="Medicación" sub="Registro diario de tomas"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
      </div>
    </div>
  );
}
