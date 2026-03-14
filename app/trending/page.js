'use client';

import { getTrendingDrops, formatNumber } from '../../lib/drops';
import Link from 'next/link';

export default function TrendingPage() {
  const trending = getTrendingDrops();

  return (
    <div className="max-w-[470px] mx-auto px-4 py-4">
      <h1 className="text-[22px] font-extrabold mb-1">
        <span className="text-blue-500">Trending</span> Drops
      </h1>
      <p className="text-[13px] text-[#737373] mb-5">Most hyped launches right now</p>

      <div className="flex flex-col gap-2">
        {trending.map((drop, i) => (
          <Link key={drop.id} href={`/drop/${drop.id}`} className="no-underline text-inherit">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#262626] transition-colors cursor-pointer">
              {/* Rank */}
              <div className={`w-7 text-center text-base font-extrabold ${i < 3 ? 'text-blue-500' : 'text-[#525252]'}`}>
                {i + 1}
              </div>

              {/* Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#111]">
                <img src={drop.imageUrl} alt={drop.title} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{drop.title}</div>
                <div className="text-xs text-[#737373]">{drop.brand.name} · {drop.price}</div>
              </div>

              {/* Hype */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                🔥 {drop.hypeScore}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
