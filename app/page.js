'use client';

import { useState } from 'react';
import DropCard from '../components/DropCard';
import { drops, categories, getDropsByCategory } from '../lib/drops';

export default function Home() {
  const [active, setActive] = useState('all');
  const filtered = getDropsByCategory(active);

  return (
    <div>
      {/* Category filter — extended width, floating pills */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        padding: '24px 24px 20px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        scrollbarWidth: 'none',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            style={{
              flexShrink: 0,
              padding: '10px 20px',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: active === cat.id ? 600 : 500,
              cursor: 'pointer',
              border: active === cat.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid #1a1a1a',
              background: active === cat.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
              color: active === cat.id ? '#60a5fa' : '#a3a3a3',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={(e) => {
              if (active !== cat.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== cat.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#a3a3a3';
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {cat.icon}  {cat.name}
          </button>
        ))}
      </div>

      {/* Instagram-style single column feed */}
      {filtered.map((drop, i) => (
        <DropCard key={drop.id} drop={drop} index={i} />
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#737373' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>No drops found</div>
          <div style={{ fontSize: '14px' }}>Check back later</div>
        </div>
      )}
    </div>
  );
}
