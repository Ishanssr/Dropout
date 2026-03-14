'use client';

import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatNumber } from '../lib/drops';
import Link from 'next/link';

export default function DropCard({ drop }) {
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [likes, setLikes] = useState(drop.engagement.likes);
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-black border-b border-[#1a1a1a] max-w-[470px] mx-auto">
      {/* ---- HEADER (like Instagram: avatar, name, badge) ---- */}
      <div className="flex items-center px-4 py-3 gap-3">
        <img
          src={drop.brand.logo}
          alt={drop.brand.name}
          className="w-8 h-8 rounded-full border-2 border-[#262626] object-cover bg-[#111]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${drop.brand.name}&background=111&color=3b82f6&size=32`;
          }}
        />
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{drop.brand.name}</div>
          <div className="text-[11px] text-blue-500 font-medium capitalize">{drop.category.replace('-', ' ')}</div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* ---- IMAGE (full-width, square, like Instagram) ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div className="relative w-full aspect-square overflow-hidden bg-[#0a0a0a] cursor-pointer">
          <img
            src={drop.imageUrl}
            alt={drop.title}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
          />
          {/* Price badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-black/70 backdrop-blur-md border border-blue-500/20">
            {drop.price}
          </div>
          {/* Featured badge */}
          {drop.featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-500 bg-black/70 backdrop-blur-md border border-blue-500/20 uppercase tracking-wide">
              ⚡ Featured
            </div>
          )}
        </div>
      </Link>

      {/* ---- ACTION BUTTONS (like Instagram: heart, comment, share, bookmark) ---- */}
      <div className="flex items-center px-3 py-2 gap-1">
        <button
          onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
          className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl"
        >
          {liked ? '❤️' : '🤍'}
        </button>
        <Link href={`/drop/${drop.id}`} className="no-underline">
          <button className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl">
            💬
          </button>
        </Link>
        <button
          onClick={() => setNotified(!notified)}
          className={`bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl ${notified ? 'text-blue-500' : 'text-white'}`}
        >
          {notified ? '🔔' : '🔕'}
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setSaved(!saved)}
          className={`bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl ${saved ? 'text-blue-500' : 'text-white'}`}
        >
          {saved ? '🔖' : '📑'}
        </button>
      </div>

      {/* ---- LIKES ---- */}
      <div className="px-4 text-sm font-semibold text-white">
        {formatNumber(likes)} likes
      </div>

      {/* ---- CAPTION (brand name in bold, then title + description) ---- */}
      <div className="px-4 pt-1 text-sm text-[#a3a3a3] leading-relaxed">
        <span className="font-semibold text-white mr-1.5">{drop.brand.name}</span>
        {drop.title} — {drop.description}
      </div>

      {/* ---- COUNTDOWN ---- */}
      <div className="flex items-center gap-3 px-4 pt-2">
        <span className="text-[13px] text-[#525252]">Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* ---- VIEW COMMENTS ---- */}
      <Link href={`/drop/${drop.id}`} className="no-underline">
        <div className="px-4 pt-1.5 text-[13px] text-[#525252] cursor-pointer hover:text-[#737373] transition-colors">
          View all {formatNumber(drop.engagement.comments)} comments
        </div>
      </Link>

      {/* ---- SPACER ---- */}
      <div className="h-4" />
    </article>
  );
}
