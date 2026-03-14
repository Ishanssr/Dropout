'use client';

import { useState } from 'react';
import { categories, drops, formatNumber } from '../../lib/drops';

export default function DashboardPage() {
  const [formData, setFormData] = useState({ brandName: '', productName: '', category: 'sneakers', description: '', price: '', dropDate: '', dropTime: '', website: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="page-wide" style={{ paddingTop: '16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        Brand <span className="text-gradient">Dashboard</span>
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '20px' }}>Create drops and track performance</p>

      {/* Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {[
          { label: 'Views', value: '245K', change: '+12%' },
          { label: 'Saves', value: '18.4K', change: '+8%' },
          { label: 'Clicks', value: '8.2K', change: '-3%' },
          { label: 'Engagement', value: '7.5%', change: '+2%' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#737373', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: stat.change.startsWith('+') ? '#3b82f6' : '#525252', marginTop: '2px' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🚀 Create New Drop</h2>

          {submitted && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '16px' }}>
              ✅ Drop created successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Brand Name</label>
                <input className="input" placeholder="e.g. Nike" value={formData.brandName} onChange={(e) => setFormData({...formData, brandName: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Product Name</label>
                <input className="input" placeholder="e.g. Air Max 2030" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Category</label>
                <select className="input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Price</label>
                <input className="input" placeholder="$199" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea className="input" placeholder="Describe your drop..." rows={3} style={{ resize: 'none' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Drop Date</label>
                <input className="input" type="date" value={formData.dropDate} onChange={(e) => setFormData({...formData, dropDate: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Drop Time</label>
                <input className="input" type="time" value={formData.dropTime} onChange={(e) => setFormData({...formData, dropTime: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', display: 'block', marginBottom: '4px' }}>Website</label>
              <input className="input" type="url" placeholder="https://yourbrand.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button type="submit" className="btn-blue">🚀 Create Drop</button>
              <button type="button" className="btn-outline">Save Draft</button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>📋 Recent Drops</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {drops.slice(0, 5).map((drop) => (
                <div key={drop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                    <img src={drop.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{drop.title}</div>
                    <div style={{ fontSize: '11px', color: '#525252' }}>{formatNumber(drop.engagement.views)} views</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>{drop.hypeScore}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>💎 Boost Your Drop</h3>
            {[
              ['Featured Drop', '$200'],
              ['Homepage Banner', '$1,000'],
              ['Push Notification', '$500'],
              ['Top Trending', '$800'],
            ].map(([name, price]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: '13px' }}>
                <span style={{ color: '#a3a3a3' }}>{name}</span>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>{price}</span>
              </div>
            ))}
            <button className="btn-blue" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>Contact Sales</button>
          </div>
        </div>
      </div>
    </div>
  );
}
