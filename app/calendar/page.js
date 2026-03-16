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
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }} className="px-4 py-4">
      <h1 className="text-[22px] font-extrabold mb-1">
        Drop <span className="text-blue-500">Calendar</span>
      </h1>
      <p className="text-[13px] text-[#737373] mb-5">Never miss a launch</p>

      {upcomingDates.length === 0 && (
        <div className="text-center py-14 text-[#525252] text-sm">Loading calendar...</div>
      )}

      <div className="flex flex-col gap-6">
        {upcomingDates.map((group) => (
          <div key={group.date.toISOString()}>
            {/* Date label */}
            <div className="flex items-center gap-3 mb-2.5">
              <span className={`text-[13px] font-bold px-3 py-1 rounded-md ${
                isToday(group.date)
                  ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20'
                  : 'text-[#a3a3a3] bg-[#111] border border-[#1a1a1a]'
              }`}>
                {formatDate(group.date)}
              </span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
              <span className="text-xs text-[#525252]">{group.drops.length}</span>
            </div>

            {/* Drops */}
            <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-[#1a1a1a]">
              {group.drops.map((drop) => (
                <Link key={drop.id} href={`/drop/${drop.id}`} className="no-underline text-inherit">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#262626] transition-colors cursor-pointer">
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#111]">
                      <img src={drop.imageUrl} alt={drop.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-white truncate">{drop.title}</div>
                      <div className="text-[11px] text-[#737373]">{drop.brand.name} · {drop.price}</div>
                    </div>
                    <div className="shrink-0 hidden sm:block">
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
