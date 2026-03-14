'use client';

import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import HypeScore from './HypeScore';
import { formatNumber } from '../lib/drops';
import Link from 'next/link';

export default function DropCard({ drop, index = 0 }) {
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [likes, setLikes] = useState(drop.engagement.likes);
  const [liked, setLiked] = useState(false);

  const categoryColors = {
    sneakers: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    tech: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
    streetwear: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
    gaming: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    'ai-tools': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    'creator-merch': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
    limited: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  };

  const cat = categoryColors[drop.category] || categoryColors.tech;

  return (
    <div
      className="glass-card overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {/* Featured badge */}
      {drop.featured && (
        <div className="px-4 py-2 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)' }}
        >
          <span className="text-xs">⚡</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#60a5fa]">Featured Drop</span>
        </div>
      )}

      {/* Image area */}
      <Link href={`/drop/${drop.id}`}>
        <div className="relative w-full h-48 overflow-hidden cursor-pointer group"
          style={{ background: `linear-gradient(135deg, ${cat.bg}, rgba(10, 10, 26, 0.8))` }}
        >
          {/* Gradient placeholder with brand emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110 transform">
              {drop.brand.logo}
            </span>
          </div>
          {/* Price tag */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
          >
            <span className="text-[#60a5fa]">{drop.price}</span>
          </div>
          {/* Category badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium"
            style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
          >
            {drop.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand + Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{drop.brand.logo}</span>
            <span className="text-xs text-[#6b7280] font-medium">{drop.brand.name}</span>
          </div>
          <Link href={`/drop/${drop.id}`}>
            <h3 className="text-base font-bold text-[#e8eaed] hover:text-[#60a5fa] transition-colors cursor-pointer leading-tight">
              {drop.title}
            </h3>
          </Link>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <span>⏰</span>
            <span>Drops in</span>
          </div>
          <CountdownTimer dropTime={drop.dropTime} size="small" />
        </div>

        {/* Hype Score */}
        <div className="flex items-center justify-between">
          <HypeScore score={drop.hypeScore} />
          <div className="flex items-center gap-3 text-xs text-[#6b7280]">
            <span>{formatNumber(drop.engagement.views)} views</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1a1a3e]" />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button
              onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[#111128]"
            >
              <span className={`text-sm transition-transform duration-200 ${liked ? 'scale-125' : ''}`}>
                {liked ? '❤️' : '🤍'}
              </span>
              <span className={`text-xs font-medium ${liked ? 'text-red-400' : 'text-[#6b7280]'}`}>
                {formatNumber(likes)}
              </span>
            </button>

            {/* Save */}
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[#111128]"
            >
              <span className={`text-sm transition-transform duration-200 ${saved ? 'scale-125' : ''}`}>
                {saved ? '🔖' : '📄'}
              </span>
              <span className={`text-xs font-medium ${saved ? 'text-[#60a5fa]' : 'text-[#6b7280]'}`}>
                {saved ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Notify */}
            <button
              onClick={() => setNotified(!notified)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[#111128]"
            >
              <span className={`text-sm transition-transform duration-200 ${notified ? 'scale-125' : ''}`}>
                {notified ? '🔔' : '🔕'}
              </span>
              <span className={`text-xs font-medium ${notified ? 'text-[#fbbf24]' : 'text-[#6b7280]'}`}>
                {notified ? 'On' : 'Notify'}
              </span>
            </button>
          </div>

          {/* Visit drop */}
          <a
            href={drop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#60a5fa] hover:bg-[#111128] transition-all duration-200"
          >
            <span>🔗</span>
            <span>Visit</span>
          </a>
        </div>
      </div>
    </div>
  );
}
