'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DropCard from '../components/DropCard';
import { fetchDrops, transformDrop } from '../lib/api';
import { filterDropsByTab } from '../lib/dropStatus';

export default function Home() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [active, setActive] = useState(categoryFromUrl);
  const [tab, setTab] = useState('upcoming');
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActive(categoryFromUrl);
  }, [categoryFromUrl]);

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
      <div style={{ padding: '24px 16px 18px', maxWidth: '470px', margin: '0 auto', width: '100%' }}>
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
        {/* Active category indicator */}
        {active !== 'all' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', marginTop: '12px',
          }}>
            <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 500 }}>
              Filtered: {active.charAt(0).toUpperCase() + active.slice(1).replace('-', ' ')}
            </span>
            <button
              onClick={() => setActive('all')}
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 'var(--radius-full)', padding: '3px 10px',
                fontSize: '11px', color: '#ef4444', cursor: 'pointer', fontWeight: 500,
              }}
            >✕ Clear</button>
          </div>
        )}
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
