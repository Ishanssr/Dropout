'use client';

import { categories, getDropsByCategory } from '../../lib/drops';
import DropCard from '../../components/DropCard';
import { useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categoryMeta = {
    sneakers: { desc: 'The latest kicks from Nike, Jordan, Yeezy, and more', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    tech: { desc: 'Cutting-edge gadgets and devices from top brands', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
    streetwear: { desc: 'Fresh drops from Supreme, Palace, and street brands', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    gaming: { desc: 'New games, consoles, skins, and gaming gear', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    'ai-tools': { desc: 'The latest AI products and tools launching', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    'creator-merch': { desc: 'Merch drops from your favorite creators', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
    limited: { desc: 'Ultra-limited drops and exclusive collabs', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  };

  if (selectedCategory) {
    const drops = getDropsByCategory(selectedCategory);
    const cat = categories.find(c => c.id === selectedCategory);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-[#6b7280] hover:text-[#60a5fa] text-sm mb-6 transition-colors"
        >
          ← Back to Categories
        </button>

        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{cat.icon}</span>
            <h1 className="text-3xl font-extrabold text-[#e8eaed]">{cat.name}</h1>
          </div>
          <p className="text-[#6b7280] text-sm">{categoryMeta[selectedCategory]?.desc}</p>
          <p className="text-xs text-[#6b7280] mt-1">{drops.length} upcoming drops</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drops.map((drop, index) => (
            <DropCard key={drop.id} drop={drop} index={index} />
          ))}
        </div>

        {drops.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-[#e8eaed] mb-2">No drops yet</h3>
            <p className="text-[#6b7280] text-sm">Check back soon for {cat.name} drops</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          <span className="text-[#e8eaed]">Browse</span>
          <span className="gradient-text"> Categories</span>
        </h1>
        <p className="text-[#6b7280] text-sm">
          Explore drops across all categories
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.filter(c => c.id !== 'all').map((cat, index) => {
          const drops = getDropsByCategory(cat.id);
          const meta = categoryMeta[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="glass-card p-5 text-left cursor-pointer animate-slide-up group"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: meta?.gradient, opacity: 0.9 }}
                >
                  {cat.icon}
                </div>
                <span className="text-xs text-[#6b7280] bg-[#111128] px-2 py-1 rounded-lg">
                  {drops.length} drops
                </span>
              </div>
              <h3 className="text-base font-bold text-[#e8eaed] group-hover:text-[#60a5fa] transition-colors">{cat.name}</h3>
              <p className="text-xs text-[#6b7280] mt-1">{meta?.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
