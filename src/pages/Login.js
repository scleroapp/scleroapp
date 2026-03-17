import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'No existe una cuenta con ese email.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'Ese email ya está registrado.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'Email no válido.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
      };
      setError(msgs[err.code] || 'Ha ocurrido un error. Inténtalo de nuevo.');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'white' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'var(--teal-500)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>Scleroapp</h1>
          <p style={{ fontSize: 14, color: 'var(--slate-400)', marginTop: 6 }}>Control de esclerosis sistémica</p>
        </div>

        <div style={{ display: 'flex', background: 'var(--slate-100)', borderRadius: 10, padding: 3, marginBottom: 28 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: mode === m ? 'white' : 'transparent', color: mode === m ? 'var(--slate-800)' : 'var(--slate-400)', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s', border: 'none', cursor: 'pointer' }}>
              {m === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 6 }}>Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} />
          </div>
          {error && (
            <div style={{ background: 'var(--red-50)', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red-600)' }}>
              {error}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--slate-400)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Tus datos se guardan de forma segura en Firebase.<br />Solo tú tienes acceso a tu información.
        </p>

      </div>
    </div>
  );
}
