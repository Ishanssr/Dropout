'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export default function DashboardPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'sneakers', price: '',
    dropDate: '', dropTime: '', website: '', imageUrl: '', brandName: '',
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) { router.push('/login'); return; }
    setUser(u);
    setForm(f => ({ ...f, brandName: u.name }));
  }, [router]);

  // Handle image file selection → upload via backend to Cloudinary
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(file);
      setForm(f => ({ ...f, imageUrl: result.url }));
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Server error'}. Paste an image URL below instead.`);
      setUploading(false);
    }
  };

  // Submit drop to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.imageUrl) { setError('Please upload a product image'); return; }
    if (!form.title) { setError('Please enter a product title'); return; }
    if (!form.dropDate || !form.dropTime) { setError('Please set the drop date and time'); return; }

    setSubmitting(true);
    try {
      // First, find or create brand
      const brandRes = await fetch(`${API_URL}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.brandName || user.name,
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.brandName || user.name)}&background=111&color=3b82f6&size=64`,
          website: form.website || '',
        }),
      });

      if (!brandRes.ok) {
        const err = await brandRes.json();
        throw new Error(err.error || 'Failed to create brand');
      }

      const brand = await brandRes.json();

      // Parse date + time correctly
      const dropTime = new Date(`${form.dropDate}T${form.dropTime}:00`).toISOString();

      // Create the drop
      const dropRes = await fetch(`${API_URL}/api/drops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl,
          price: form.price ? `$${form.price.replace('$', '')}` : 'TBA',
          category: form.category,
          dropTime,
          website: form.website,
          brandId: brand.id,
        }),
      });

      if (!dropRes.ok) {
        const err = await dropRes.json();
        throw new Error(err.error || 'Failed to create drop');
      }

      setSuccess('🎉 Drop created! Redirecting to feed...');
      setForm({ title: '', description: '', category: 'sneakers', price: '', dropDate: '', dropTime: '', website: '', imageUrl: '', brandName: form.brandName });
      setImagePreview(null);
      setSubmitting(false);

      setTimeout(() => { setSuccess(''); router.push('/'); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create drop');
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#fff', outline: 'none',
    transition: 'border-color 0.2s ease', boxSizing: 'border-box',
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
          🚀 <span style={{ color: '#3b82f6' }}>Create</span> Drop
        </h1>
        <p style={{ fontSize: '13px', color: '#737373' }}>
          Launch a new product drop — it will appear in the feed for everyone
        </p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} style={{
        padding: '28px 24px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>

        {/* Image Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '8px', fontWeight: 600 }}>
            📷 Product Image *
          </label>
          <input type="file" ref={fileRef} accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: '16px',
              border: imagePreview ? 'none' : '2px dashed #262626',
              background: imagePreview ? 'transparent' : '#0a0a0a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', position: 'relative',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = '#3b82f6'; }}
            onMouseLeave={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = '#262626'; }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {uploading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#60a5fa', fontSize: '14px', fontWeight: 600,
                  }}>Uploading...</div>
                )}
                {!uploading && form.imageUrl && (
                  <div style={{
                    position: 'absolute', bottom: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    padding: '6px 12px', borderRadius: '20px', fontSize: '11px',
                    color: '#34d399', fontWeight: 600,
                  }}>✓ Uploaded</div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#525252' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Click to upload image</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>JPG, PNG, WebP · Max 10MB</div>
              </div>
            )}
          </div>
          {/* Image URL paste fallback */}
          <div style={{ marginTop: '8px' }}>
            <input style={{ ...inputStyle, fontSize: '12px' }}
              placeholder="Or paste image URL here (https://...)"
              value={form.imageUrl}
              onChange={(e) => {
                setForm({ ...form, imageUrl: e.target.value });
                if (e.target.value) setImagePreview(e.target.value);
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>🏢 Brand Name</label>
          <input style={inputStyle} placeholder="Your brand name" value={form.brandName}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
        </div>

        {/* Product Title */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>✨ Product Title *</label>
          <input style={inputStyle} placeholder="e.g. Air Max 2030 Limited Edition" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
        </div>

        {/* Description / Caption */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>📝 Caption / Description</label>
          <textarea style={{ ...inputStyle, resize: 'none', minHeight: '100px' }}
            placeholder="Describe your drop... This appears below the title in the feed."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
        </div>

        {/* Category + Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>📦 Category</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="sneakers">Sneakers</option>
              <option value="tech">Tech</option>
              <option value="streetwear">Streetwear</option>
              <option value="gaming">Gaming</option>
              <option value="ai-tools">AI Tools</option>
              <option value="creator-merch">Creator Merch</option>
              <option value="limited-edition">Limited Edition</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>💰 Price</label>
            <input style={inputStyle} placeholder="$199.99" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
          </div>
        </div>

        {/* Drop Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>📅 Drop Date *</label>
            <input type="date" style={inputStyle} value={form.dropDate} required
              onChange={(e) => setForm({ ...form, dropDate: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>⏰ Drop Time *</label>
            <input type="time" style={inputStyle} value={form.dropTime} required
              onChange={(e) => setForm({ ...form, dropTime: e.target.value })} />
          </div>
        </div>

        {/* The countdown timer will tick down to this date+time */}
        {form.dropDate && form.dropTime && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
            fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            🔔 The countdown timer on your post will tick down to <strong>{form.dropDate} at {form.dropTime}</strong>
          </div>
        )}

        {/* Website / Purchase Link */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#a3a3a3', marginBottom: '6px', fontWeight: 600 }}>🔗 Official Link (Shop Now)</label>
          <input type="url" style={inputStyle} placeholder="https://yourbrand.com/product"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1a1a1a'; }} />
          <div style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            This link will appear as the "Shop Now" button on your drop
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', fontSize: '13px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', fontSize: '13px',
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399',
          }}>✅ {success}</div>
        )}

        {/* Submit */}
        <button type="submit" disabled={submitting || uploading} style={{
          padding: '14px 28px', borderRadius: '50px', border: 'none',
          background: (submitting || uploading) ? '#1a1a1a' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff', fontSize: '15px', fontWeight: 700,
          cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease', width: '100%',
        }}
          onMouseEnter={(e) => { if (!submitting && !uploading) e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
        >
          {submitting ? '🚀 Creating Drop...' : uploading ? '📤 Uploading Image...' : '🚀 Launch Drop'}
        </button>
      </form>
    </div>
  );
}
