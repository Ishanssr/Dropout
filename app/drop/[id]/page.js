'use client';

import { useState, use } from 'react';
import { getDropById, drops, formatNumber } from '../../../lib/drops';
import CountdownTimer from '../../../components/CountdownTimer';
import Link from 'next/link';

const sampleComments = [
  { id: 1, user: 'sneakerking99', text: 'This is going to sell out INSTANTLY 🔥', time: '2h', likes: 42 },
  { id: 2, user: 'technerd_', text: 'Day 1 cop for sure. Anyone know the release time?', time: '1h', likes: 28 },
  { id: 3, user: 'hypebeast420', text: 'Need this ASAP. Setting 5 alarms', time: '45m', likes: 15 },
  { id: 4, user: 'droppedout', text: 'My wallet is not ready for this one', time: '30m', likes: 67 },
  { id: 5, user: 'earlyadopter', text: 'Been waiting since the leak. Hype is real!', time: '20m', likes: 33 },
];

export default function DropDetailPage({ params }) {
  const resolvedParams = use(params);
  const drop = getDropById(resolvedParams.id);
  const [saved, setSaved] = useState(false);
  const [notified, setNotified] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(sampleComments);

  if (!drop) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <div style={{ fontWeight: 600, color: '#f5f5f5', marginBottom: '4px' }}>Drop not found</div>
        <Link href="/" className="btn-blue" style={{ display: 'inline-block', marginTop: '12px', textDecoration: 'none' }}>Back to Feed</Link>
      </div>
    );
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([{ id: Date.now(), user: 'you', text: newComment, time: 'now', likes: 0 }, ...comments]);
    setNewComment('');
  };

  const relatedDrops = drops.filter(d => d.category === drop.category && d.id !== drop.id).slice(0, 3);

  return (
    <div className="page-container">
      {/* Back link */}
      <div style={{ padding: '12px 16px' }}>
        <Link href="/" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>← Feed</Link>
      </div>

      {/* Post header */}
      <div className="post-header">
        <img src={drop.brand.logo} alt={drop.brand.name} className="post-avatar" onError={(e) => { e.target.style.display = 'none'; }} />
        <div style={{ flex: 1 }}>
          <div className="post-brand-name">{drop.brand.name}</div>
          <div className="post-category">{drop.category.replace('-', ' ')}</div>
        </div>
        <div className="hype-badge">🔥 {drop.hypeScore}</div>
      </div>

      {/* Large image */}
      <div className="post-image-container">
        <img src={drop.imageUrl} alt={drop.title} className="post-image" />
        <div className="price-tag">{drop.price}</div>
        {drop.featured && <div className="featured-tag">⚡ Featured</div>}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button className="post-action-btn active"><span className="icon">❤️</span></button>
        <button className="post-action-btn"><span className="icon">💬</span></button>
        <button onClick={() => setNotified(!notified)} className={`post-action-btn ${notified ? 'active' : ''}`}>
          <span className="icon">{notified ? '🔔' : '🔕'}</span>
        </button>
        <a href={drop.website} target="_blank" rel="noopener noreferrer" className="post-action-btn" style={{ textDecoration: 'none' }}>
          <span className="icon">🔗</span>
        </a>
        <div style={{ flex: 1 }} />
        <button onClick={() => setSaved(!saved)} className={`post-action-btn ${saved ? 'active' : ''}`}>
          <span className="icon">{saved ? '🔖' : '📑'}</span>
        </button>
      </div>

      {/* Likes */}
      <div className="post-body">
        <div className="post-likes">{formatNumber(drop.engagement.likes)} likes</div>
      </div>

      {/* Title + description */}
      <div style={{ padding: '0 16px 8px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f5f5f5', marginBottom: '6px' }}>{drop.title}</h1>
        <p style={{ fontSize: '14px', color: '#a3a3a3', lineHeight: 1.5 }}>{drop.description}</p>
      </div>

      {/* Countdown */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ fontSize: '13px', color: '#737373' }}>Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 16px', gap: '8px' }}>
        {[
          { label: 'Views', value: formatNumber(drop.engagement.views) },
          { label: 'Likes', value: formatNumber(drop.engagement.likes) },
          { label: 'Comments', value: formatNumber(drop.engagement.comments) },
          { label: 'Saves', value: formatNumber(drop.engagement.saves) },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3b82f6' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Comments</div>

        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            className="input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-blue" style={{ padding: '8px 16px' }}>Post</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#525252' }}>
                {c.user[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#f5f5f5', marginRight: '6px' }}>{c.user}</span>
                <span style={{ color: '#a3a3a3' }}>{c.text}</span>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#525252', display: 'flex', gap: '12px' }}>
                  <span>{c.time}</span>
                  <span>❤️ {c.likes}</span>
                  <span style={{ cursor: 'pointer' }}>Reply</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related drops */}
      {relatedDrops.length > 0 && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>More like this</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {relatedDrops.map((r) => (
              <Link key={r.id} href={`/drop/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                    <img src={r.imageUrl} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: '11px', color: '#737373' }}>{r.brand.name} · {r.price}</div>
                  </div>
                  <div className="hype-badge">🔥 {r.hypeScore}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
