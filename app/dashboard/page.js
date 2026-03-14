'use client';

import { useState } from 'react';
import { categories, drops, formatNumber } from '../../lib/drops';

export default function DashboardPage() {
  const [form, setForm] = useState({ brandName: '', productName: '', category: 'sneakers', description: '', price: '', dropDate: '', dropTime: '', website: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const stats = [
    { label: 'Views', value: '245K', change: '+12%' },
    { label: 'Saves', value: '18.4K', change: '+8%' },
    { label: 'Clicks', value: '8.2K', change: '-3%' },
    { label: 'Engagement', value: '7.5%', change: '+2%' },
  ];

  return (
    <div className="max-w-[935px] mx-auto px-4 py-4">
      <h1 className="text-[22px] font-extrabold mb-1">
        Brand <span className="text-blue-500">Dashboard</span>
      </h1>
      <p className="text-[13px] text-[#737373] mb-5">Create drops and track performance</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] text-center">
            <div className="text-xs text-[#737373] mb-1">{s.label}</div>
            <div className="text-xl font-bold text-blue-500">{s.value}</div>
            <div className={`text-[11px] mt-0.5 ${s.change.startsWith('+') ? 'text-blue-400' : 'text-[#525252]'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Form */}
        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
          <h2 className="text-base font-bold mb-4">🚀 Create New Drop</h2>

          {submitted && (
            <div className="p-3 rounded-lg text-[13px] text-blue-500 bg-blue-500/10 border border-blue-500/20 mb-4">
              ✅ Drop created successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#737373] mb-1">Brand Name</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Nike" value={form.brandName} onChange={(e) => setForm({...form, brandName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-[#737373] mb-1">Product Name</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Air Max 2030" value={form.productName} onChange={(e) => setForm({...form, productName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#737373] mb-1">Category</label>
                <select className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                  {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#737373] mb-1">Price</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" placeholder="$199" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-1">Description</label>
              <textarea className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Describe your drop..." rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#737373] mb-1">Drop Date</label>
                <input type="date" className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" value={form.dropDate} onChange={(e) => setForm({...form, dropDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs text-[#737373] mb-1">Drop Time</label>
                <input type="time" className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" value={form.dropTime} onChange={(e) => setForm({...form, dropTime: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-1">Website</label>
              <input type="url" className="w-full px-3 py-2.5 rounded-lg text-sm bg-black border border-[#262626] text-white outline-none focus:border-blue-500 transition-colors" placeholder="https://yourbrand.com" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-sm border-none cursor-pointer hover:bg-blue-600 transition-colors">🚀 Create Drop</button>
              <button type="button" className="px-5 py-2.5 rounded-lg bg-transparent text-white font-medium text-sm border border-[#262626] cursor-pointer hover:border-blue-500 transition-colors">Save Draft</button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
            <h3 className="text-sm font-bold mb-3">📋 Recent Drops</h3>
            <div className="flex flex-col gap-1.5">
              {drops.slice(0, 5).map((drop) => (
                <div key={drop.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#111] transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-[#111]">
                    <img src={drop.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{drop.title}</div>
                    <div className="text-[11px] text-[#525252]">{formatNumber(drop.engagement.views)} views</div>
                  </div>
                  <span className="text-xs font-bold text-blue-500">{drop.hypeScore}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]">
            <h3 className="text-sm font-bold mb-3">💎 Boost Your Drop</h3>
            {[['Featured Drop', '$200'], ['Homepage Banner', '$1,000'], ['Push Notification', '$500'], ['Top Trending', '$800']].map(([name, price]) => (
              <div key={name} className="flex justify-between py-2 border-b border-[#1a1a1a] text-[13px]">
                <span className="text-[#a3a3a3]">{name}</span>
                <span className="font-semibold text-blue-500">{price}</span>
              </div>
            ))}
            <button className="w-full mt-3 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-sm border-none cursor-pointer hover:bg-blue-600 transition-colors">Contact Sales</button>
          </div>
        </div>
      </div>
    </div>
  );
}
