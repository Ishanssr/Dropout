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
        <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '24px 16px 16px' }}>
          <button onClick={() => setSelected(null)} style={{
            background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
            fontSize: '13px', marginBottom: '12px', padding: 0, fontWeight: 500, letterSpacing: '-0.01em',
          }}>
            ← All Categories
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>{cat.icon} {cat.name}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{catDrops.length} drops</p>
        </div>
        {catDrops.map((drop) => <DropCard key={drop.id} drop={drop} />)}
        {catDrops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.5 }}>◇</div>
            <div style={{ fontSize: '14px' }}>No drops in this category yet</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>
        <span style={{ color: '#3b82f6' }}>Explore</span> <span style={{ color: '#fff' }}>Categories</span>
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', letterSpacing: '-0.01em' }}>Browse drops by category</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {categories.filter(c => c.id !== 'all').map((cat) => {
          const count = getDropsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              style={{
                textAlign: 'left', padding: '22px 18px', borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', transition: 'all 0.3s ease',
                color: '#fff',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{cat.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>{cat.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{count} drops</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
