'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DropCard from '../../../components/DropCard';
import { transformDrop, toggleFollowBrand } from '../../../lib/api';
import { GlassPanelLayers } from '../../../components/LiquidGlass';
import { getDropStatus } from '../../../lib/dropStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export default function BrandProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState(null);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/brands/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBrand(data);
        setFollowing(data.isFollowing || false);
        setFollowerCount(data._count?.followers || 0);
        setDrops((data.drops || []).map(d => ({
          ...transformDrop(d),
          brand: { id: data.id, name: data.name, logo: data.logo },
        })));
      } catch {
        setBrand(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleFollow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/login'); return; }
    if (followLoading) return;
    setFollowLoading(true);
    const prev = following;
    setFollowing(!prev);
    setFollowerCount(c => prev ? c - 1 : c + 1);
    try {
      const res = await fetch(`${API_URL}/api/brands/${id}/follow`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setFollowing(result.following);
      setFollowerCount(result.followers);
    } catch {
      setFollowing(prev);
      setFollowerCount(c => prev ? c + 1 : c - 1);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '96px', height: '96px', borderRadius: '50%', margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: '120px', height: '18px', margin: '0 auto 10px' }} />
          <div className="skeleton" style={{ width: '200px', height: '44px', borderRadius: '50px', margin: '16px auto' }} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ flex: 1, height: '70px', borderRadius: '16px' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px', marginTop: '24px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
        <div style={{ fontWeight: 600, color: '#fff', fontFamily: "'Sora', sans-serif" }}>Brand not found</div>
        <Link href="/" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>← Back to feed</Link>
      </div>
    );
  }

  const liveCount = drops.filter(d => getDropStatus(d) === 'live').length;
  const upcomingCount = drops.filter(d => getDropStatus(d) === 'upcoming').length;

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', paddingBottom: '32px' }}>
      {/* Back */}
      <div style={{ padding: '14px 16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0, fontFamily: "'Sora', sans-serif" }}>← Back</button>
      </div>

      {/* ═══════ LIQUID GLASS PROFILE CARD ═══════ */}
      <div style={{
        margin: '0 12px 0',
        borderRadius: '28px',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(8,8,16,0.75)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <GlassPanelLayers />

        <div style={{ position: 'relative', zIndex: 5, padding: '32px 24px 28px' }}>
          {/* Avatar with glow ring */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%', margin: '0 auto 16px',
              padding: '3px', position: 'relative',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6)',
              backgroundSize: '200% 200%',
              boxShadow: '0 0 24px rgba(59,130,246,0.25), 0 0 48px rgba(139,92,246,0.1)',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', background: '#0a0a14',
              }}>
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{
                  width: '100%', height: '100%', display: brand.logo ? 'none' : 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 800, color: '#60a5fa',
                  fontFamily: "'Sora', sans-serif",
                }}>
                  {brand.name?.charAt(0)}
                </div>
              </div>
              {/* Verified */}
              <div style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #0a0a14',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <path d="M20 6L9 17l-5-5 1.41-1.41L9 14.17l9.59-9.59z"/>
                </svg>
              </div>
            </div>

            <h1 style={{
              fontSize: '24px', fontWeight: 800, color: '#fff',
              fontFamily: "'Sora', sans-serif", letterSpacing: '-0.04em',
              marginBottom: '6px', lineHeight: 1.2,
            }}>{brand.name}</h1>

            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: '12px', color: 'rgba(96,165,250,0.7)', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>

          {/* Follow */}
          <button
            onClick={handleFollow}
            disabled={followLoading}
            style={{
              width: '100%', padding: '13px 0', borderRadius: '50px',
              fontSize: '14px', fontWeight: 700, cursor: followLoading ? 'wait' : 'pointer',
              transition: 'all 0.3s ease', fontFamily: "'Sora', sans-serif",
              letterSpacing: '-0.01em', marginBottom: '22px',
              border: following ? '1px solid rgba(255,255,255,0.08)' : 'none',
              background: following
                ? 'rgba(255,255,255,0.04)'
                : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: following ? 'rgba(255,255,255,0.5)' : '#fff',
              boxShadow: following ? 'none' : '0 4px 24px rgba(59,130,246,0.3)',
            }}
          >
            {followLoading ? '...' : following ? 'Following ✓' : 'Follow'}
          </button>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { value: drops.length, label: 'DROPS', color: '#fff' },
              { value: followerCount, label: 'FOLLOWERS', color: '#fff' },
              { value: liveCount, label: 'LIVE', color: liveCount > 0 ? '#34d399' : '#fff' },
              { value: upcomingCount, label: 'SOON', color: upcomingCount > 0 ? '#fbbf24' : '#fff' },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '14px 4px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  fontSize: '18px', fontWeight: 800, color: s.color,
                  fontFamily: "'Sora', sans-serif", lineHeight: 1,
                }}>{s.value}</div>
                <div style={{
                  fontSize: '8px', color: 'var(--text-muted)', marginTop: '5px',
                  textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ DROPS THUMBNAIL GRID ═══════ */}
      <div style={{ padding: '20px 12px 0' }}>
        {/* Grid header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px', padding: '0 4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
              Drops
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {drops.length} total
          </span>
        </div>

        {/* Instagram-style 3-column grid */}
        {drops.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }}>📦</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>No drops yet</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3px',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {drops.map((drop) => {
              const status = getDropStatus(drop);
              return (
                <Link
                  key={drop.id}
                  href={`/drop/${drop.id}`}
                  style={{
                    display: 'block', position: 'relative',
                    aspectRatio: '1', overflow: 'hidden',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <img
                    src={drop.imageUrl}
                    alt={drop.title}
                    loading="lazy"
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s ease, filter 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(0.7)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
                  />

                  {/* Status badge */}
                  <div style={{
                    position: 'absolute', top: '6px', left: '6px',
                    padding: '2px 6px', borderRadius: '6px',
                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: status === 'live'
                      ? 'rgba(52,211,153,0.85)'
                      : 'rgba(59,130,246,0.85)',
                    color: '#fff',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {status === 'live' ? '● LIVE' : 'SOON'}
                  </div>

                  {/* Bottom overlay on hover */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '20px 8px 8px',
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                  }}
                    className="thumb-overlay"
                  >
                    <div style={{
                      fontSize: '10px', fontWeight: 700, color: '#fff',
                      lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{drop.title}</div>
                    <div style={{
                      display: 'flex', gap: '6px', marginTop: '4px',
                      fontSize: '9px', color: 'rgba(255,255,255,0.6)',
                    }}>
                      <span>↑{drop.engagement?.likes || 0}</span>
                      <span>💬{drop.engagement?.comments || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover CSS for thumbnail overlays */}
      <style jsx global>{`
        a:hover .thumb-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
