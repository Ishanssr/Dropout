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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    if (!liked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 500); }
  };

  const ActionBtn = ({ onClick, children, active, animating }) => (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '50%',
        color: active ? '#3b82f6' : '#e0e0e0',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: animating ? 'scale(1.35)' : 'scale(1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'none'; }}
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
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s`,
        paddingBottom: '20px',
        marginBottom: '4px',
        borderBottom: '1px solid #161616',
      }}
    >
      {/* ---- HEADER — generous padding ---- */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
        {/* Avatar with gradient ring */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', padding: '2px',
        }}>
          <img
            src={drop.brand.logo}
            alt={drop.brand.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#111', border: '2px solid #000' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${drop.brand.name}&background=111&color=3b82f6&size=36`;
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{drop.brand.name}</span>
          <span style={{ fontSize: '12px', color: '#525252', marginLeft: '8px' }}>· {drop.category.replace('-', ' ')}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '12px', fontWeight: 700, color: '#60a5fa',
          padding: '4px 10px', borderRadius: '20px',
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)',
        }}>
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* ---- IMAGE — clean, no border radius ---- */}
      <Link href={`/drop/${drop.id}`} style={{ display: 'block' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#080808', cursor: 'pointer' }}>
          <img
            src={drop.imageUrl}
            alt={drop.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
          <div style={{
            position: 'absolute', bottom: '14px', right: '14px',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            padding: '6px 14px', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {drop.price}
          </div>
          {drop.featured && (
            <div style={{
              position: 'absolute', top: '14px', left: '14px',
              fontSize: '10px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
              padding: '5px 12px', borderRadius: '24px',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>
              ⚡ Featured
            </div>
          )}
        </div>
      </Link>

      {/* ---- ACTION BUTTONS — generous spacing ---- */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '4px' }}>
        <ActionBtn onClick={handleLike} active={liked} animating={likeAnim}>
          <HeartIcon filled={liked} />
        </ActionBtn>
        <Link href={`/drop/${drop.id}`}>
          <ActionBtn><CommentIcon /></ActionBtn>
        </Link>
        <ActionBtn onClick={() => setNotified(!notified)} active={notified}>
          <BellIcon filled={notified} />
        </ActionBtn>
        <div style={{ flex: 1 }} />
        <ActionBtn onClick={() => setSaved(!saved)} active={saved}>
          <BookmarkIcon filled={saved} />
        </ActionBtn>
      </div>

      {/* ---- LIKES — breathing room ---- */}
      <div style={{ padding: '0 16px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
        {formatNumber(likes)} likes
      </div>

      {/* ---- CAPTION ---- */}
      <div style={{ padding: '6px 16px 0', fontSize: '14px', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: '#fff' }}>{drop.brand.name}</span>
        <span style={{ color: '#c0c0c0', marginLeft: '6px' }}>{drop.title}</span>
      </div>

      {/* ---- COUNTDOWN ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px 0' }}>
        <span style={{ fontSize: '12px', color: '#525252' }}>Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* ---- COMMENTS LINK ---- */}
      <Link href={`/drop/${drop.id}`}>
        <div style={{
          padding: '6px 16px 0', fontSize: '13px', color: '#525252', cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#737373'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
        >
          View all {formatNumber(drop.engagement.comments)} comments
        </div>
      </Link>
    </article>
  );
}
