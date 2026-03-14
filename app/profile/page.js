'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

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
        textAlign: 'center',
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 800, color: '#fff',
        }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          {user.name}
        </h1>
        <p style={{ fontSize: '14px', color: '#525252', marginBottom: '32px' }}>
          {user.email}
        </p>

        {/* Stats (placeholder) */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '28px',
          background: '#111', borderRadius: '12px', padding: '16px',
        }}>
          {[
            { label: 'Saved', value: '0' },
            { label: 'Liked', value: '0' },
            { label: 'Comments', value: '0' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#525252', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/saved" style={{
            display: 'block', padding: '14px', borderRadius: '12px',
            background: '#111', border: '1px solid #1a1a1a',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            textDecoration: 'none', textAlign: 'center',
            transition: 'all 0.2s ease',
          }}>
            🔖 My Saved Drops
          </Link>

          <button
            onClick={handleLogout}
            style={{
              padding: '14px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
