'use client';

import { useState } from 'react';
import DropCard from '../components/DropCard';
import { drops, categories, getDropsByCategory, getFeaturedDrops } from '../lib/drops';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filteredDrops = getDropsByCategory(activeCategory);
  const featuredDrops = getFeaturedDrops();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Section */}
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
          <span className="gradient-text">Discover</span>
          <span className="text-[#e8eaed]"> What&apos;s Dropping</span>
        </h1>
        <p className="text-[#6b7280] text-base sm:text-lg max-w-xl mx-auto">
          Your daily feed for the hottest launches. Sneakers, tech, streetwear, 
          gaming, and more — all in one place.
        </p>
      </div>

      {/* Featured Banner */}
      {featuredDrops.length > 0 && (
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="glass-card p-5 glow-blue overflow-hidden relative">
            <div className="absolute inset-0 opacity-5"
              style={{ background: 'radial-gradient(circle at 30% 50%, #3b82f6, transparent 70%)' }}
            />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#60a5fa]">⚡ Hot Right Now</span>
                </div>
                <h2 className="text-xl font-bold text-[#e8eaed]">{featuredDrops[0].title}</h2>
                <p className="text-sm text-[#6b7280] mt-1">{featuredDrops[0].brand.name} · {featuredDrops[0].price}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">{featuredDrops.length}</div>
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Featured</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-hype">{drops.length}</div>
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Total Drops</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-pill flex items-center gap-1.5 shrink-0 ${
                activeCategory === cat.id ? 'active' : ''
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#e8eaed]">
          {activeCategory === 'all' ? 'All Drops' : categories.find(c => c.id === activeCategory)?.name}
          <span className="text-[#6b7280] font-normal text-sm ml-2">({filteredDrops.length})</span>
        </h2>
        <select
          className="text-xs bg-[#0a0a1a] border border-[#1a1a3e] rounded-lg px-3 py-1.5 text-[#6b7280] focus:outline-none focus:border-[#3b82f6]"
        >
          <option>Latest</option>
          <option>Most Hyped</option>
          <option>Dropping Soon</option>
          <option>Price: Low to High</option>
        </select>
      </div>

      {/* Drop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrops.map((drop, index) => (
          <DropCard key={drop.id} drop={drop} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {filteredDrops.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-lg font-bold text-[#e8eaed] mb-2">No drops found</h3>
          <p className="text-[#6b7280] text-sm">Check back later for {categories.find(c => c.id === activeCategory)?.name} drops</p>
        </div>
      )}
    </div>
  );
}
