'use client';

import { useState, useRef } from 'react';
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
  const formRef = useRef(null);

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
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Ambient background layers */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />
      <div className="login-bg-grain" />

      {/* Floating mosaic cards (decorative) */}
      <div className="login-float login-float-1">
        <img src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80" alt="" />
      </div>
      <div className="login-float login-float-2">
        <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80" alt="" />
      </div>
      <div className="login-float login-float-3">
        <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=80" alt="" />
      </div>

      {/* Main card */}
      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-mark">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#7c9cff" />
                    <stop offset="100%" stopColor="#c4a6ff" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="url(#lg)" />
              </svg>
            </div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="login-logo-text">
                <span style={{ color: '#fff' }}>Drop</span>
                <span style={{ background: 'linear-gradient(90deg, #b8ccff, #c4a6ff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>amyn</span>
              </span>
            </Link>
            <p className="login-subtitle">
              {tab === 'login' ? 'Welcome back. Discover what\'s dropping next.' : 'Join the community. Never miss a drop.'}
            </p>
          </div>

          {/* Tab switch */}
          <div className="login-tabs">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`login-tab ${tab === t ? 'active' : ''}`}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Role selector — signup only */}
          {tab === 'signup' && (
            <div className="login-roles">
              <div className="login-roles-label">I am a...</div>
              <div className="login-roles-grid">
                {[
                  { id: 'user', emoji: '👤', label: 'User', desc: 'Browse, like, save' },
                  { id: 'brand', emoji: '🏢', label: 'Brand', desc: 'Create & manage drops' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`login-role-btn ${role === r.id ? 'active' : ''}`}
                  >
                    <span className="login-role-emoji">{r.emoji}</span>
                    <span className="login-role-name">{r.label}</span>
                    <span className="login-role-desc">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="login-form">
            {tab === 'signup' && (
              <div className="login-input-wrap">
                <input
                  type="text" placeholder="Full Name" value={name}
                  onChange={(e) => setName(e.target.value)} required
                  className="login-input"
                />
              </div>
            )}
            <div className="login-input-wrap">
              <input
                type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="login-input"
              />
            </div>
            <div className="login-input-wrap">
              <input
                type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="login-input"
              />
            </div>

            {error && (
              <div className="login-error">{error}</div>
            )}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <span className="login-spinner" />
              ) : tab === 'login' ? 'Log In' : `Create ${role === 'brand' ? 'Brand ' : ''}Account`}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <Link href="/feed" className="login-footer-link">
              Browse as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
