'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = tab === 'login' ? { email, password } : { email, name, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      router.push('/');
    } catch (err) {
      setError('Network error — is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>Drop</span>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Space</span>
          </Link>
          <p style={{ color: '#525252', fontSize: '14px', marginTop: '8px' }}>
            Discover what&apos;s dropping next
          </p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#111',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '28px',
        }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                background: tab === t ? '#1a1a1a' : 'transparent',
                color: tab === t ? '#fff' : '#525252',
                transition: 'all 0.2s ease',
              }}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #262626',
                background: '#111',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={(e) => { e.target.style.borderColor = '#262626'; }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #262626',
              background: '#111',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#262626'; }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #262626',
              background: '#111',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#262626'; }}
          />

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? '#1a1a1a' : '#3b82f6',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#2563eb'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#3b82f6'; }}
          >
            {loading ? 'Loading...' : tab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: '24px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#525252', marginBottom: '4px' }}>Demo Account</div>
          <div style={{ fontSize: '13px', color: '#a3a3a3' }}>
            <span style={{ color: '#60a5fa' }}>demo@dropspace.app</span> / <span style={{ color: '#60a5fa' }}>demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
