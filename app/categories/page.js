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
      <div className="page-container">
        <div style={{ padding: '16px' }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}>
            ← All Categories
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{cat.icon} {cat.name}</h1>
          <p style={{ fontSize: '13px', color: '#737373' }}>{catDrops.length} drops</p>
        </div>
        {catDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
        {catDrops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#737373' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</div>
            <div>No drops in this category yet</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        <span className="text-gradient">Explore</span> Categories
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '20px' }}>Browse drops by category</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {categories.filter(c => c.id !== 'all').map((cat) => {
          const count = getDropsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className="card"
              style={{ padding: '20px 16px', textAlign: 'left', cursor: 'pointer', border: '1px solid #1a1a1a', background: '#0a0a0a' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f5f5' }}>{cat.name}</div>
              <div style={{ fontSize: '12px', color: '#525252', marginTop: '2px' }}>{count} drops</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
