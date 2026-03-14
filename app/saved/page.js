'use client';

import { useState } from 'react';
import { drops } from '../../lib/drops';
import DropCard from '../../components/DropCard';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState(drops.slice(0, 4).map(d => d.id));
  const savedItems = drops.filter(d => savedIds.includes(d.id));

  return (
    <div className="page-container">
      <div style={{ padding: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
          <span className="text-gradient">Saved</span> Drops
        </h1>
        <p style={{ fontSize: '13px', color: '#737373' }}>{savedItems.length} saved</p>
      </div>

      {savedItems.length > 0 ? (
        savedItems.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#737373' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔖</div>
          <div style={{ fontWeight: 600, color: '#f5f5f5', marginBottom: '4px' }}>No saved drops</div>
          <div style={{ fontSize: '14px' }}>Tap the bookmark icon on any drop to save it</div>
        </div>
      )}
    </div>
  );
}
