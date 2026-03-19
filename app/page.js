'use client';

import { useState, useEffect } from 'react';
import DropCard from '../components/DropCard';
import { categories } from '../lib/drops';
import { fetchDrops, transformDrop } from '../lib/api';
import { filterDropsByTab } from '../lib/dropStatus';

export default function Home() {
  const [active, setActive] = useState('all');
  const [tab, setTab] = useState('upcoming');
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDrops(active)
      .then((data) => {
        const transformed = data.map(transformDrop);
        setDrops(filterDropsByTab(transformed, tab));
        setLoading(false);
      })
      .catch(() => {
        import('../lib/drops').then(({ getDropsByCategory }) => {
          setDrops(filterDropsByTab(getDropsByCategory(active), tab));
          setLoading(false);
        });
      });
  }, [active, tab]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div>
      {/* ---- Segmented Control: Upcoming / Live / All ---- */}
      <div style={{ padding: '24px 16px 14px', maxWidth: '470px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          padding: '3px',
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.25s ease',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '-0.01em',
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Category pills (horizontal scroll) ---- */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none',
        padding: '4px 16px 18px', maxWidth: '600px', margin: '0 auto', width: '100%',
        WebkitOverflowScrolling: 'touch',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            style={{
              flexShrink: 0, padding: '7px 18px', borderRadius: 'var(--radius-full)',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              border: active === cat.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.06)',
              background: active === cat.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
              color: active === cat.id ? '#60a5fa' : 'var(--text-secondary)',
              transition: 'all 0.25s ease',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => { if (active !== cat.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
            onMouseLeave={(e) => { if (active !== cat.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ maxWidth: '470px', margin: '0 auto', padding: '0 16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: '120px', height: '14px' }} />
              </div>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '2px' }} />
              <div style={{ padding: '12px 0' }}>
                <div className="skeleton" style={{ width: '180px', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '260px', height: '12px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      {!loading && drops.map((drop, i) => (
        <DropCard key={drop.id} drop={drop} index={i} />
      ))}

      {!loading && drops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', fontFamily: "'Sora', sans-serif", fontSize: '16px', letterSpacing: '-0.02em' }}>No drops found</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Try a different filter</div>
        </div>
      )}
    </div>
  );
}
