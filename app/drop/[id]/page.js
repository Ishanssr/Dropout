'use client';

import { useState, use } from 'react';
import { getDropById, drops, formatNumber } from '../../../lib/drops';
import CountdownTimer from '../../../components/CountdownTimer';
import HypeScore from '../../../components/HypeScore';
import Link from 'next/link';

// Sample comments
const sampleComments = [
  { id: 1, user: 'SneakerKing99', avatar: '😎', text: 'This is going to sell out INSTANTLY 🔥', time: '2h ago', likes: 42 },
  { id: 2, user: 'TechNerd_', avatar: '🤓', text: 'Day 1 cop for sure. Anyone know the release time?', time: '1h ago', likes: 28 },
  { id: 3, user: 'HypeBeast420', avatar: '🔥', text: 'Need this ASAP. Setting 5 alarms lol', time: '45m ago', likes: 15 },
  { id: 4, user: 'DroppedOut', avatar: '💀', text: 'My wallet is not ready for this L', time: '30m ago', likes: 67 },
  { id: 5, user: 'EarlyAdopter', avatar: '🚀', text: 'Been waiting for this since the leak. Hype is real!', time: '20m ago', likes: 33 },
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold text-[#e8eaed] mb-2">Drop not found</h2>
        <p className="text-[#6b7280] text-sm mb-4">This drop may have been removed or doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary text-sm">Back to Feed</Link>
      </div>
    );
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      { id: Date.now(), user: 'You', avatar: '👤', text: newComment, time: 'Just now', likes: 0 },
      ...comments,
    ]);
    setNewComment('');
  };

  // Get related drops (same category, excluding current)
  const relatedDrops = drops.filter(d => d.category === drop.category && d.id !== drop.id).slice(0, 3);

  const categoryColors = {
    sneakers: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
    tech: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
    streetwear: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee' },
    gaming: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
    'ai-tools': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' },
    'creator-merch': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
    limited: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
  };

  const cat = categoryColors[drop.category] || categoryColors.tech;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-6 animate-fade-in">
        <Link href="/" className="hover:text-[#60a5fa] transition-colors">Feed</Link>
        <span>›</span>
        <Link href="/categories" className="hover:text-[#60a5fa] transition-colors">
          {drop.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </Link>
        <span>›</span>
        <span className="text-[#9ca3af]">{drop.title}</span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Drop Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image */}
          <div
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="relative w-full h-64 sm:h-80 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${cat.bg}, rgba(10, 10, 26, 0.8))` }}
            >
              <span className="text-8xl opacity-30">{drop.brand.logo}</span>
              {drop.featured && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
                  ⚡ Featured
                </div>
              )}
            </div>
          </div>

          {/* Title + Info */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{drop.brand.logo}</span>
              <span className="text-sm font-medium text-[#9ca3af]">{drop.brand.name}</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: cat.bg, color: cat.text }}
              >
                {drop.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e8eaed] mb-3">{drop.title}</h1>
            <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">{drop.description}</p>

            {/* Price + Countdown */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="text-2xl font-bold gradient-text">{drop.price}</div>
              <div className="flex-1" />
              <CountdownTimer dropTime={drop.dropTime} />
            </div>

            {/* Hype Score */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <div className="flex items-center gap-3">
                <HypeScore score={drop.hypeScore} />
                <span className="text-xs text-[#6b7280]">Community Hype Score</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                <span>❤️ {formatNumber(drop.engagement.likes)}</span>
                <span>💬 {formatNumber(drop.engagement.comments)}</span>
                <span>🔖 {formatNumber(drop.engagement.saves)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => setSaved(!saved)}
                className={`btn-secondary ${saved ? 'border-[#3b82f6] text-[#60a5fa]' : ''}`}
              >
                {saved ? '🔖 Saved' : '📄 Save Drop'}
              </button>
              <button
                onClick={() => setNotified(!notified)}
                className={`btn-secondary ${notified ? 'border-[#fbbf24] text-[#fbbf24]' : ''}`}
              >
                {notified ? '🔔 Notified' : '🔕 Notify Me'}
              </button>
              <a href={drop.website} target="_blank" rel="noopener noreferrer" className="btn-primary">
                🔗 Visit Drop
              </a>
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 className="text-base font-bold text-[#e8eaed] mb-4 flex items-center gap-2">
              <span>💬</span> Comments
              <span className="text-xs font-normal text-[#6b7280]">({comments.length})</span>
            </h2>

            {/* Add comment */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
              <button type="submit" className="btn-primary py-2.5">Post</button>
            </form>

            {/* Comments list */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#111128] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    {comment.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#e8eaed]">{comment.user}</span>
                      <span className="text-[10px] text-[#6b7280]">{comment.time}</span>
                    </div>
                    <p className="text-sm text-[#9ca3af]">{comment.text}</p>
                  </div>
                  <button className="text-xs text-[#6b7280] hover:text-[#e8eaed] transition-colors flex items-center gap-1 shrink-0">
                    ❤️ {comment.likes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Engagement stats */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <h3 className="text-sm font-bold text-[#e8eaed] mb-3">📊 Engagement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6b7280]">Views</span>
                <span className="text-sm font-bold text-[#e8eaed]">{formatNumber(drop.engagement.views)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1a1a3e]">
                <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: '85%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6b7280]">Saves</span>
                <span className="text-sm font-bold text-[#e8eaed]">{formatNumber(drop.engagement.saves)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1a1a3e]">
                <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6b7280]">Comments</span>
                <span className="text-sm font-bold text-[#e8eaed]">{formatNumber(drop.engagement.comments)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1a1a3e]">
                <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: '45%' }} />
              </div>
            </div>
          </div>

          {/* Related Drops */}
          {relatedDrops.length > 0 && (
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-sm font-bold text-[#e8eaed] mb-3">🔗 Related Drops</h3>
              <div className="space-y-3">
                {relatedDrops.map((related) => (
                  <Link key={related.id} href={`/drop/${related.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                      >
                        <span>{related.brand.logo}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#e8eaed] truncate">{related.title}</p>
                        <p className="text-[10px] text-[#6b7280]">{related.brand.name} · {related.price}</p>
                      </div>
                      <HypeScore score={related.hypeScore} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <h3 className="text-sm font-bold text-[#e8eaed] mb-3">📤 Share This Drop</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary text-xs justify-center py-2">🐦 Twitter</button>
              <button className="btn-secondary text-xs justify-center py-2">📱 WhatsApp</button>
              <button className="btn-secondary text-xs justify-center py-2">📋 Copy Link</button>
              <button className="btn-secondary text-xs justify-center py-2">📸 Instagram</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
