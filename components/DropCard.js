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
    <div className="post-card">
      {/* Header — brand avatar + name (like Instagram) */}
      <div className="post-header">
        <img
          src={drop.brand.logo}
          alt={drop.brand.name}
          className="post-avatar"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={{ flex: 1 }}>
          <div className="post-brand-name">{drop.brand.name}</div>
          <div className="post-category">{drop.category.replace('-', ' ')}</div>
        </div>
        <div className="hype-badge">
          🔥 {drop.hypeScore}
        </div>
      </div>

      {/* Image — full width, square aspect ratio (like Instagram) */}
      <Link href={`/drop/${drop.id}`}>
        <div className="post-image-container">
          <img
            src={drop.imageUrl}
            alt={drop.title}
            className="post-image"
          />
          <div className="price-tag">{drop.price}</div>
          {drop.featured && <div className="featured-tag">⚡ Featured</div>}
        </div>
      </Link>

      {/* Action buttons row */}
      <div className="post-actions">
        <button
          onClick={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
          className={`post-action-btn ${liked ? 'active' : ''}`}
        >
          <span className="icon">{liked ? '❤️' : '🤍'}</span>
        </button>
        <button className="post-action-btn">
          <Link href={`/drop/${drop.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span className="icon">💬</span>
          </Link>
        </button>
        <button
          onClick={() => setNotified(!notified)}
          className={`post-action-btn ${notified ? 'active' : ''}`}
        >
          <span className="icon">{notified ? '🔔' : '🔕'}</span>
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setSaved(!saved)}
          className={`post-action-btn ${saved ? 'active' : ''}`}
        >
          <span className="icon">{saved ? '🔖' : '📑'}</span>
        </button>
      </div>

      {/* Likes count */}
      <div className="post-body">
        <div className="post-likes">{formatNumber(likes)} likes</div>
        <div className="post-caption">
          <strong>{drop.brand.name}</strong> {drop.title} — {drop.description}
        </div>
      </div>

      {/* Countdown */}
      <div className="post-countdown">
        <span style={{ fontSize: '13px', color: '#737373' }}>Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* Comments link */}
      <Link href={`/drop/${drop.id}`}>
        <div className="post-comments-link">
          View all {formatNumber(drop.engagement.comments)} comments
        </div>
      </Link>
    </div>
  );
}
