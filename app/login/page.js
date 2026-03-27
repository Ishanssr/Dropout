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
  const [brandCategory, setBrandCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

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
        ux_mode: 'popup',
      });
      // Render Google's official button in our container
      const btnContainer = document.getElementById('google-btn-container');
      if (btnContainer && window.google?.accounts.id.renderButton) {
        window.google.accounts.id.renderButton(btnContainer, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 320,
        });
      }
    };
    document.head.appendChild(script);
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = tab === 'login'
        ? await login(email, password)
        : await signup(email, name, password, role, role === 'brand' ? brandCategory : null);
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
              {role === 'brand' && (
                <div style={{ marginTop: '12px' }}>
                  <div className="login-roles-label">Brand Category</div>
                  <select
                    value={brandCategory}
                    onChange={(e) => setBrandCategory(e.target.value)}
                    required={role === 'brand'}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      color: brandCategory ? '#fff' : 'rgba(255,255,255,0.3)',
                      outline: 'none', fontFamily: "'Sora', sans-serif",
                      appearance: 'none', cursor: 'pointer',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2360a5fa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                    }}
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="tech-gadgets">💻 Tech & Gadgets</option>
                    <option value="ai-software">🤖 AI & Software</option>
                    <option value="movies-ott">🎬 Movies & OTT</option>
                    <option value="gaming">🎮 Gaming</option>
                    <option value="music-entertainment">🎵 Music & Entertainment</option>
                    <option value="fashion-streetwear">👕 Fashion & Streetwear</option>
                    <option value="beauty-skincare">💄 Beauty & Skincare</option>
                    <option value="automobiles">🚗 Automobiles</option>
                    <option value="mobility-ev">⚡ Mobility & EV</option>
                    <option value="food-beverages">🍔 Food & Beverages</option>
                    <option value="lifestyle-home">🏠 Lifestyle & Home</option>
                    <option value="startups-products">🚀 Startups & Products</option>
                    <option value="creator-tools-audio">🎧 Creator Tools & Audio</option>
                    <option value="collectibles-culture">💎 Collectibles & Culture</option>
                    <option value="sports-equipment">⚽ Sports & Equipment</option>
                    <option value="travel-experiences">✈️ Travel & Experiences</option>
                  </select>
                </div>
              )}
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
            <div className="login-input-wrap" style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={8} className="login-input" style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
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

          {/* Google rendered button container */}
          <div id="google-btn-container" style={{
            display: 'flex', justifyContent: 'center', width: '100%',
            minHeight: '44px', alignItems: 'center',
          }}>
            {googleLoading && <span className="login-spinner" />}
          </div>

          <div className="login-footer">
            <Link href="/feed" className="login-footer-link">Browse as guest →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
