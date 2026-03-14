'use client';

import { useState } from 'react';
import DropCard from '../components/DropCard';
import { drops, categories, getDropsByCategory } from '../lib/drops';

export default function Home() {
  const [active, setActive] = useState('all');
  const filtered = getDropsByCategory(active);

  return (
    <div>
      {/* Category filter — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 max-w-[470px] mx-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer border transition-colors ${
              active === cat.id
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-[#0a0a0a] border-[#262626] text-[#a3a3a3] hover:border-blue-500/50 hover:text-white'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Instagram-style single column feed */}
      {filtered.map((drop) => (
        <DropCard key={drop.id} drop={drop} />
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[#737373]">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold text-white mb-1">No drops found</div>
          <div className="text-sm">Check back later</div>
        </div>
      )}
    </div>
  );
}
