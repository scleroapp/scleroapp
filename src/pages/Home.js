import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { usePerfil } from '../hooks/usePerfil';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function QuickBtn({ icon, label, to, color }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', background: 'white', border: '1px solid var(--slate-100)', borderRadius: 14, cursor: 'pointer', transition: 'transform 0.1s' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--slate-600)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

function SectionCard({ title, icon, children, to }) {
  const navigate = useNavigate();
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-700)' }}>{title}</span>
        </div>
        {to && <button onClick={() => navigate(to)} style={{ fontSize: 11, color: 'var(--teal-500)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Ver todo →</button>}
      </div>
      <div style={{ padding: '10px 16px 14px' }}>{children}</div>
    </div>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const { nombre } = usePerfil();
  const navigate = useNavigate();
  const [cuestionarioHoy, setCuestionarioHoy] = useState({ manana: false, noche: false });
  const [proximasCitas, setProximasCitas] = useState([]);
  const [proximasPruebas, setProximasPruebas] = useState([]);
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');
  const hoy = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const hour = new Date().getHours();
  const saludo = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const greeting = nombre ? `${saludo}, ${nombre}` : saludo;

  useEffect(() => {
    if (!user) return;
    async function cargar() {
      try {
        // Cuestionarios hoy
        const qM = query(collection(db, 'cuestionarios'), where('uid', '==', user.uid), where('fecha', '==', fechaHoy), where('tipo', '==', 'manana'));
        const qN = query(collection(db, 'cuestionarios'), where('uid', '==', user.uid), where('fecha', '==', fechaHoy), where('tipo', '==', 'noche'));
        const [snapM, snapN] = await Promise.all([getDocs(qM), getDocs(qN)]);
        setCuestionarioHoy({ manana: !snapM.empty, noche: !snapN.empty });

        // Próximas citas
        const qCitas = query(collection(db, 'citas'), where('uid', '==', user.uid), where('fecha', '>=', fechaHoy), orderBy('fecha', 'asc'), limit(2));
        const snapCitas = await getDocs(qCitas);
        setProximasCitas(snapCitas.docs.map(d => ({ id: d.id, ...d.data() })));

        // Próximas pruebas (las más recientes)
        const qPruebas = query(collection(db, 'pruebas'), where('uid', '==', user.uid), orderBy('fecha', 'desc'), limit(2));
        const snapPruebas = await getDocs(qPruebas);
        setProximasPruebas(snapPruebas.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {}
    }
    cargar();
  }, [user, fechaHoy]);

  function diasRestantes(fecha) {
    const diff = differenceInDays(parseISO(fecha), new Date());
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-500)', padding: '48px 20px 28px', position: 'relative' }}>
        <button onClick={logout} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>Salir</button>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4, textTransform: 'capitalize' }}>{hoy}</p>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>{greeting}</h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Cuestionarios del día */}
        <SectionCard title="Cuestionarios de hoy" to="/cuestionarios"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ key: 'manana', label: 'Mañana' }, { key: 'noche', label: 'Noche' }].map(({ key, label }) => (
              <button key={key} onClick={() => navigate('/cuestionarios')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: cuestionarioHoy[key] ? 'var(--green-50)' : 'var(--slate-50)', border: `1px solid ${cuestionarioHoy[key] ? '#86efac' : 'var(--slate-200)'}`, cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: cuestionarioHoy[key] ? '#22c55e' : 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {cuestionarioHoy[key] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: cuestionarioHoy[key] ? 'var(--green-700)' : 'var(--slate-600)' }}>{label}</p>
                  <p style={{ fontSize: 10, color: cuestionarioHoy[key] ? '#16a34a' : 'var(--slate-400)' }}>{cuestionarioHoy[key] ? 'Completado' : 'Pendiente'}</p>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Próximas citas */}
        <SectionCard title="Próximas citas" to="/citas"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>
          {proximasCitas.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--slate-400)', textAlign: 'center', padding: '8px 0' }}>Sin citas próximas</p>
          ) : proximasCitas.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--slate-50)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-700)', lineHeight: 1 }}>{c.fecha?.slice(8)}</span>
                <span style={{ fontSize: 9, color: 'var(--teal-500)', textTransform: 'uppercase' }}>{c.fecha ? format(parseISO(c.fecha), 'MMM', { locale: es }) : ''}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)' }}>{c.doctor}</p>
                <p style={{ fontSize: 11, color: 'var(--slate-400)' }}>{c.especialidad}{c.hora ? ` · ${c.hora}` : ''}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)' }}>{diasRestantes(c.fecha)}</span>
            </div>
          ))}
        </SectionCard>

        {/* Últimas pruebas */}
        <SectionCard title="Últimas pruebas" to="/pruebas"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 0V9m6 5V9"/></svg>}>
          {proximasPruebas.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--slate-400)', textAlign: 'center', padding: '8px 0' }}>Sin pruebas registradas</p>
          ) : proximasPruebas.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--slate-50)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal-300)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-800)' }}>{p.tipo}</p>
                <p style={{ fontSize: 11, color: 'var(--slate-400)' }}>{p.fecha}{p.lugar ? ` · ${p.lugar}` : ''}</p>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Accesos directos */}
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--teal-500)', marginTop: 4 }}>Accesos rápidos</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <QuickBtn to="/tension" color="var(--teal-500)" label="Tensión" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
          <QuickBtn to="/cuestionarios" color="var(--teal-500)" label="Diario" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
          <QuickBtn to="/citas" color="var(--teal-500)" label="Citas" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
          <QuickBtn to="/pruebas" color="var(--teal-500)" label="Pruebas" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 0V9m6 5V9"/></svg>} />
          <QuickBtn to="/medicacion" color="var(--teal-500)" label="Medicación" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
        </div>
      </div>
    </div>
  );
}
