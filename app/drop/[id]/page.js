'use client';

import { useState, use } from 'react';
import { getDropById, drops, formatNumber } from '../../../lib/drops';
import CountdownTimer from '../../../components/CountdownTimer';
import Link from 'next/link';

const sampleComments = [
  { id: 1, user: 'sneakerking99', text: 'This is going to sell out INSTANTLY 🔥', time: '2h', likes: 42 },
  { id: 2, user: 'technerd_', text: 'Day 1 cop for sure. Anyone know the release time?', time: '1h', likes: 28 },
  { id: 3, user: 'hypebeast420', text: 'Need this ASAP. Setting 5 alarms', time: '45m', likes: 15 },
  { id: 4, user: 'droppedout', text: 'My wallet is NOT ready', time: '30m', likes: 67 },
  { id: 5, user: 'earlyadopter', text: 'Been waiting since the leak!', time: '20m', likes: 33 },
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
      <div className="text-center py-20 max-w-[470px] mx-auto">
        <div className="text-4xl mb-3">🔍</div>
        <div className="font-semibold text-white mb-1">Drop not found</div>
        <Link href="/" className="inline-block mt-3 px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm no-underline">Back to Feed</Link>
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
    <div className="max-w-[470px] mx-auto">
      {/* Back */}
      <div className="px-4 py-3">
        <Link href="/" className="no-underline text-blue-500 text-[13px]">← Feed</Link>
      </div>

      {/* Header */}
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

      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#0a0a0a]">
        <img src={drop.imageUrl} alt={drop.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-black/70 backdrop-blur-md border border-blue-500/20">
          {drop.price}
        </div>
        {drop.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-500 bg-black/70 backdrop-blur-md border border-blue-500/20 uppercase tracking-wide">
            ⚡ Featured
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center px-3 py-2 gap-1">
        <button className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl">❤️</button>
        <button className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl">💬</button>
        <button onClick={() => setNotified(!notified)} className={`bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl ${notified ? 'text-blue-500' : 'text-white'}`}>
          {notified ? '🔔' : '🔕'}
        </button>
        <a href={drop.website} target="_blank" rel="noopener noreferrer" className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl no-underline">🔗</a>
        <div className="flex-1" />
        <button onClick={() => setSaved(!saved)} className={`bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-[#111] transition-colors text-xl ${saved ? 'text-blue-500' : 'text-white'}`}>
          {saved ? '🔖' : '📑'}
        </button>
      </div>

      {/* Likes */}
      <div className="px-4 text-sm font-semibold text-white">{formatNumber(drop.engagement.likes)} likes</div>

      {/* Title + description */}
      <div className="px-4 pt-2">
        <h1 className="text-lg font-bold text-white mb-1.5">{drop.title}</h1>
        <p className="text-sm text-[#a3a3a3] leading-relaxed">{drop.description}</p>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 px-4 py-3 mt-2 border-y border-[#1a1a1a]">
        <span className="text-[13px] text-[#525252]">Drops in</span>
        <CountdownTimer dropTime={drop.dropTime} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 py-3 px-4">
        {[
          { label: 'Views', value: formatNumber(drop.engagement.views) },
          { label: 'Likes', value: formatNumber(drop.engagement.likes) },
          { label: 'Comments', value: formatNumber(drop.engagement.comments) },
          { label: 'Saves', value: formatNumber(drop.engagement.saves) },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-base font-bold text-blue-500">{s.value}</div>
            <div className="text-[10px] text-[#525252] uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="border-t border-[#1a1a1a] px-4 py-4">
        <div className="text-sm font-bold mb-3">Comments</div>

        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
          <input className="flex-1 px-3 py-2.5 rounded-lg text-sm bg-[#0a0a0a] border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors placeholder-[#525252]" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-sm border-none cursor-pointer hover:bg-blue-600 transition-colors">Post</button>
        </form>

        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-[#111] shrink-0 flex items-center justify-center text-xs text-[#525252] font-bold">
                {c.user[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-white mr-1.5">{c.user}</span>
                <span className="text-[#a3a3a3]">{c.text}</span>
                <div className="mt-1 text-xs text-[#525252] flex gap-3">
                  <span>{c.time}</span>
                  <span>❤️ {c.likes}</span>
                  <span className="cursor-pointer">Reply</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {relatedDrops.length > 0 && (
        <div className="border-t border-[#1a1a1a] px-4 py-4">
          <div className="text-sm font-bold mb-3">More like this</div>
          <div className="flex flex-col gap-1.5">
            {relatedDrops.map((r) => (
              <Link key={r.id} href={`/drop/${r.id}`} className="no-underline text-inherit">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#262626] transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#111]">
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{r.title}</div>
                    <div className="text-[11px] text-[#737373]">{r.brand.name} · {r.price}</div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    🔥 {r.hypeScore}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
