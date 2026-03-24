'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/users/${id}`);
        if (!res.ok) throw new Error();
        setUser(await res.json());
      } catch { setUser(null); }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
          <div>
            <div className="skeleton" style={{ width: '140px', height: '18px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '80px', height: '14px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
        <div style={{ fontWeight: 600, color: '#fff', fontFamily: "'Sora', sans-serif" }}>User not found</div>
        <Link href="/search" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>← Back to search</Link>
      </div>
    );
  }

  const stats = [
    { label: 'Likes', value: user._count?.likes || 0 },
    { label: 'Saves', value: user._count?.savedDrops || 0 },
    { label: 'Following', value: user._count?.follows || 0 },
  ];

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }}>
      {/* Back */}
      <div style={{ padding: '14px 16px' }}>
        <Link href="/search" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>← Search</Link>
      </div>

      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 16px 24px' }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid rgba(59,130,246,0.2)',
        }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
              {user.name?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '2px',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em',
          }}>{user.name}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            @{user.username || 'user'}
            {user.role === 'brand' && (
              <span style={{
                marginLeft: '8px', fontSize: '9px', fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Brand</span>
            )}
          </div>
          {user.bio && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{user.bio}</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Extra Info */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {user.location && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📍 {user.location}
          </div>
        )}
        {user.website && (
          <a href={user.website} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🌐 {user.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        )}
        {user.instagramHandle && (
          <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📸 @{user.instagramHandle}
          </a>
        )}
        {user.createdAt && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            🗓 Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}
