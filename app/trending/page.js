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

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        <span style={{ color: '#3b82f6' }}>Trending</span> Drops
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '24px' }}>Most hyped launches right now</p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#525252' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div style={{ fontSize: '14px' }}>Loading...</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trending.map((drop, i) => (
          <Link key={drop.id} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Rank */}
              <div style={{
                width: '28px', textAlign: 'center', fontSize: '16px', fontWeight: 800,
                color: i < 3 ? '#3b82f6' : '#525252',
              }}>{i + 1}</div>

              {/* Image */}
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drop.title}</div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>{drop.brand.name} · {drop.price}</div>
              </div>

              {/* Hype */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: 'rgba(59,130,246,0.08)', color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.12)', flexShrink: 0,
              }}>🔥 {drop.hypeScore}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
