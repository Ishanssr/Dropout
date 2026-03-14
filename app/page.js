'use client';

import { useState } from 'react';
import DropCard from '../components/DropCard';
import { drops, categories, getDropsByCategory } from '../lib/drops';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filteredDrops = getDropsByCategory(activeCategory);

  return (
    <div className="page-container">
      {/* Category pills */}
      <div className="cat-pills">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Feed — single column, scrollable posts like Instagram */}
      <div>
        {filteredDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>

      {filteredDrops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#737373' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: 600, color: '#f5f5f5', marginBottom: '4px' }}>No drops found</div>
          <div style={{ fontSize: '14px' }}>Check back later for new drops</div>
        </div>
      )}
    </div>
  );
}
