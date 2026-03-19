'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, signup } from '../../lib/api';
import { notifyUserChanged } from '../../lib/userStorage';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = tab === 'login'
        ? await login(email, password)
        : await signup(email, name, password, role);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      notifyUserChanged();
      router.push('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '14px 16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)',
    color: '#fff', fontSize: '14px', outline: 'none',
    transition: 'all 0.25s ease', width: '100%', boxSizing: 'border-box',
    letterSpacing: '-0.01em',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px',
      position: 'relative',
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-lg)', padding: '40px 32px',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 1,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.04em' }}>Drop</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.04em' }}>amyn</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px', letterSpacing: '-0.01em' }}>
            Discover what&apos;s dropping next
          </p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex', gap: '0',
          background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
          padding: '3px', marginBottom: '28px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: tab === t ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.25s ease',
                fontFamily: "'Sora', sans-serif",
                letterSpacing: '-0.01em',
              }}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role selector — signup only */}
        {tab === 'signup' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>I am a...</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'user', label: '👤 User', desc: 'Browse, like, save drops' },
                { id: 'brand', label: '🏢 Brand', desc: 'Create & manage drops' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    flex: 1, padding: '16px 12px', borderRadius: '12px',
                    border: role === r.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    background: role === r.id ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'center',
                    color: '#fff',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{r.label.split(' ')[0]}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: role === r.id ? '#60a5fa' : '#fff', marginBottom: '2px', fontFamily: "'Sora', sans-serif" }}>
                    {r.label.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'signup' && (
            <input
              type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)} required
              style={inputStyle}
            />
          )}
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6}
            style={inputStyle}
          />

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', fontSize: '13px',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '14px', borderRadius: '12px', border: 'none',
            background: loading ? 'rgba(255,255,255,0.04)' : '#3b82f6', color: '#fff',
            fontSize: '14px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s ease', marginTop: '4px',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
          }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#2563eb'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#3b82f6'; }}
          >
            {loading ? 'Loading...' : tab === 'login' ? 'Log In' : `Create ${role === 'brand' ? 'Brand ' : ''}Account`}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: '28px', padding: '14px 16px', borderRadius: '12px',
          background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.06)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Demo Account</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#60a5fa' }}>demo@dropspace.app</span> / <span style={{ color: '#60a5fa' }}>demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
