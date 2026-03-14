'use client';

import { useState, useRef, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatNumber } from '../lib/drops';
import Link from 'next/link';

/* ===== SVG Icons ===== */
const HeartIcon = ({ filled }) => filled ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);

const CommentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const BookmarkIcon = ({ filled }) => filled ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
);

const BellIcon = ({ filled }) => filled ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);

export default function DropCard({ drop, index = 0 }) {
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [likes, setLikes] = useState(drop.engagement.likes);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Intersection observer for scroll-in animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    if (!liked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 500); }
  };

  const FloatingBtn = ({ onClick, children, active, animating }) => (
    <button
      onClick={onClick}
      className={`border-none cursor-pointer flex items-center justify-center rounded-full ${active ? 'text-blue-500' : 'text-[#e0e0e0]'}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        width: '42px',
        height: '42px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: animating ? 'scale(1.3)' : 'scale(1)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );

  return (
    <article
      ref={ref}
      style={{
        maxWidth: '470px',
        margin: '0 auto',
        width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
        transition: `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s`,
      }}
      className="bg-black"
    >
      {/* ---- HEADER ---- */}
      <div className="flex items-center px-3 py-2.5 gap-2.5">
        <div
          className="w-9 h-9 rounded-full overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            padding: '2px',
          }}
        >
          <img
            src={drop.brand.logo}
            alt={drop.brand.name}
            className="w-full h-full rounded-full object-cover bg-[#111]"
            style={{ border: '2px solid #000' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${drop.brand.name}&background=111&color=3b82f6&size=36`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-white">{drop.brand.name}</span>
          <span className="text-[11px] text-[#525252] ml-1.5">· {drop.category.replace('-', ' ')}</span>
        </div>
        <div
          className="flex items-center gap-1 text-[11px] font-bold text-blue-400 px-2 py-1 rounded-full"
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            animation: 'subtlePulse 3s ease-in-out infinite',
          }}
        >
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* ---- IMAGE ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div
          className="relative w-full aspect-square overflow-hidden cursor-pointer"
          style={{ background: '#080808', borderRadius: '2px' }}
        >
          <img
            src={drop.imageUrl}
            alt={drop.title}
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
          {/* Price tag */}
          <div
            className="absolute bottom-3 right-3 text-[13px] font-bold text-white"
            style={{
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(12px)',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {drop.price}
          </div>
          {/* Featured badge */}
          {drop.featured && (
            <div
              className="absolute top-3 left-3 text-[10px] font-bold text-blue-400 uppercase tracking-wider"
              style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                animation: 'glowPulse 3s ease-in-out infinite',
              }}
            >
              ⚡ Featured
            </div>
          )}
        </div>
      </Link>

      {/* ---- FLOATING ACTION BUTTONS ---- */}
      <div className="flex items-center px-3 py-2 gap-2">
        <FloatingBtn onClick={handleLike} active={liked} animating={likeAnim}>
          <HeartIcon filled={liked} />
        </FloatingBtn>
        <Link href={`/drop/${drop.id}`}>
          <FloatingBtn>
            <CommentIcon />
          </FloatingBtn>
        </Link>
        <FloatingBtn onClick={() => setNotified(!notified)} active={notified}>
          <BellIcon filled={notified} />
        </FloatingBtn>
        <div className="flex-1" />
        <FloatingBtn onClick={() => setSaved(!saved)} active={saved}>
          <BookmarkIcon filled={saved} />
        </FloatingBtn>
      </div>

      {/* ---- LIKES ---- */}
      <div className="px-4 text-[13px] font-semibold text-white">
        {formatNumber(likes)} likes
      </div>

      {/* ---- CAPTION ---- */}
      <div className="px-4 pt-0.5 text-[13px] leading-relaxed">
        <span className="font-semibold text-white">{drop.brand.name}</span>
        <span className="text-[#c0c0c0] ml-1.5">{drop.title}</span>
      </div>

      {/* ---- COUNTDOWN ---- */}
      <div className="flex items-center gap-2 px-4 pt-1.5">
        <span className="text-[11px] text-[#525252]">Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* ---- VIEW COMMENTS ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div className="px-4 pt-1 pb-4 text-[12px] text-[#525252] cursor-pointer hover:text-[#737373]" style={{ transition: 'color 0.2s ease' }}>
          View all {formatNumber(drop.engagement.comments)} comments
        </div>
      </Link>

      {/* Separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent)' }} />
    </article>
  );
}
