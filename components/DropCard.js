'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CountdownTimer from './CountdownTimer';
import { formatNumber, toggleLike, toggleSave, toggleFollowBrand } from '../lib/api';
import { getNotificationForDrop, requestNotificationPermission, toggleDropReminder } from '../lib/notifications';
import { getDropStatus } from '../lib/dropStatus';
import { notifyUserChanged } from '../lib/userStorage';

export default function DropCard({ drop, index = 0 }) {
  const router = useRouter();
  const [liked, setLiked] = useState(drop.isLiked || false);
  const [likeCount, setLikeCount] = useState(drop.engagement?.likes || drop._count?.likes || 0);
  const [saved, setSaved] = useState(drop.isSaved || false);
  const [following, setFollowing] = useState(drop.isFollowingBrand || drop.brand?.isFollowing || false);
  const [notified, setNotified] = useState(() => (
    typeof window !== 'undefined' ? !!getNotificationForDrop(drop.id) : false
  ));
  const [visible, setVisible] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const ref = useRef(null);
  const touchStartX = useRef(0);

  // Build image array: use imageUrls if available, otherwise just imageUrl
  const images = (drop.imageUrls && drop.imageUrls.length > 0)
    ? drop.imageUrls
    : [drop.imageUrl].filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const syncReminderState = () => setNotified(!!getNotificationForDrop(drop.id));
    window.addEventListener('dropout-notifications-changed', syncReminderState);
    return () => window.removeEventListener('dropout-notifications-changed', syncReminderState);
  }, [drop.id]);

  const saves = drop.engagement?.saves || drop._count?.saves || 0;
  const comments = drop.engagement?.comments || drop._count?.comments || 0;
  const dropStatus = getDropStatus(drop);
  const isLive = dropStatus === 'live';

  const getUser = () => typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const requireLogin = () => {
    const user = getUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!user || !token) { alert('Log in to interact'); router.push('/login'); return false; }
    return true;
  };

  const handleLike = async () => {
    if (!requireLogin()) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try { const result = await toggleLike(drop.id); setLiked(result.liked); setLikeCount(result.likes); }
    catch { setLiked(!newLiked); setLikeCount(prev => newLiked ? prev - 1 : prev + 1); }
  };

  const handleSave = async () => {
    if (!requireLogin()) return;
    const user = getUser();
    const newSaved = !saved;
    setSaved(newSaved);
    try { await toggleSave(user.id, drop.id); } catch { setSaved(!newSaved); }
  };

  const handleFollow = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireLogin()) return;
    const brandId = drop.brand?.id;
    if (!brandId) return;
    const newFollowing = !following;
    setFollowing(newFollowing);
    try { const result = await toggleFollowBrand(brandId); setFollowing(result.following); }
    catch { setFollowing(!newFollowing); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/drop/${drop.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: drop.title, text: `Check out ${drop.title} on Dropamyn!`, url }); } catch {}
    } else { await navigator.clipboard.writeText(url); alert('Link copied!'); }
  };

  const handleComment = () => { if (!requireLogin()) return; router.push(`/drop/${drop.id}`); };

  const handleNotify = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireLogin()) return;
    if (dropStatus === 'ended') { alert('This drop has already ended.'); return; }
    const permission = await requestNotificationPermission();
    if (permission === 'denied') alert('Browser notifications are blocked.');
    const result = toggleDropReminder(drop);
    setNotified(result.active);
    alert(result.active ? 'Reminder saved.' : 'Reminder removed.');
  };

  // Swipe handlers for carousel
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (images.length <= 1) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0 && currentImg < images.length - 1) setCurrentImg(currentImg + 1);
      else if (delta < 0 && currentImg > 0) setCurrentImg(currentImg - 1);
    }
  };

  return (
    <div ref={ref} style={{
      maxWidth: '470px', width: '100%', margin: '0 auto 16px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease ${index * 0.06}s, transform 0.6s ease ${index * 0.06}s`,
    }}>
      {/* Header: brand + follow */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
        <Link href={`/brand/${drop.brand?.id || drop.brandId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '2px' }}>
            <img src={drop.brand?.logo} alt={drop.brand?.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-secondary)', border: '2px solid var(--bg-primary)' }}
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${drop.brand?.name}&background=0a0a0f&color=3b82f6&size=36`; }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{drop.brand?.name}</div>
          </div>
        </Link>
        <button onClick={handleFollow} className="lg-pill" style={{
          padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600,
          color: following ? 'var(--text-secondary)' : '#60a5fa', cursor: 'pointer', letterSpacing: '-0.01em', flexShrink: 0,
        }}>{following ? 'Following' : 'Follow'}</button>
        <div style={{
          padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600,
          color: '#60a5fa', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.08)',
          letterSpacing: '-0.01em', flexShrink: 0,
        }}>🔥 {drop.hypeScore}</div>
      </div>

      {/* Image with carousel + countdown overlay */}
      <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg-secondary)', borderRadius: '2px' }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
        >
          <div style={{
            display: 'flex', width: `${images.length * 100}%`,
            transform: `translateX(-${currentImg * (100 / images.length)}%)`,
            transition: 'transform 0.35s ease',
            height: '100%',
          }}>
            {images.map((src, i) => (
              <img key={i} src={src} alt={`${drop.title} ${i + 1}`}
                style={{ width: `${100 / images.length}%`, height: '100%', objectFit: 'cover', display: 'block', flexShrink: 0 }}
              />
            ))}
          </div>

          {/* Carousel dots */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', top: '12px', right: '14px',
              display: 'flex', gap: '5px', padding: '5px 8px',
              background: 'rgba(0,0,0,0.4)', borderRadius: '50px',
            }}>
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(i); }}
                  style={{
                    width: currentImg === i ? '16px' : '6px', height: '6px', borderRadius: '50px',
                    background: currentImg === i ? '#fff' : 'rgba(255,255,255,0.4)',
                    border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Countdown + Notify Me overlay */}
          <div className="lg-overlay-bar" style={{
            position: 'absolute', bottom: '14px', left: '14px', right: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(5,5,8,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
          }}>
            <CountdownTimer dropTime={drop.dropTime} />
            <button onClick={handleNotify} className="lg-notify" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
              color: '#fff', fontSize: '12px', fontWeight: 600,
              opacity: dropStatus === 'ended' ? 0.5 : 1, letterSpacing: '-0.01em',
            }} disabled={dropStatus === 'ended'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={notified ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notified ? 'Reminder On' : 'Notify Me'}
            </button>
          </div>

          {drop.featured && (
            <div style={{
              position: 'absolute', top: '14px', left: '14px', fontSize: '10px', fontWeight: 600,
              color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em',
              background: 'rgba(5,5,8,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              padding: '5px 12px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59,130,246,0.15)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}>⚡ Featured</div>
          )}
        </div>
      </Link>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px 4px', gap: '2px' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#3b82f6' : 'none'} stroke={liked ? '#3b82f6' : 'var(--text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
        <button onClick={handleComment} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? '#3b82f6' : 'none'} stroke={saved ? '#3b82f6' : 'var(--text-secondary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 16px 6px', display: 'flex', gap: '14px', fontSize: '13px' }}>
        <span style={{ fontWeight: 600, color: '#fff' }}>{formatNumber(likeCount)} upvotes</span>
        <span style={{ color: 'var(--text-muted)' }}>{formatNumber(saves)} saves</span>
        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={handleComment}>{formatNumber(comments)} comments</span>
      </div>

      {/* Title & Description */}
      <div style={{ padding: '0 16px 6px' }}>
        <Link href={`/drop/${drop.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px', letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif" }}>{drop.title}</div>
        </Link>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {drop.description}
        </div>
      </div>

      {/* Price + Shop Now / View Details */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 18px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>{drop.price}</div>
        {isLive && drop.website ? (
          <a href={drop.website} target="_blank" rel="noopener noreferrer" className="lg-shop"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '10px',
              color: '#fff', fontSize: '13px', fontWeight: 500, textDecoration: 'none', letterSpacing: '-0.01em',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Shop Now
          </a>
        ) : (
          <Link href={`/drop/${drop.id}`} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', letterSpacing: '-0.01em',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            View Details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        )}
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', margin: '0 16px' }} />
    </div>
  );
}
