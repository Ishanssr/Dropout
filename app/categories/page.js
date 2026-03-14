'use client';

import { categories, getDropsByCategory } from '../../lib/drops';
import DropCard from '../../components/DropCard';
import { useState } from 'react';

export default function CategoriesPage() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const cat = categories.find(c => c.id === selected);
    const catDrops = getDropsByCategory(selected);
    return (
      <div>
        <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }} className="px-4 pt-4">
          <button onClick={() => setSelected(null)} className="bg-transparent border-none text-blue-500 cursor-pointer text-[13px] mb-3 p-0">
            ← All Categories
          </button>
          <h1 className="text-[22px] font-extrabold mb-1">{cat.icon} {cat.name}</h1>
          <p className="text-[13px] text-[#737373] mb-2">{catDrops.length} drops</p>
        </div>
        {catDrops.map((drop) => <DropCard key={drop.id} drop={drop} />)}
        {catDrops.length === 0 && (
          <div className="text-center py-16 text-[#737373]">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">No drops in this category yet</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }} className="px-4 py-4">
      <h1 className="text-[22px] font-extrabold mb-1">
        <span className="text-blue-500">Explore</span> Categories
      </h1>
      <p className="text-[13px] text-[#737373] mb-5">Browse drops by category</p>

      <div className="grid grid-cols-2 gap-2">
        {categories.filter(c => c.id !== 'all').map((cat) => {
          const count = getDropsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className="text-left p-5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-blue-500/30 transition-colors cursor-pointer"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-white">{cat.name}</div>
              <div className="text-xs text-[#525252] mt-0.5">{count} drops</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
