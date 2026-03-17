import React, { useState } from 'react';
import CuestionarioForm from '../components/CuestionarioForm';

export default function Cuestionarios() {
  const [tab, setTab] = useState('manana');

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ background: '#7c3aed', padding: '48px 20px 0' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Cuestionarios</h1>
        <div style={{ display: 'flex', gap: 0 }}>
          {['manana', 'noche'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '12px', background: tab === t ? 'white' : 'transparent', color: tab === t ? '#7c3aed' : 'rgba(255,255,255,0.7)', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: tab === t ? '10px 10px 0 0' : 0, transition: 'all 0.15s' }}>
              {t === 'manana' ? 'Mañana' : 'Noche'}
            </button>
          ))}
        </div>
      </div>
      <CuestionarioForm tipo={tab} key={tab} />
    </div>
  );
}
