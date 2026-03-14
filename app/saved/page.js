'use client';

import { drops } from '../../lib/drops';
import DropCard from '../../components/DropCard';

export default function SavedPage() {
  const savedItems = drops.slice(0, 4);

  return (
    <div>
      <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }} className="px-4 pt-4">
        <h1 className="text-[22px] font-extrabold mb-1">
          <span className="text-blue-500">Saved</span> Drops
        </h1>
        <p className="text-[13px] text-[#737373] mb-2">{savedItems.length} saved</p>
      </div>

      {savedItems.map((drop) => <DropCard key={drop.id} drop={drop} />)}

      {savedItems.length === 0 && (
        <div className="text-center py-20 text-[#737373]">
          <div className="text-4xl mb-3">🔖</div>
          <div className="font-semibold text-white mb-1">No saved drops</div>
          <div className="text-sm">Tap the bookmark icon to save drops</div>
        </div>
      )}
    </div>
  );
}
