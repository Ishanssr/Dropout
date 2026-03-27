'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleFollowBrand, formatNumber } from '../../../lib/api';
import { GlassPanelLayers } from '../../../components/LiquidGlass';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        // First try to load as user
        const headers = {};
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const userRes = await fetch(`${API_URL}/api/users/${id}`, { headers });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.role === 'brand') {
            // Redirect to the proper brand profile page
            const brandsRes = await fetch(`${API_URL}/api/brands`, { headers });
            if (brandsRes.ok) {
              const brands = await brandsRes.json();
              const matchedBrand = brands.find(b => b.name === userData.name);
              if (matchedBrand) {
                router.replace(`/brand/${matchedBrand.id}`);
                return;
              }
            }
          }
          setUser(userData);
        }
      } catch { /* fall through */ }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleFollow = async () => {
    if (!brand) return;
    const me = getUser();
    if (!me) { router.push('/login'); return; }
    const newFollowing = !following;
    setFollowing(newFollowing);
    setFollowerCount(prev => newFollowing ? prev + 1 : prev - 1);
    try {
      const result = await toggleFollowBrand(brand.id);
      setFollowing(result.following);
      setFollowerCount(result.followers);
    } catch {
      setFollowing(!newFollowing);
      setFollowerCount(prev => newFollowing ? prev - 1 : prev + 1);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: '140px', height: '20px', margin: '0 auto 10px' }} />
          <div className="skeleton" style={{ width: '200px', height: '14px', margin: '0 auto 20px' }} />
          <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '50px', margin: '0 auto 20px' }} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }



  // ═══════════════════════════════════════════════
  // REGULAR USER PROFILE
  // ═══════════════════════════════════════════════
  if (!user) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
        <div style={{ fontWeight: 600, color: '#fff', fontFamily: "'Sora', sans-serif" }}>User not found</div>
        <Link href="/search" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>← Back to search</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }}>
      {/* Back */}
      <div style={{ padding: '14px 16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0 }}>← Back</button>
      </div>

      {/* Profile Card */}
      <div style={{
        margin: '0 16px 20px', borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(59,130,246,0.06), rgba(255,255,255,0.02))',
        border: '1px solid rgba(59,130,246,0.08)', padding: '28px 24px 24px',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 14px',
            background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#0a0a0f', border: '3px solid #0a0a0f' }} />
            ) : (
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>{user.name?.charAt(0).toUpperCase() || '?'}</span>
            )}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em', marginBottom: '4px' }}>{user.name}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>@{user.username || 'user'}</div>
          {user.bio && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '10px' }}>{user.bio}</div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          {[
            { value: user._count?.likes || 0, label: 'Upvotes' },
            { value: user._count?.savedDrops || 0, label: 'Saves' },
            { value: user._count?.follows || 0, label: 'Following' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center', padding: '14px 8px',
              borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {user.location && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {user.location}</div>}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌐 {user.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          {user.createdAt && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              🗓 Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
