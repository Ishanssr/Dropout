'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DropCard from '../../../components/DropCard';
import { transformDrop, toggleFollowBrand, deleteDrop } from '../../../lib/api';
import { GlassPanelLayers } from '../../../components/LiquidGlass';
import EdgeGlowCard from '../../../components/EdgeGlowCard';
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

function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
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
  const [isOwner, setIsOwner] = useState(false);
  const [deletingDropId, setDeletingDropId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/brands/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBrand(data);
        setFollowing(data.isFollowing || false);
        setFollowerCount(data._count?.followers || 0);
        setIsOwner(data.isOwner || false);
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

  // Fallback: also check locally if the logged-in user owns this brand
  useEffect(() => {
    if (!brand) return;
    const me = getUser();
    if (me && me.role === 'brand' && me.name === brand.name) {
      setIsOwner(true);
    }
  }, [brand]);

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

  const handleDeleteDrop = async (dropId) => {
    setDeletingDropId(dropId);
    try {
      await deleteDrop(dropId);
      setDrops(prev => prev.filter(d => d.id !== dropId));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete drop: ' + (err.message || 'Unknown error'));
    }
    setDeletingDropId(null);
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
        <Link href="/feed" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>← Back to feed</Link>
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
      <EdgeGlowCard style={{
        '--border-radius': '28px',
        '--glow-padding': '24px',
        margin: '0 12px 0',
      }}>
        <GlassPanelLayers />

        <div style={{ position: 'relative', zIndex: 5, padding: '32px 24px 28px' }}>
          {/* Owner badge */}
          {isOwner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginBottom: '16px',
              padding: '6px 16px', borderRadius: '50px',
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
              fontSize: '12px', fontWeight: 600, color: '#34d399',
              fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Your Brand Profile
            </div>
          )}

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

            {brand.website && brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').length <= 2 && (
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

          {/* Follow / Owner Actions */}
          {isOwner ? (
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', width: '100%', padding: '13px 0', borderRadius: '50px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.3s ease', fontFamily: "'Sora', sans-serif",
              letterSpacing: '-0.01em', marginBottom: '22px',
              border: '1px solid rgba(52,211,153,0.2)',
              background: 'rgba(52,211,153,0.06)',
              color: '#34d399', textDecoration: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Go to Dashboard
            </Link>
          ) : (
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
          )}

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
      </EdgeGlowCard>

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
            {isOwner && (
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                marginTop: '16px', padding: '10px 20px', borderRadius: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                fontFamily: "'Sora', sans-serif",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Your First Drop
              </Link>
            )}
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
              const thumbSrc = drop.imageUrl || drop.imageUrls?.[0] || '';
              return (
                <div
                  key={drop.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '1', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <Link
                    href={`/drop/${drop.id}`}
                    style={{
                      display: 'block', position: 'relative',
                      width: '100%', height: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    <img
                      src={thumbSrc}
                      alt={drop.title}
                      loading="lazy"
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.3s ease, filter 0.3s ease',
                      }}
                      onError={(e) => {
                        const fallback = drop.imageUrls?.find((url) => url && url !== e.currentTarget.src);
                        if (fallback) {
                          e.currentTarget.src = fallback;
                          return;
                        }
                        e.currentTarget.style.display = 'none';
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

                  {/* Delete button for brand owner */}
                  {isOwner && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(drop.id); }}
                      style={{
                        position: 'absolute', top: '6px', right: '6px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, zIndex: 10,
                        transition: 'all 0.2s ease',
                        opacity: 0.6,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
                      title="Delete drop"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════ DELETE CONFIRMATION MODAL ═══════ */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '340px',
              borderRadius: '24px', overflow: 'hidden',
              background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", marginBottom: '8px' }}>
                Delete this drop?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This will permanently remove the drop, including all likes, comments, and saves. This action cannot be undone.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px 24px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'rgba(255,255,255,0.06)', color: '#fff',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDrop(showDeleteConfirm)}
                disabled={deletingDropId === showDeleteConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: deletingDropId === showDeleteConfirm ? 'rgba(239,68,68,0.3)' : '#ef4444',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  cursor: deletingDropId === showDeleteConfirm ? 'wait' : 'pointer',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {deletingDropId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover CSS for thumbnail overlays */}
      <style jsx global>{`
        a:hover .thumb-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
