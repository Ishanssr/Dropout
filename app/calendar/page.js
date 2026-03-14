'use client';

import { getUpcomingDates } from '../../lib/drops';
import CountdownTimer from '../../components/CountdownTimer';
import HypeScore from '../../components/HypeScore';
import Link from 'next/link';

export default function CalendarPage() {
  const upcomingDates = getUpcomingDates();

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '🔥 Today';
    if (date.toDateString() === tomorrow.toDateString()) return '📅 Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          <span className="text-[#e8eaed]">Drop</span>
          <span className="gradient-text"> Calendar</span>
        </h1>
        <p className="text-[#6b7280] text-sm">
          Never miss a launch. See every upcoming drop organized by date.
        </p>
      </div>

      {/* Calendar timeline */}
      <div className="space-y-6">
        {upcomingDates.map((dateGroup, groupIndex) => (
          <div
            key={dateGroup.date.toISOString()}
            className="animate-slide-up"
            style={{ animationDelay: `${groupIndex * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
          >
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  isToday(dateGroup.date)
                    ? 'text-[#60a5fa]'
                    : 'text-[#9ca3af]'
                }`}
                style={{
                  background: isToday(dateGroup.date)
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'rgba(26, 26, 62, 0.5)',
                  border: isToday(dateGroup.date)
                    ? '1px solid rgba(59, 130, 246, 0.3)'
                    : '1px solid rgba(26, 26, 62, 0.8)',
                }}
              >
                {formatDate(dateGroup.date)}
              </div>
              <div className="flex-1 h-px bg-[#1a1a3e]" />
              <span className="text-xs text-[#6b7280]">{dateGroup.drops.length} drop{dateGroup.drops.length > 1 ? 's' : ''}</span>
            </div>

            {/* Drops for this date */}
            <div className="space-y-2 ml-2 border-l-2 border-[#1a1a3e] pl-4">
              {dateGroup.drops.map((drop) => (
                <Link key={drop.id} href={`/drop/${drop.id}`}>
                  <div className="glass-card p-4 flex items-center gap-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                    >
                      <span className="text-lg">{drop.brand.logo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#e8eaed] truncate">{drop.title}</h3>
                      <p className="text-xs text-[#6b7280]">{drop.brand.name} · {drop.price}</p>
                    </div>
                    <div className="hidden sm:block shrink-0">
                      <CountdownTimer dropTime={drop.dropTime} size="small" />
                    </div>
                    <div className="shrink-0">
                      <HypeScore score={drop.hypeScore} />
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
