'use client';

import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatNumber } from '../lib/drops';
import Link from 'next/link';

const HeartIcon = ({ filled }) => filled ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);

const CommentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const BookmarkIcon = ({ filled }) => filled ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
);

const BellIcon = ({ filled }) => filled ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);

export default function DropCard({ drop }) {
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [likes, setLikes] = useState(drop.engagement.likes);
  const [liked, setLiked] = useState(false);

  const ActionBtn = ({ onClick, children, active }) => (
    <button
      onClick={onClick}
      className={`bg-transparent border-none cursor-pointer p-2 rounded-lg hover:opacity-70 transition-opacity flex items-center ${active ? 'text-blue-500' : 'text-[#f5f5f5]'}`}
    >
      {children}
    </button>
  );

  return (
    <article style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }} className="bg-black border-b border-[#1a1a1a]">
      {/* ---- HEADER ---- */}
      <div className="flex items-center px-3 py-2.5 gap-2.5">
        <img
          src={drop.brand.logo}
          alt={drop.brand.name}
          className="w-8 h-8 rounded-full border border-[#262626] object-cover bg-[#111]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${drop.brand.name}&background=111&color=3b82f6&size=32`;
          }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-white">{drop.brand.name}</span>
          <span className="text-[12px] text-[#737373] ml-1">· {drop.category.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-blue-400">
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* ---- IMAGE ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div className="relative w-full aspect-square overflow-hidden bg-[#0a0a0a] cursor-pointer">
          <img
            src={drop.imageUrl}
            alt={drop.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[13px] font-bold text-white bg-black/70 backdrop-blur-sm">
            {drop.price}
          </div>
          {drop.featured && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold text-blue-400 bg-black/70 backdrop-blur-sm uppercase tracking-wide">
              ⚡ Featured
            </div>
          )}
        </div>
      </Link>

      {/* ---- ACTIONS (like Instagram: heart, comment, bell on left — bookmark on right) ---- */}
      <div className="flex items-center px-2 py-1">
        <ActionBtn onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }} active={liked}>
          <HeartIcon filled={liked} />
        </ActionBtn>
        <Link href={`/drop/${drop.id}`}>
          <ActionBtn><CommentIcon /></ActionBtn>
        </Link>
        <ActionBtn onClick={() => setNotified(!notified)} active={notified}>
          <BellIcon filled={notified} />
        </ActionBtn>
        <div className="flex-1" />
        <ActionBtn onClick={() => setSaved(!saved)} active={saved}>
          <BookmarkIcon filled={saved} />
        </ActionBtn>
      </div>

      {/* ---- LIKES ---- */}
      <div className="px-4 text-sm font-semibold text-white">
        {formatNumber(likes)} likes
      </div>

      {/* ---- CAPTION ---- */}
      <div className="px-4 pt-1 text-sm leading-relaxed">
        <span className="font-semibold text-white">{drop.brand.name}</span>
        <span className="text-[#e0e0e0] ml-1.5">{drop.title}</span>
      </div>

      {/* ---- COUNTDOWN ---- */}
      <div className="flex items-center gap-2.5 px-4 pt-1.5">
        <span className="text-[12px] text-[#525252]">Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* ---- VIEW COMMENTS ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div className="px-4 pt-1 pb-3 text-[13px] text-[#525252] cursor-pointer">
          View all {formatNumber(drop.engagement.comments)} comments
        </div>
      </Link>
    </article>
  );
}
