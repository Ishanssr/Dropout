'use client';

import { useState } from 'react';
import { categories } from '../../lib/drops';

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

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#fff', outline: 'none',
    transition: 'border-color 0.2s ease', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
        Brand <span style={{ color: '#3b82f6' }}>Dashboard</span>
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '24px' }}>Create drops and track performance</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '28px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            padding: '18px 16px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
            textAlign: 'center', transition: 'all 0.25s ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '11px', color: '#737373', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>{s.value}</div>
            <div style={{ fontSize: '11px', marginTop: '2px', color: s.change.startsWith('+') ? '#60a5fa' : '#525252' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ padding: '28px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>🚀 Create New Drop</h2>

        {submitted && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#60a5fa',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', marginBottom: '16px',
          }}>✅ Drop created successfully!</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Brand Name</label>
              <input style={inputStyle} placeholder="e.g. Nike" value={form.brandName} onChange={(e) => setForm({...form, brandName: e.target.value})}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }} onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Product Name</label>
              <input style={inputStyle} placeholder="e.g. Air Max 2030" value={form.productName} onChange={(e) => setForm({...form, productName: e.target.value})}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }} onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Category</label>
              <select style={{ ...inputStyle, appearance: 'none' }} value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Price</label>
              <input style={inputStyle} placeholder="$199" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }} onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'none', minHeight: '80px' }} placeholder="Describe your drop..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }} onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Drop Date</label>
              <input type="date" style={inputStyle} value={form.dropDate} onChange={(e) => setForm({...form, dropDate: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Drop Time</label>
              <input type="time" style={inputStyle} value={form.dropTime} onChange={(e) => setForm({...form, dropTime: e.target.value})} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#737373', marginBottom: '6px' }}>Website</label>
            <input type="url" style={inputStyle} placeholder="https://yourbrand.com" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }} onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
            <button type="submit" style={{
              padding: '12px 28px', borderRadius: '50px', background: '#3b82f6', color: '#fff',
              fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.target.style.background = '#2563eb'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.target.style.background = '#3b82f6'; e.target.style.transform = 'translateY(0)'; }}
            >🚀 Create Drop</button>
            <button type="button" style={{
              padding: '12px 28px', borderRadius: '50px', background: 'transparent', color: '#a3a3a3',
              fontWeight: 600, fontSize: '14px', border: '1px solid #1a1a1a', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(59,130,246,0.3)'; e.target.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = '#1a1a1a'; e.target.style.color = '#a3a3a3'; }}
            >Save Draft</button>
          </div>
        </form>
      </div>
    </div>
  );
}
