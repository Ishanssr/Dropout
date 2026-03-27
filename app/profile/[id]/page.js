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
            // Find the brand by trying to match from brands API
            const brandsRes = await fetch(`${API_URL}/api/brands`, { headers });
            if (brandsRes.ok) {
              const brands = await brandsRes.json();
              const matchedBrand = brands.find(b => b.name === userData.name);
              if (matchedBrand) {
                const brandRes = await fetch(`${API_URL}/api/brands/${matchedBrand.id}`, { headers });
                if (brandRes.ok) {
                  const brandData = await brandRes.json();
                  setBrand(brandData);
                  setFollowing(brandData.isFollowing || false);
                  setFollowerCount(brandData._count?.followers || 0);
                  setLoading(false);
                  return;
                }
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
  // BRAND PROFILE (premium design)
  // ═══════════════════════════════════════════════
  if (brand) {
    const totalUpvotes = brand.drops?.reduce((sum, d) => sum + (d._count?.likes || 0), 0) || 0;

    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', paddingBottom: '32px' }}>
        {/* Back */}
        <div style={{ padding: '14px 16px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0 }}>← Back</button>
        </div>

        {/* ═══ BRAND CARD ═══ */}
        <div style={{
          margin: '0 16px 24px',
          borderRadius: '24px',
          background: 'rgba(12,12,20,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          overflow: 'hidden', position: 'relative',
        }}>
          <GlassPanelLayers />

          <div style={{ position: 'relative', zIndex: 5, padding: '32px 24px 28px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59,130,246,0.2)',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: '#0a0a0f', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '38px', fontWeight: 800, color: '#fff' }}>{brand.name?.charAt(0)}</span>
                )}
              </div>
            </div>

            {/* Verified badge + Name */}
            <h1 style={{
              fontSize: '24px', fontWeight: 800, color: '#fff',
              fontFamily: "'Sora', sans-serif", letterSpacing: '-0.04em',
              marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {brand.name}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            </h1>

            {/* Website */}
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}

            {/* Follow button */}
            <button
              onClick={handleFollow}
              style={{
                width: '100%', maxWidth: '280px', padding: '14px 24px',
                borderRadius: '50px', border: 'none',
                background: following
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: following ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
              }}
            >
              {following ? 'Following' : 'Follow Brand'}
            </button>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              {[
                { value: brand._count?.drops || 0, label: 'DROPS' },
                { value: formatNumber(followerCount), label: 'FOLLOWERS' },
                { value: formatNumber(totalUpvotes), label: 'UPVOTES' },
              ].map((s) => (
                <div key={s.label} style={{
                  flex: 1, padding: '16px 8px', textAlign: 'center',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    fontSize: '22px', fontWeight: 800, color: '#fff',
                    fontFamily: "'Sora', sans-serif", lineHeight: 1,
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px',
                    textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ DROPS HEADING ═══ */}
        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{
            fontSize: '16px', fontWeight: 700, color: '#fff',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em', margin: 0,
          }}>Drops</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {brand.drops?.length || 0} total
          </span>
        </div>

        {/* ═══ DROPS THUMBNAIL GRID ═══ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '8px', padding: '0 16px',
        }}>
          {(!brand.drops || brand.drops.length === 0) ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No drops yet
            </div>
          ) : brand.drops.map((drop) => (
            <Link
              key={drop.id}
              href={`/drop/${drop.id}`}
              style={{
                display: 'block', borderRadius: '16px', overflow: 'hidden',
                position: 'relative', aspectRatio: '1',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.25s ease',
              }}
            >
              <img
                src={drop.imageUrl}
                alt={drop.title}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              {/* Floating caption overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                padding: '32px 12px 12px',
              }}>
                <div style={{
                  fontSize: '13px', fontWeight: 700, color: '#fff',
                  fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>{drop.title}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px',
                  fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500,
                }}>
                  <span>↑ {drop._count?.likes || 0}</span>
                  <span>💬 {drop._count?.comments || 0}</span>
                  {drop.price && <span style={{ marginLeft: 'auto', color: '#60a5fa', fontWeight: 600 }}>{drop.price}</span>}
                </div>
              </div>
            </Link>
          ))}
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
