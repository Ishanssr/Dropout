'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, signup, googleAuth } from '../../lib/api';
import { notifyUserChanged } from '../../lib/userStorage';
import dynamic from 'next/dynamic';
import { GlassFilter, LiquidGlassButton } from '../../components/LiquidGlass';

const StarField = dynamic(() => import('../../components/FluidCanvas'), { ssr: false });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response.credential) return;
    setError('');
    setGoogleLoading(true);
    try {
      const data = await googleAuth(response.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      notifyUserChanged();
      router.push('/feed');
    } catch (err) {
      console.error('[Google Auth] Error:', err);
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    // Load Google Identity Services script
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    };
    document.head.appendChild(script);
  }, [handleGoogleResponse]);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured yet');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is loading, try again');
    }
  };

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
      router.push('/feed');
    } catch (err) {
      console.error('[Login] Error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Pure dark + star field */}
      <StarField />
      <GlassFilter />

      {/* 3D Glass Plate — tilts up from ground */}
      <div className="login-perspective-wrap">
        <div className="login-glass-3d">
          {/* Logo */}
          <div className="login-logo">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="login-logo-text">
                <span style={{ color: '#fff' }}>Drop</span>
                <span style={{ background: 'linear-gradient(90deg, #b8ccff, #c4a6ff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>amyn</span>
              </span>
            </Link>
            <p className="login-subtitle">
              {tab === 'login' ? 'Welcome back.' : 'Join the community.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            {['login', 'signup'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`login-tab ${tab === t ? 'active' : ''}`}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          {tab === 'signup' && (
            <div className="login-roles">
              <div className="login-roles-label">I am a...</div>
              <div className="login-roles-grid">
                {[
                  { id: 'user', emoji: '👤', label: 'User', desc: 'Browse, like, save' },
                  { id: 'brand', emoji: '🏢', label: 'Brand', desc: 'Create & manage drops' },
                ].map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className={`login-role-btn ${role === r.id ? 'active' : ''}`}>
                    <span className="login-role-emoji">{r.emoji}</span>
                    <span className="login-role-name">{r.label}</span>
                    <span className="login-role-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {tab === 'signup' && (
              <div className="login-input-wrap">
                <input type="text" placeholder="Full Name" value={name}
                  onChange={(e) => setName(e.target.value)} required className="login-input" />
              </div>
            )}
            <div className="login-input-wrap">
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required className="login-input" />
            </div>
            <div className="login-input-wrap">
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} className="login-input" />
            </div>

            {error && <div className="login-error">{error}</div>}

            <LiquidGlassButton type="submit" disabled={loading} className="login-liquid-submit">
              {loading ? <span className="login-spinner" /> : tab === 'login' ? 'Log In' : `Create ${role === 'brand' ? 'Brand ' : ''}Account`}
            </LiquidGlassButton>
          </form>

          {/* Google divider + button */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '4px 0 12px', width: '100%',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <button
            onClick={handleGoogleClick}
            disabled={googleLoading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px 20px',
              borderRadius: 'var(--radius-full, 50px)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'Sora', sans-serif",
              letterSpacing: '-0.02em',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            {googleLoading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="login-footer">
            <Link href="/feed" className="login-footer-link">Browse as guest →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
