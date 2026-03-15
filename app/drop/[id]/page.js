'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDrop, transformDrop, formatNumber, addComment, likeDrop, unlikeDrop, toggleSave } from '../../../lib/api';
import CountdownTimer from '../../../components/CountdownTimer';
import Link from 'next/link';

export default function DropDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [posting, setPosting] = useState(false);

  const getUser = () => typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const requireLogin = () => {
    if (!getUser()) {
      alert('Log in to interact');
      router.push('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchDrop(resolvedParams.id)
      .then((data) => {
        const d = transformDrop(data);
        setDrop(d);
        setLikeCount(d.engagement.likes);
        // Load real comments from API response
        if (data.comments && data.comments.length > 0) {
          setComments(data.comments.map(c => ({
            id: c.id,
            user: c.user?.name || 'Anonymous',
            text: c.text,
            time: getTimeAgo(c.createdAt),
          })));
        }
        setLoading(false);
      })
      .catch(() => {
        import('../../../lib/drops').then(({ getDropById }) => {
          const d = getDropById(resolvedParams.id);
          setDrop(d);
          if (d) setLikeCount(d.engagement?.likes || 0);
          setLoading(false);
        });
      });
  }, [resolvedParams.id]);

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  // Post comment to API
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!requireLogin()) return;
    const user = getUser();
    setPosting(true);
    try {
      const comment = await addComment(drop.id, newComment.trim(), user.id);
      setComments([{
        id: comment.id,
        user: comment.user?.name || user.name,
        text: comment.text,
        time: 'now',
      }, ...comments]);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment');
    }
    setPosting(false);
  };

  // Like
  const handleLike = async () => {
    if (!requireLogin()) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try {
      if (newLiked) await likeDrop(drop.id);
      else await unlikeDrop(drop.id);
    } catch {
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  // Save
  const handleSave = async () => {
    const user = getUser();
    if (!user) { alert('Log in to interact'); router.push('/login'); return; }
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      await toggleSave(user.id, drop.id);
    } catch {
      setSaved(!newSaved);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', textAlign: 'center', padding: '80px 20px', color: '#525252' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <div style={{ fontSize: '14px' }}>Loading drop...</div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Drop not found</div>
        <Link href="/" style={{
          display: 'inline-block', marginTop: '12px', padding: '10px 24px',
          borderRadius: '50px', background: '#3b82f6', color: '#fff',
          fontWeight: 600, fontSize: '14px', textDecoration: 'none',
        }}>Back to Feed</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }}>
      {/* Back */}
      <div style={{ padding: '12px 16px' }}>
        <Link href="/" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>← Feed</Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 14px', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', padding: '2px',
        }}>
          <img
            src={drop.brand.logo}
            alt={drop.brand.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#111', border: '2px solid #000' }}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${drop.brand.name}&background=111&color=3b82f6&size=36`; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{drop.brand.name}</div>
          <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 500, textTransform: 'capitalize' }}>{drop.category.replace('-', ' ')}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
          background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.12)',
        }}>
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#080808' }}>
        <img src={drop.imageUrl} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', bottom: '14px', right: '14px', fontSize: '13px', fontWeight: 700, color: '#fff',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', padding: '6px 14px', borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>{drop.price}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '4px' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : '#e0e0e0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button onClick={() => document.getElementById('comment-input')?.focus()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button onClick={() => { if (!requireLogin()) return; setNotified(!notified); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: notified ? '#3b82f6' : '#e0e0e0', transition: 'all 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={notified ? '#3b82f6' : 'none'} stroke={notified ? '#3b82f6' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        {drop.website && (
          <a href={drop.website} target="_blank" rel="noopener noreferrer" style={{ color: '#e0e0e0', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? '#3b82f6' : 'none'} stroke={saved ? '#3b82f6' : '#e0e0e0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      {/* Likes */}
      <div style={{ padding: '0 16px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
        {formatNumber(likeCount)} likes
      </div>

      {/* Title + description */}
      <div style={{ padding: '8px 16px 0' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{drop.title}</h1>
        <p style={{ fontSize: '14px', color: '#a3a3a3', lineHeight: 1.6 }}>{drop.description}</p>
      </div>

      {/* Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', margin: '8px 0', borderTop: '1px solid #161616', borderBottom: '1px solid #161616' }}>
        <span style={{ fontSize: '13px', color: '#525252' }}>Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 16px' }}>
        {[
          { label: 'Views', value: formatNumber(drop.engagement.views) },
          { label: 'Likes', value: formatNumber(likeCount) },
          { label: 'Comments', value: formatNumber(comments.length) },
          { label: 'Saves', value: formatNumber(drop.engagement.saves) },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div style={{ borderTop: '1px solid #161616', padding: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#fff' }}>Comments</div>
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            id="comment-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '50px', fontSize: '13px',
              background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#fff', outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }}
          />
          <button type="submit" disabled={posting || !newComment.trim()} style={{
            padding: '10px 20px', borderRadius: '50px',
            background: (posting || !newComment.trim()) ? '#1a1a1a' : '#3b82f6',
            color: '#fff', fontWeight: 600, fontSize: '13px', border: 'none',
            cursor: (posting || !newComment.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', flexShrink: 0,
          }}>{posting ? '...' : 'Post'}</button>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {comments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#525252', fontSize: '13px' }}>
              No comments yet. Be the first!
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: '#60a5fa', fontWeight: 700,
              }}>{c.user[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#fff', marginRight: '6px' }}>{c.user}</span>
                <span style={{ color: '#a3a3a3' }}>{c.text}</span>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#525252' }}>
                  {c.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
