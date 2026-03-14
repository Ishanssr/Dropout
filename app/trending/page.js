'use client';

import { getTrendingDrops, formatNumber } from '../../lib/drops';
import CountdownTimer from '../../components/CountdownTimer';
import Link from 'next/link';

export default function TrendingPage() {
  const trending = getTrendingDrops();

  return (
    <div className="page-container" style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        <span className="text-gradient">Trending</span> Drops
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '20px' }}>
        Most hyped launches right now
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {trending.map((drop, index) => (
          <Link key={drop.id} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              {/* Rank */}
              <div style={{ width: '28px', textAlign: 'center', fontSize: '16px', fontWeight: 800, color: index < 3 ? '#3b82f6' : '#525252' }}>
                {index + 1}
              </div>

              {/* Product image */}
              <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {drop.title}
                </div>
                <div style={{ fontSize: '12px', color: '#737373' }}>{drop.brand.name} · {drop.price}</div>
              </div>

              {/* Hype */}
              <div className="hype-badge">🔥 {drop.hypeScore}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
