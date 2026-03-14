'use client';

import { useState } from 'react';
import { drops } from '../../lib/drops';
import DropCard from '../../components/DropCard';

export default function SavedPage() {
  // For MVP, show a curated selection as "saved" with ability to manage
  const [savedDrops, setSavedDrops] = useState(drops.slice(0, 4).map(d => d.id));

  const savedItems = drops.filter(d => savedDrops.includes(d.id));

  const removeDrop = (id) => {
    setSavedDrops(prev => prev.filter(sid => sid !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          <span className="text-[#e8eaed]">My</span>
          <span className="gradient-text"> Saved Drops</span>
        </h1>
        <p className="text-[#6b7280] text-sm">
          {savedItems.length} drop{savedItems.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold gradient-text">{savedItems.length}</div>
          <div className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-1">Saved</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold gradient-text-hype">
            {savedItems.filter(d => new Date(d.dropTime) > new Date()).length}
          </div>
          <div className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-1">Upcoming</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-[#10b981]">
            {savedItems.filter(d => d.hypeScore >= 90).length}
          </div>
          <div className="text-[10px] text-[#6b7280] uppercase tracking-wider mt-1">Hot 🔥</div>
        </div>
      </div>

      {/* Saved Drops Grid */}
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((drop, index) => (
            <div key={drop.id} className="relative group">
              <DropCard drop={drop} index={index} />
              <button
                onClick={() => removeDrop(drop.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center 
                  opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <span className="text-5xl mb-4 block">🔖</span>
          <h3 className="text-lg font-bold text-[#e8eaed] mb-2">No saved drops yet</h3>
          <p className="text-[#6b7280] text-sm mb-4">Start saving drops you&apos;re interested in!</p>
          <a href="/" className="btn-primary text-sm">Browse Drops</a>
        </div>
      )}
    </div>
  );
}
