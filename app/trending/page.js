'use client';

import { getTrendingDrops, formatNumber } from '../../lib/drops';
import CountdownTimer from '../../components/CountdownTimer';
import HypeScore from '../../components/HypeScore';
import Link from 'next/link';

export default function TrendingPage() {
  const trending = getTrendingDrops();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          <span className="gradient-text-hype">Trending</span>
          <span className="text-[#e8eaed]"> Drops</span>
        </h1>
        <p className="text-[#6b7280] text-sm">
          The most hyped launches right now, ranked by community engagement.
        </p>
      </div>

      {/* Top 3 spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {trending.slice(0, 3).map((drop, index) => {
          const medals = ['🥇', '🥈', '🥉'];
          const glows = [
            '0 0 30px rgba(245, 158, 11, 0.15)',
            '0 0 30px rgba(192, 192, 192, 0.1)',
            '0 0 30px rgba(205, 127, 50, 0.1)',
          ];
          return (
            <Link key={drop.id} href={`/drop/${drop.id}`}>
              <div
                className="glass-card p-5 text-center cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards', boxShadow: glows[index] }}
              >
                <div className="text-3xl mb-2">{medals[index]}</div>
                <div className="text-3xl mb-3 opacity-40">{drop.brand.logo}</div>
                <h3 className="text-sm font-bold text-[#e8eaed] mb-1">{drop.title}</h3>
                <p className="text-xs text-[#6b7280] mb-3">{drop.brand.name}</p>
                <HypeScore score={drop.hypeScore} />
                <div className="mt-3 text-xs text-[#6b7280]">
                  {formatNumber(drop.engagement.views)} views
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Full List */}
      <div className="space-y-3">
        {trending.map((drop, index) => (
          <Link key={drop.id} href={`/drop/${drop.id}`}>
            <div
              className="glass-card p-4 flex items-center gap-4 cursor-pointer animate-fade-in hover:border-[rgba(59,130,246,0.3)]"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              {/* Rank */}
              <div className="w-8 text-center shrink-0">
                <span className={`text-lg font-extrabold ${index < 3 ? 'gradient-text' : 'text-[#6b7280]'}`}>
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
              >
                <span className="text-xl">{drop.brand.logo}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#e8eaed] truncate">{drop.title}</h3>
                <p className="text-xs text-[#6b7280]">{drop.brand.name} · {drop.price}</p>
              </div>

              {/* Countdown - hide on small */}
              <div className="hidden sm:block shrink-0">
                <CountdownTimer dropTime={drop.dropTime} size="small" />
              </div>

              {/* Hype */}
              <div className="shrink-0">
                <HypeScore score={drop.hypeScore} />
              </div>

              {/* Stats */}
              <div className="hidden md:flex flex-col items-end shrink-0 text-xs text-[#6b7280]">
                <span>❤️ {formatNumber(drop.engagement.likes)}</span>
                <span>💬 {formatNumber(drop.engagement.comments)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
