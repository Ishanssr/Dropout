'use client';

import { useState, useEffect } from 'react';
import DropCard from '../components/DropCard';
import { categories } from '../lib/drops';
import { fetchDrops, transformDrop } from '../lib/api';

export default function Home() {
  const [active, setActive] = useState('all');
  const [tab, setTab] = useState('upcoming');
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDrops(active)
      .then((data) => {
        let transformed = data.map(transformDrop);
        // Filter by tab
        const now = new Date();
        if (tab === 'upcoming') {
          transformed = transformed.filter(d => new Date(d.dropTime) > now);
        } else if (tab === 'live') {
          transformed = transformed.filter(d => {
            const dt = new Date(d.dropTime);
            return dt <= now && dt > new Date(now - 24 * 60 * 60 * 1000);
          });
        }
        setDrops(transformed);
        setLoading(false);
      })
      .catch(() => {
        import('../lib/drops').then(({ getDropsByCategory }) => {
          setDrops(getDropsByCategory(active));
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
      <div style={{ padding: '20px 16px 12px', maxWidth: '470px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex', borderRadius: '50px',
          border: '1px solid #262626', overflow: 'hidden',
          background: '#0a0a0a',
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? '#1a1a1a' : 'transparent',
                color: tab === t.id ? '#fff' : '#737373',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Category pills ---- */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none',
        padding: '4px 16px 16px', maxWidth: '470px', margin: '0 auto', width: '100%',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: '50px',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              border: 'none',
              background: active === cat.id ? '#3b82f6' : '#1a1a1a',
              color: active === cat.id ? '#fff' : '#a3a3a3',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { if (active !== cat.id) { e.currentTarget.style.background = '#262626'; e.currentTarget.style.color = '#fff'; }}}
            onMouseLeave={(e) => { if (active !== cat.id) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#a3a3a3'; }}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#525252' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div style={{ fontSize: '14px' }}>Loading drops...</div>
        </div>
      )}

      {/* Feed */}
      {!loading && drops.map((drop, i) => (
        <DropCard key={drop.id} drop={drop} index={i} />
      ))}

      {!loading && drops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#737373' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>No drops found</div>
          <div style={{ fontSize: '14px' }}>Try a different filter</div>
        </div>
      )}
    </div>
  );
}
