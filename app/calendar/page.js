'use client';

import { getUpcomingDates } from '../../lib/drops';
import CountdownTimer from '../../components/CountdownTimer';
import Link from 'next/link';

export default function CalendarPage() {
  const upcomingDates = getUpcomingDates();

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
    <div className="page-container" style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        Drop <span className="text-gradient">Calendar</span>
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '20px' }}>
        Never miss a launch
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {upcomingDates.map((dateGroup) => (
          <div key={dateGroup.date.toISOString()}>
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isToday(dateGroup.date) ? '#3b82f6' : '#a3a3a3',
                padding: '4px 12px',
                borderRadius: '6px',
                background: isToday(dateGroup.date) ? 'rgba(59, 130, 246, 0.1)' : '#111',
                border: `1px solid ${isToday(dateGroup.date) ? 'rgba(59, 130, 246, 0.2)' : '#1a1a1a'}`,
              }}>
                {formatDate(dateGroup.date)}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
              <span style={{ fontSize: '12px', color: '#525252' }}>{dateGroup.drops.length}</span>
            </div>

            {/* Drops */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: '2px solid #1a1a1a' }}>
              {dateGroup.drops.map((drop) => (
                <Link key={drop.id} href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                      <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {drop.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#737373' }}>{drop.brand.name} · {drop.price}</div>
                    </div>
                    <CountdownTimer dropTime={drop.dropTime} />
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
