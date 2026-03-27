'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DropCard from '../../components/DropCard';
import { fetchDrops, fetchFollowingDrops, transformDrop } from '../../lib/api';
import { filterDropsByTab } from '../../lib/dropStatus';
import { GlassPanelLayers } from '../../components/LiquidGlass';

function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export default function Home() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [active, setActive] = useState(categoryFromUrl);
  const [tab, setTab] = useState('upcoming');
  const [feedMode, setFeedMode] = useState('general'); // 'general' or 'foryou'
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getUser());
  }, []);

  useEffect(() => {
    setActive(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setLoading(true);
    const fetchFn = feedMode === 'foryou' && loggedIn ? fetchFollowingDrops : fetchDrops;
    fetchFn(active)
      .then((data) => {
        const transformed = data.map(transformDrop);
        setDrops(filterDropsByTab(transformed, tab));
        setLoading(false);
      })
      .catch(() => {
        import('../../lib/drops').then(({ getDropsByCategory }) => {
          setDrops(filterDropsByTab(getDropsByCategory(active), tab));
          setLoading(false);
        });
      });
  }, [active, tab, feedMode, loggedIn]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
  ];

  return (
    <div>
      {/* ---- Feed Mode Toggle + Tabs ---- */}
      <div style={{ padding: '24px 16px 18px', maxWidth: '470px', margin: '0 auto', width: '100%' }}>

        {/* Feed mode: General / For You */}
        {loggedIn && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div style={{
              display: 'inline-flex', borderRadius: '50px', padding: '3px',
              background: 'rgba(5,5,10,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
              position: 'relative',
            }}>
              <GlassPanelLayers />
              {/* Sliding pill */}
              <div style={{
                position: 'absolute', top: '3px',
                left: feedMode === 'general' ? '3px' : 'calc(50% + 1px)',
                width: 'calc(50% - 4px)', height: 'calc(100% - 6px)',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(59,130,246,0.15)',
                transition: 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
                zIndex: 4,
              }} />
              {[
                { id: 'general', label: 'Explore', icon: '🌍' },
                { id: 'foryou', label: 'For You', icon: '✨' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFeedMode(m.id)}
                  style={{
                    padding: '8px 20px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: feedMode === m.id ? 700 : 500,
                    background: 'transparent',
                    color: feedMode === m.id ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease',
                    borderRadius: '50px',
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: '-0.01em',
                    position: 'relative', zIndex: 5,
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs: Upcoming / Live */}
        <div style={{
          display: 'flex', borderRadius: 'var(--radius-full)',
          overflow: 'hidden', padding: '3px',
          position: 'relative',
          background: 'rgba(5,5,10,0.55)',
          boxShadow: '0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)',
        }}>
          <GlassPanelLayers />
          {/* Sliding indicator pill */}
          <div style={{
            position: 'absolute', top: '3px',
            left: `calc(${tabs.findIndex(t => t.id === tab) * 50}% + 3px)`,
            width: `calc(50% - 6px)`,
            height: 'calc(100% - 6px)',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(59,130,246,0.1)',
            boxShadow: 'inset 1px 1px 0.5px -0.5px rgba(255,255,255,0.3), inset -1px -1px 0.5px -0.5px rgba(255,255,255,0.2), inset 0 0 4px 2px rgba(59,130,246,0.06)',
            transition: 'left 0.5s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
            zIndex: 4,
          }} />
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: tab === t.id ? 600 : 400,
                background: 'transparent',
                color: tab === t.id ? '#fff' : 'var(--text-muted)',
                transition: 'color 0.3s ease, font-weight 0.3s ease',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '-0.01em',
                fontFamily: "'Sora', sans-serif",
                position: 'relative', zIndex: 5,
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
              Filtered: {active.charAt(0).toUpperCase() + active.slice(1).replace(/-/g, ' ')}
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
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', fontFamily: "'Sora', sans-serif", fontSize: '16px', letterSpacing: '-0.02em' }}>
            {feedMode === 'foryou' ? 'No drops from followed brands' : 'No drops found'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {feedMode === 'foryou' ? 'Follow brands to see their drops here' : 'Try a different filter'}
          </div>
        </div>
      )}
    </div>
  );
}
