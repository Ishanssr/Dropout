'use client';

import { useState } from 'react';
import { categories, drops, formatNumber } from '../../lib/drops';

export default function DashboardPage() {
  const [formData, setFormData] = useState({
    brandName: '',
    productName: '',
    category: 'sneakers',
    description: '',
    price: '',
    dropDate: '',
    dropTime: '',
    website: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Mock analytics
  const analyticsData = {
    totalViews: 245000,
    totalSaves: 18400,
    totalClicks: 8200,
    engagementRate: 7.5,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          <span className="text-[#e8eaed]">Brand</span>
          <span className="gradient-text"> Dashboard</span>
        </h1>
        <p className="text-[#6b7280] text-sm">
          Create drops, track analytics, and build hype for your brand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 animate-slide-up" 
          style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="glass-card p-4">
            <div className="text-xs text-[#6b7280] mb-1">Total Views</div>
            <div className="text-xl font-bold gradient-text">{formatNumber(analyticsData.totalViews)}</div>
            <div className="text-[10px] text-[#10b981] mt-1">↑ 12% this week</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#6b7280] mb-1">Total Saves</div>
            <div className="text-xl font-bold gradient-text">{formatNumber(analyticsData.totalSaves)}</div>
            <div className="text-[10px] text-[#10b981] mt-1">↑ 8% this week</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#6b7280] mb-1">Link Clicks</div>
            <div className="text-xl font-bold gradient-text">{formatNumber(analyticsData.totalClicks)}</div>
            <div className="text-[10px] text-[#f97316] mt-1">↓ 3% this week</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#6b7280] mb-1">Engagement Rate</div>
            <div className="text-xl font-bold gradient-text-hype">{analyticsData.engagementRate}%</div>
            <div className="text-[10px] text-[#10b981] mt-1">↑ 2% this week</div>
          </div>
        </div>

        {/* Create Drop Form */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-[#e8eaed] mb-4 flex items-center gap-2">
              <span>🚀</span> Create New Drop
            </h2>
            
            {submitted && (
              <div className="mb-4 p-3 rounded-lg text-sm text-[#10b981]" 
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                ✅ Drop created successfully! It will appear in the feed shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    placeholder="e.g. Nike, Apple, Supreme"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    placeholder="e.g. Air Max 2030"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g. $199"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your drop..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Drop Date</label>
                  <input
                    type="date"
                    value={formData.dropDate}
                    onChange={(e) => setFormData({...formData, dropDate: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Drop Time</label>
                  <input
                    type="time"
                    value={formData.dropTime}
                    onChange={(e) => setFormData({...formData, dropTime: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6b7280] mb-1.5 font-medium">Website Link</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://yourbrand.com/product"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0a0a1a] border border-[#1a1a3e] text-[#e8eaed] placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary">
                  🚀 Create Drop
                </button>
                <button type="button" className="btn-secondary">
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Drops sidebar */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-[#e8eaed] mb-4 flex items-center gap-2">
              <span>📋</span> Your Recent Drops
            </h3>
            <div className="space-y-3">
              {drops.slice(0, 5).map((drop) => (
                <div key={drop.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    {drop.brand.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e8eaed] truncate">{drop.title}</p>
                    <p className="text-[10px] text-[#6b7280]">{formatNumber(drop.engagement.views)} views</p>
                  </div>
                  <div className="text-xs font-bold text-[#60a5fa]">{drop.hypeScore}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Card */}
          <div className="glass-card p-5 mt-4">
            <h3 className="text-sm font-bold text-[#e8eaed] mb-3 flex items-center gap-2">
              <span>💎</span> Boost Your Drop
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <span className="text-[#9ca3af]">Featured Drop</span>
                <span className="font-bold text-[#60a5fa]">$200</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <span className="text-[#9ca3af]">Homepage Banner</span>
                <span className="font-bold text-[#60a5fa]">$1,000</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <span className="text-[#9ca3af]">Push Notification</span>
                <span className="font-bold text-[#60a5fa]">$500</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <span className="text-[#9ca3af]">Top Trending</span>
                <span className="font-bold text-[#60a5fa]">$800</span>
              </div>
            </div>
            <button className="btn-primary w-full mt-3 justify-center text-xs">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
