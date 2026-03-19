'use client';

import { useEffect, useState } from 'react';
import CountdownTimer from '../../components/CountdownTimer';
import Link from 'next/link';

export default function CalendarPage() {
  const [upcomingDates, setUpcomingDates] = useState([]);

  useEffect(() => {
    import('../../lib/drops').then(({ getUpcomingDates }) => {
      setUpcomingDates(getUpcomingDates());
    });
  }, []);

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>
        Drop <span style={{ color: '#3b82f6' }}>Calendar</span>
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px', letterSpacing: '-0.01em' }}>Never miss a launch</p>

      {upcomingDates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '100%', height: '60px' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {upcomingDates.map((group) => (
          <div key={group.date.toISOString()}>
            {/* Date label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: 'var(--radius-sm)',
                fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
                ...(isToday(group.date)
                  ? { color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }
                  : { color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
                ),
              }}>
                {formatDate(group.date)}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{group.drops.length}</span>
            </div>

            {/* Drops */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.04)' }}>
              {group.drops.map((drop) => (
                <Link key={drop.id} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                      <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{drop.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{drop.brand.name} · {drop.price}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <CountdownTimer dropTime={drop.dropTime} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
