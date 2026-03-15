'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CountdownTimer from './CountdownTimer';
import { formatNumber, likeDrop, unlikeDrop, toggleSave } from '../lib/api';

export default function DropCard({ drop, index = 0 }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(drop.engagement?.likes || drop.likes || 0);
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const saves = drop.engagement?.saves || drop._count?.saves || 0;
  const comments = drop.engagement?.comments || drop._count?.comments || 0;

  // Like handler — calls API
  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try {
      if (newLiked) {
        await likeDrop(drop.id);
      } else {
        await unlikeDrop(drop.id);
      }
    } catch (err) {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  // Save handler — calls API
  const handleSave = async () => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    if (!user) {
      router.push('/login');
      return;
    }
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(user.id, drop.id);
    } catch (err) {
      setSaved(!newSaved);
    }
  };

  // Share handler — native share or copy link
  const handleShare = async () => {
    const url = `${window.location.origin}/drop/${drop.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: drop.title, text: `Check out ${drop.title} on Dropout!`, url });
      } catch (err) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Comment handler — navigate to drop detail
  const handleComment = () => {
    router.push(`/drop/${drop.id}`);
  };

  return (
    <div
      ref={ref}
      style={{
        maxWidth: '470px', width: '100%', margin: '0 auto 8px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
      }}
    >
      {/* ---- Header: brand ---- */}
      <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', padding: '2px',
          }}>
            <img
              src={drop.brand?.logo}
              alt={drop.brand?.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#111', border: '2px solid #000' }}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${drop.brand?.name}&background=111&color=3b82f6&size=34`; }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{drop.brand?.name}</div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
            color: '#60a5fa', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)',
          }}>🔥 {drop.hypeScore}</div>
        </div>
      </Link>

      {/* ---- Image with countdown overlay ---- */}
      <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#080808' }}>
          <img
            src={drop.imageUrl}
            alt={drop.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
          />
          {/* Countdown + Notify Me overlay */}
          <div style={{
            position: 'absolute', bottom: '14px', left: '14px', right: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)',
            borderRadius: '14px', padding: '10px 14px',
          }}>
            <CountdownTimer dropTime={drop.dropTime} />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNotified(!notified); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: notified ? '#1e40af' : '#3b82f6', color: '#fff',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={notified ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notified ? '🔔 On' : 'Notify Me'}
            </button>
          </div>
          {drop.featured && (
            <div style={{
              position: 'absolute', top: '14px', left: '14px', fontSize: '10px', fontWeight: 700,
              color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
              padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.2)',
              animation: 'glowPulse 2s ease-in-out infinite',
            }}>⚡ Featured</div>
          )}
        </div>
      </Link>

      {/* ---- Action buttons ---- */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px 4px', gap: '2px' }}>
        {/* Like */}
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : '#e0e0e0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        {/* Comment */}
        <button onClick={handleComment} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        {/* Share */}
        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>

        <div style={{ flex: 1 }} />

        {/* Bookmark/Save */}
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? '#3b82f6' : 'none'} stroke={saved ? '#3b82f6' : '#e0e0e0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      {/* ---- Stats row ---- */}
      <div style={{ padding: '0 16px 6px', display: 'flex', gap: '14px', fontSize: '13px' }}>
        <span style={{ fontWeight: 700, color: '#fff' }}>{formatNumber(likeCount)} likes</span>
        <span style={{ color: '#737373' }}>{formatNumber(saves)} saves</span>
        <span style={{ color: '#737373', cursor: 'pointer' }} onClick={handleComment}>{formatNumber(comments)} comments</span>
      </div>

      {/* ---- Title & Description ---- */}
      <div style={{ padding: '0 16px 6px' }}>
        <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{drop.title}</div>
        </Link>
        <div style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {drop.description}
        </div>
      </div>

      {/* ---- Price + Shop Now ---- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 16px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>{drop.price}</div>
        {drop.website && (
          <a
            href={drop.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid #262626',
              color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Shop Now
          </a>
        )}
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #1a1a1a, transparent)', margin: '0 16px' }} />
    </div>
  );
}
