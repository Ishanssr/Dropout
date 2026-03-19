'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '../../lib/api';
import { getStoredToken, restoreStoredUserSession } from '../../lib/userStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export default function DashboardPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const hasStoredToken = !!getStoredToken();
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
    const localUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!localUser && hasStoredToken) {
      let cancelled = false;
      restoreStoredUserSession().then((restoredUser) => {
        if (cancelled) return;
        if (!restoredUser) {
          router.push('/login');
          return;
        }
        if (restoredUser.role !== 'brand') {
          router.push('/');
          return;
        }
        setUser(restoredUser);
        setForm((f) => ({ ...f, brandName: restoredUser.name }));
      });

      return () => {
        cancelled = true;
      };
    }

    if (!localUser) { router.push('/login'); return; }
    if (localUser.role !== 'brand') { router.push('/'); return; }
    setUser(localUser);
    setForm(f => ({ ...f, brandName: localUser.name }));
  }, [hasStoredToken, router]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.imageUrl) { setError('Please upload a product image'); return; }
    if (!form.title) { setError('Please enter a product title'); return; }
    if (!form.dropDate || !form.dropTime) { setError('Please set the drop date and time'); return; }

    setSubmitting(true);
    try {
      const brandRes = await fetch(`${API_URL}/api/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.brandName || user.name,
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.brandName || user.name)}&background=0a0a0f&color=3b82f6&size=64`,
          website: form.website || '',
        }),
      });

      if (!brandRes.ok) {
        const err = await brandRes.json();
        throw new Error(err.error || 'Failed to create brand');
      }

      const brand = await brandRes.json();

      const dropTime = new Date(`${form.dropDate}T${form.dropTime}:00`).toISOString();

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
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', outline: 'none',
    transition: 'all 0.25s ease', boxSizing: 'border-box', letterSpacing: '-0.01em',
  };

  if ((!user && hasStoredToken) || !user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>
          <span style={{ color: '#3b82f6' }}>Create</span> <span style={{ color: '#fff' }}>Drop</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
          Launch a new product drop — it will appear in the feed for everyone
        </p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} style={{
        padding: '28px 24px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: '20px',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>

        {/* Image Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Product Image *
          </label>
          <input type="file" ref={fileRef} accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)',
              border: imagePreview ? 'none' : '2px dashed rgba(255,255,255,0.08)',
              background: imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', position: 'relative',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
            onMouseLeave={(e) => { if (!imagePreview) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
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
                    background: 'rgba(5,5,8,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px',
                    color: '#34d399', fontWeight: 600,
                  }}>✓ Uploaded</div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.5 }}>◇</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Click to upload image</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>JPG, PNG, WebP · Max 10MB</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            <input style={{ ...inputStyle, fontSize: '12px' }}
              placeholder="Or paste image URL here (https://...)"
              value={form.imageUrl}
              onChange={(e) => {
                setForm({ ...form, imageUrl: e.target.value });
                if (e.target.value) setImagePreview(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Brand Name</label>
          <input style={inputStyle} placeholder="Your brand name" value={form.brandName}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
        </div>

        {/* Product Title */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product Title *</label>
          <input style={inputStyle} placeholder="e.g. Air Max 2030 Limited Edition" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caption / Description</label>
          <textarea style={{ ...inputStyle, resize: 'none', minHeight: '100px' }}
            placeholder="Describe your drop..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {/* Category + Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
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
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</label>
            <input style={inputStyle} placeholder="$199.99" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>

        {/* Drop Date + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drop Date *</label>
            <input type="date" style={inputStyle} value={form.dropDate} required
              onChange={(e) => setForm({ ...form, dropDate: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drop Time *</label>
            <input type="time" style={inputStyle} value={form.dropTime} required
              onChange={(e) => setForm({ ...form, dropTime: e.target.value })} />
          </div>
        </div>

        {form.dropDate && form.dropTime && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)',
            fontSize: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            🔔 Countdown will tick down to <strong>{form.dropDate} at {form.dropTime}</strong>
          </div>
        )}

        {/* Website */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Official Link (Shop Now)</label>
          <input type="url" style={inputStyle} placeholder="https://yourbrand.com/product"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            This link will appear as the &quot;Shop Now&quot; button on your drop
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', fontSize: '13px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', fontSize: '13px',
            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.1)', color: '#34d399',
          }}>✅ {success}</div>
        )}

        {/* Submit */}
        <button type="submit" disabled={submitting || uploading} style={{
          padding: '14px 28px', borderRadius: 'var(--radius-full)', border: 'none',
          background: (submitting || uploading) ? 'rgba(255,255,255,0.04)' : '#3b82f6',
          color: '#fff', fontSize: '14px', fontWeight: 600,
          cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease', width: '100%',
          fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
        }}
          onMouseEnter={(e) => { if (!submitting && !uploading) e.target.style.background = '#2563eb'; }}
          onMouseLeave={(e) => { if (!submitting && !uploading) e.target.style.background = '#3b82f6'; }}
        >
          {submitting ? 'Creating Drop...' : uploading ? 'Uploading Image...' : 'Launch Drop'}
        </button>
      </form>
    </div>
  );
}
