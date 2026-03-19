'use client';

import { useState, useEffect } from 'react';
import { fetchTrending, transformDrop, formatNumber } from '../../lib/api';
import Link from 'next/link';

export default function TrendingPage() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending()
      .then((data) => { setTrending(data.map(transformDrop)); setLoading(false); })
      .catch(() => {
        import('../../lib/drops').then(({ getTrendingDrops }) => {
          setTrending(getTrendingDrops());
          setLoading(false);
        });
      });
  }, []);

  // Duplicate items for seamless infinite loop
  const marqueeItems = [...trending, ...trending];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.03em', fontFamily: "'Sora', sans-serif" }}>
        <span style={{ color: '#3b82f6' }}>Trending</span> <span style={{ color: '#fff' }}>Drops</span>
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px', letterSpacing: '-0.01em' }}>Most hyped launches right now</p>

      {loading && (
        <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ minWidth: '200px', height: '260px', borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
          ))}
        </div>
      )}

      {/* ---- Infinite Marquee Ticker ---- */}
      {!loading && trending.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            ● Live Feed
          </div>
          <div className="marquee-container" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="marquee-track" style={{ gap: '16px' }}>
              {marqueeItems.map((drop, i) => (
                <Link key={`${drop.id}-${i}`} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '200px', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                      <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>{drop.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{drop.brand.name} · {drop.price}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(59,130,246,0.06)', color: '#60a5fa',
                        border: '1px solid rgba(59,130,246,0.08)',
                      }}>🔥 {drop.hypeScore}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- Full Ranking List ---- */}
      {!loading && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Full Rankings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trending.map((drop, i) => (
              <Link key={drop.id} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Rank */}
                  <div style={{
                    width: '28px', textAlign: 'center', fontSize: '15px', fontWeight: 700,
                    color: i < 3 ? '#3b82f6' : 'var(--text-muted)',
                    fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em',
                  }}>{i + 1}</div>

                  {/* Image */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                    <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{drop.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{drop.brand.name} · {drop.price}</div>
                  </div>

                  {/* Hype */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(59,130,246,0.06)', color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.08)', flexShrink: 0,
                  }}>🔥 {drop.hypeScore}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
