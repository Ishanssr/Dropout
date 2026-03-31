'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage, fetchBrands, fetchBrandAnalytics, formatNumber, deleteDrop } from '../../lib/api';
import { getStoredToken, restoreStoredUserSession } from '../../lib/userStorage';
import { categories as allCategories } from '../../lib/drops';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

// Category-aware form config
const categoryConfig = {
  'tech-gadgets':        { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$999',        titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. iPhone 17 Pro',            descPlaceholder: 'Describe the product, specs, features...',       linkLabel: 'Shop / Pre-order Link',  linkPlaceholder: 'https://brand.com/product',     dateLabel: 'Launch Date',  dropNoun: 'launch' },
  'ai-software':         { showPrice: 'opt', priceLabel: 'Pricing (optional)', pricePlaceholder: 'Free / $20/mo', titleLabel: 'Product / Feature *', titlePlaceholder: 'e.g. GPT-5 Pro',                descPlaceholder: 'What\'s new? Key features, capabilities...',     linkLabel: 'Try It / Website',       linkPlaceholder: 'https://product.com',            dateLabel: 'Launch Date',  dropNoun: 'launch' },
  'movies-ott':          { showPrice: false, priceLabel: '',                 pricePlaceholder: '',             titleLabel: 'Title *',           titlePlaceholder: 'e.g. Spiderman: Brand New Day',  descPlaceholder: 'Plot, cast, where to watch...',                  linkLabel: 'Trailer / Streaming Link', linkPlaceholder: 'https://youtube.com/watch?v=...', dateLabel: 'Release Date', dropNoun: 'release' },
  'gaming':              { showPrice: 'opt', priceLabel: 'Price (optional)',  pricePlaceholder: 'Free / $59.99', titleLabel: 'Game / Update *',    titlePlaceholder: 'e.g. Fortnite x Dragon Ball Z',  descPlaceholder: 'Gameplay details, platforms, features...',       linkLabel: 'Store / Download Link',  linkPlaceholder: 'https://store.steampowered.com', dateLabel: 'Release Date', dropNoun: 'release' },
  'music-entertainment': { showPrice: false, priceLabel: '',                 pricePlaceholder: '',             titleLabel: 'Title *',           titlePlaceholder: 'e.g. Album: Midnight Sessions',  descPlaceholder: 'Artist, tracklist, streaming platforms...',      linkLabel: 'Listen / Tickets Link',  linkPlaceholder: 'https://spotify.com/album/...',  dateLabel: 'Release Date', dropNoun: 'release' },
  'fashion-streetwear':  { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$48 - $298',   titleLabel: 'Product / Collection *', titlePlaceholder: 'e.g. Summer 2026 Collection',  descPlaceholder: 'Materials, sizing, collab details...',           linkLabel: 'Shop Link',              linkPlaceholder: 'https://brand.com/collection',   dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'beauty-skincare':     { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$35',          titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. Glow Serum Limited Edition', descPlaceholder: 'Ingredients, benefits, skin type...',            linkLabel: 'Shop Link',              linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'automobiles':         { showPrice: true,  priceLabel: 'Starting Price',   pricePlaceholder: '$45,000',      titleLabel: 'Model Name *',      titlePlaceholder: 'e.g. Model S Plaid+',            descPlaceholder: 'Specs, performance, range, features...',         linkLabel: 'Pre-order / Details Link', linkPlaceholder: 'https://brand.com/model',       dateLabel: 'Reveal Date',  dropNoun: 'reveal' },
  'mobility-ev':         { showPrice: true,  priceLabel: 'Starting Price',   pricePlaceholder: '$35,000',      titleLabel: 'Vehicle / Product *', titlePlaceholder: 'e.g. Urban EV Scooter',          descPlaceholder: 'Range, speed, charging, features...',            linkLabel: 'Pre-order Link',         linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Launch Date',  dropNoun: 'launch' },
  'food-beverages':      { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$4.99',        titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. KSI x Prime Energy',        descPlaceholder: 'Flavor, ingredients, availability...',           linkLabel: 'Shop / Order Link',      linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'lifestyle-home':      { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$129',         titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. Smart Lamp Pro',             descPlaceholder: 'Features, materials, dimensions...',             linkLabel: 'Shop Link',              linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'startups-products':   { showPrice: false, priceLabel: '',                 pricePlaceholder: '',             titleLabel: 'Announcement Title *', titlePlaceholder: 'e.g. Series A — $10M Raised',  descPlaceholder: 'What\'s launching? Key details, mission...',     linkLabel: 'Website / Signup Link',  linkPlaceholder: 'https://startup.com',            dateLabel: 'Launch Date',  dropNoun: 'launch' },
  'creator-tools-audio': { showPrice: 'opt', priceLabel: 'Price (optional)', pricePlaceholder: '$149 / Free',   titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. Studio Mic Pro X',           descPlaceholder: 'Specs, compatibility, what\'s included...',      linkLabel: 'Shop / Download Link',   linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'collectibles-culture':{ showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$50 - $500',   titleLabel: 'Item / Collection *', titlePlaceholder: 'e.g. Vintage Poster Series',    descPlaceholder: 'Edition size, materials, artist...',             linkLabel: 'Shop Link',              linkPlaceholder: 'https://brand.com/collection',   dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'sports-equipment':    { showPrice: true,  priceLabel: 'Price',            pricePlaceholder: '$199',         titleLabel: 'Product Name *',    titlePlaceholder: 'e.g. Pro Carbon Tennis Racket',   descPlaceholder: 'Specs, materials, athlete endorsement...',       linkLabel: 'Shop Link',              linkPlaceholder: 'https://brand.com/product',      dateLabel: 'Drop Date',    dropNoun: 'drop' },
  'travel-experiences':  { showPrice: 'opt', priceLabel: 'Price (optional)', pricePlaceholder: '$299/person',   titleLabel: 'Experience Title *', titlePlaceholder: 'e.g. Bali Creator Retreat 2026', descPlaceholder: 'Itinerary, dates, what\'s included...',           linkLabel: 'Book / Details Link',    linkPlaceholder: 'https://brand.com/experience',   dateLabel: 'Date',         dropNoun: 'experience' },
};

const defaultConfig = { showPrice: true, priceLabel: 'Price', pricePlaceholder: '$99', titleLabel: 'Title *', titlePlaceholder: 'e.g. Product Name', descPlaceholder: 'Describe your drop...', linkLabel: 'Official Link', linkPlaceholder: 'https://...', dateLabel: 'Drop Date', dropNoun: 'drop' };

function getCategoryConfig(categoryId) {
  return categoryConfig[categoryId] || defaultConfig;
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export default function DashboardPage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const hasStoredToken = !!getStoredToken();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'analytics'
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [launchNow, setLaunchNow] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);  // { url, preview }
  const [extraUploading, setExtraUploading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [brandId, setBrandId] = useState(null);
  const [deletingDropId, setDeletingDropId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'tech-gadgets', price: '',
    dropDate: '', dropTime: '', website: '', imageUrl: '', brandName: '',
    accessType: 'open', maxQuantity: '',
  });

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!localUser && hasStoredToken) {
      let cancelled = false;
      restoreStoredUserSession().then((restoredUser) => {
        if (cancelled) return;
        if (!restoredUser) { router.push('/login'); return; }
        if (restoredUser.role !== 'brand') { router.push('/'); return; }
        setUser(restoredUser);
        setForm((f) => ({ ...f, brandName: restoredUser.name }));
      });
      return () => { cancelled = true; };
    }

    if (!localUser) { router.push('/login'); return; }
    if (localUser.role !== 'brand') { router.push('/'); return; }
    setUser(localUser);
    setForm(f => ({ ...f, brandName: localUser.name }));
  }, [hasStoredToken, router]);

  // Load analytics when tab switches
  useEffect(() => {
    if (activeTab !== 'analytics' || !user) return;
    loadAnalytics();
  }, [activeTab, user]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // First find or discover brandId
      const brands = await fetchBrands();
      const myBrand = brands.find(b => b.name === (form.brandName || user?.name));
      if (myBrand) {
        setBrandId(myBrand.id);
        const data = await fetchBrandAnalytics(myBrand.id);
        setAnalytics(data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setAnalytics(null);
    }
    setAnalyticsLoading(false);
  };

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
    } catch (err) {
      setError(`Upload failed: ${err.message || 'Server error'}. Paste an image URL below instead.`);
    }
    setUploading(false);
  };

  const handleExtraImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || extraImages.length >= 4) return;
    const reader = new FileReader();
    const localPreview = await new Promise(r => { reader.onload = (ev) => r(ev.target.result); reader.readAsDataURL(file); });
    setExtraUploading(true);
    setError('');
    try {
      const result = await uploadImage(file);
      setExtraImages(prev => [...prev, { url: result.url, preview: localPreview }]);
    } catch (err) {
      setError(`Extra image upload failed: ${err.message}`);
    }
    setExtraUploading(false);
  };

  const removeExtraImage = (idx) => {
    setExtraImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.imageUrl) { setError('Please upload a product image'); return; }
    if (!form.title) { setError('Please enter a product title'); return; }
    if (!launchNow && (!form.dropDate || !form.dropTime)) { setError('Please set the drop date and time'); return; }

    setSubmitting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const brandRes = await fetch(`${API_URL}/api/brands`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.brandName || user.name,
          logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.brandName || user.name)}&background=0a0a0f&color=3b82f6&size=64`,
          website: form.website || '',
        }),
        signal: controller.signal,
      });
      if (!brandRes.ok) {
        const err = await brandRes.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${brandRes.status}`);
      }
      const brand = await brandRes.json();

      const dropTime = launchNow
        ? new Date(Date.now() - 60000).toISOString()
        : new Date(`${form.dropDate}T${form.dropTime}:00`).toISOString();
      // Build imageUrls array: primary + extras
      const allImageUrls = [form.imageUrl, ...extraImages.map(ei => ei.url)].filter(Boolean);

      const dropRes = await fetch(`${API_URL}/api/drops`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl,
          imageUrls: allImageUrls,
          price: getCategoryConfig(form.category).showPrice === false ? '' : (form.price ? `$${form.price.replace('$', '')}` : 'TBA'),
          category: form.category,
          dropTime,
          website: form.website,
          brandId: brand.id,
          accessType: form.accessType,
          maxQuantity: form.maxQuantity || null,
        }),
        signal: controller.signal,
      });
      if (!dropRes.ok) {
        const err = await dropRes.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${dropRes.status}`);
      }

      setSuccess(launchNow ? '🎉 Drop is LIVE! Redirecting to feed...' : '🎉 Drop created! Redirecting to feed...');
      setForm({ title: '', description: '', category: 'tech-gadgets', price: '', dropDate: '', dropTime: '', website: '', imageUrl: '', brandName: form.brandName, accessType: 'open', maxQuantity: '' });
      setLaunchNow(false);
      setImagePreview(null);
      setExtraImages([]);
      setSubmitting(false);
      setTimeout(() => { setSuccess(''); router.push('/'); }, 1500);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out — the server may be starting up. Please try again in a minute.');
      } else {
        setError(err.message || 'Failed to create drop');
      }
      setSubmitting(false);
    } finally {
      clearTimeout(timeout);
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>
          <span style={{ color: '#3b82f6' }}>Brand</span> <span style={{ color: '#fff' }}>Dashboard</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
          Create drops and track performance
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-full)', padding: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
        {[
          { id: 'create', label: '✦ Create Drop' },
          { id: 'analytics', label: '📊 Analytics' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-full)', border: 'none',
              background: activeTab === tab.id ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: activeTab === tab.id ? '#60a5fa' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease',
              fontFamily: "'Sora', sans-serif",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ===== CREATE TAB ===== */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} style={{
          padding: '28px 24px', borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: '20px',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}>
          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product Image *</label>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            <div onClick={() => fileRef.current?.click()} style={{
              width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)',
              border: imagePreview ? 'none' : '2px dashed rgba(255,255,255,0.08)',
              background: imagePreview ? 'transparent' : 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.25s ease',
            }}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {uploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '14px', fontWeight: 600 }}>Uploading...</div>
                  )}
                  {!uploading && form.imageUrl && (
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(5,5,8,0.75)', backdropFilter: 'blur(12px)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✓ Uploaded</div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.5 }}>◇</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Click to upload image</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>JPG, PNG, WebP · Max 5MB</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <input style={{ ...inputStyle, fontSize: '12px' }} placeholder="Or paste image URL here (https://...)" value={form.imageUrl}
                onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }} />
            </div>

            {/* Extra Images Grid */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Additional Photos ({extraImages.length}/4)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {extraImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={img.preview || img.url} alt={`Extra ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeExtraImage(idx)} style={{
                      position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%',
                      background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0,
                    }}>✕</button>
                  </div>
                ))}
                {extraImages.length < 4 && (
                  <label style={{
                    aspectRatio: '1', borderRadius: '10px', border: '2px dashed rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: extraUploading ? 'wait' : 'pointer', transition: 'all 0.2s ease', flexDirection: 'column', gap: '4px',
                  }}>
                    <input type="file" accept="image/*" onChange={handleExtraImageSelect} style={{ display: 'none' }} disabled={extraUploading} />
                    {extraUploading ? (
                      <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600 }}>...</div>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>Add</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Brand Name</label>
            <input style={inputStyle} placeholder="Your brand name" value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
          </div>

          {/* Title — adapts label per category */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{getCategoryConfig(form.category).titleLabel}</label>
            <input style={inputStyle} placeholder={getCategoryConfig(form.category).titlePlaceholder} value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caption / Description</label>
            <textarea style={{ ...inputStyle, resize: 'none', minHeight: '100px' }}
              placeholder={getCategoryConfig(form.category).descPlaceholder} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Category + Price (price adapts or hides per category) */}
          {(() => { const cfg = getCategoryConfig(form.category); return (
          <div style={{ display: 'grid', gridTemplateColumns: cfg.showPrice !== false ? '1fr 1fr' : '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
              <select style={{ ...inputStyle, appearance: 'none' }} value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {allCategories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            {cfg.showPrice !== false && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cfg.priceLabel}</label>
              <input style={inputStyle} placeholder={cfg.pricePlaceholder} value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            )}
          </div>
          ); })()}



          {/* Launch Type Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Launch Type</label>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-full)', padding: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <button type="button" onClick={() => setLaunchNow(true)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                background: launchNow ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: launchNow ? '#34d399' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease',
                fontFamily: "'Sora', sans-serif",
              }}>⚡ Launch Now</button>
              <button type="button" onClick={() => setLaunchNow(false)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-full)', border: 'none',
                background: !launchNow ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: !launchNow ? '#60a5fa' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s ease',
                fontFamily: "'Sora', sans-serif",
              }}>🗓 Schedule</button>
            </div>
          </div>

          {launchNow ? (
            <div style={{
              padding: '12px 16px', borderRadius: '12px', fontSize: '12px',
              background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)', color: '#34d399',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚡ This drop will go <strong>LIVE</strong> immediately after creation
            </div>
          ) : (
            <>
              {/* Drop Date + Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{getCategoryConfig(form.category).dateLabel} *</label>
                  <input type="date" style={inputStyle} value={form.dropDate}
                    onChange={(e) => setForm({ ...form, dropDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drop Time *</label>
                  <input type="time" style={inputStyle} value={form.dropTime}
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
            </>
          )}

          {/* Website — label adapts per category */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{getCategoryConfig(form.category).linkLabel}</label>
            <input type="url" style={inputStyle} placeholder={getCategoryConfig(form.category).linkPlaceholder}
              value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              This link will appear as the action button on your {getCategoryConfig(form.category).dropNoun}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</div>
          )}
          {success && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.1)', color: '#34d399' }}>✅ {success}</div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting || uploading} style={{
            padding: '14px 28px', borderRadius: 'var(--radius-full)', border: 'none',
            background: (submitting || uploading) ? 'rgba(255,255,255,0.04)' : '#3b82f6',
            color: '#fff', fontSize: '14px', fontWeight: 600,
            cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s ease', width: '100%',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em',
          }}>
            {submitting ? 'Creating Drop...' : uploading ? 'Uploading Image...' : launchNow ? '⚡ Go Live' : 'Launch Drop'}
          </button>
        </form>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {activeTab === 'analytics' && (
        <div>
          {analyticsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          ) : !analytics ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📊</div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', fontFamily: "'Sora', sans-serif", fontSize: '15px' }}>No analytics yet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create your first drop to see analytics</div>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px',
              }}>
                {[
                  { label: 'Followers', value: analytics.followers, color: '#3b82f6' },
                  { label: 'Total Views', value: analytics.totalViews, color: '#8b5cf6' },
                  { label: 'Total Likes', value: analytics.totalLikes, color: '#ef4444' },
                  { label: 'Total Saves', value: analytics.totalSaves, color: '#f59e0b' },
                  { label: 'Comments', value: analytics.totalComments, color: '#34d399' },
                  { label: 'Entries', value: analytics.totalEntries, color: '#ec4899' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: '16px 12px', borderRadius: 'var(--radius-md)', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color, fontFamily: "'Sora', sans-serif" }}>
                      {formatNumber(stat.value)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px', fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-drop breakdown */}
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', fontFamily: "'Sora', sans-serif" }}>
                Drops ({analytics.totalDrops})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analytics.drops.map((d) => (
                  <div key={d.id} style={{
                    display: 'flex', gap: '12px', padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                  }}>
                    <img src={d.imageUrl} alt={d.title} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{d.title}</div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>👁 {formatNumber(d.views)}</span>
                        <span>❤️ {formatNumber(d.likes)}</span>
                        <span>💬 {formatNumber(d.comments)}</span>
                        <span>🔖 {formatNumber(d.saves)}</span>
                        {d.entries > 0 && <span>🎟 {formatNumber(d.entries)}</span>}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.08)',
                      fontSize: '11px', fontWeight: 600, color: '#60a5fa', flexShrink: 0,
                    }}>
                      🔥 {d.hypeScore}
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(d.id)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)',
                        color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', padding: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                      title="Delete drop"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════ DELETE CONFIRMATION MODAL ═══════ */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '340px',
              borderRadius: '24px', overflow: 'hidden',
              background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", marginBottom: '8px' }}>
                Delete this drop?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This will permanently remove the drop, including all likes, comments, and saves. This action cannot be undone.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px 24px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'rgba(255,255,255,0.06)', color: '#fff',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeletingDropId(showDeleteConfirm);
                  try {
                    await deleteDrop(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                    // Reload analytics
                    loadAnalytics();
                  } catch (err) {
                    alert('Failed to delete: ' + (err.message || 'Unknown error'));
                  }
                  setDeletingDropId(null);
                }}
                disabled={deletingDropId === showDeleteConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: deletingDropId === showDeleteConfirm ? 'rgba(239,68,68,0.3)' : '#ef4444',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  cursor: deletingDropId === showDeleteConfirm ? 'wait' : 'pointer',
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {deletingDropId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
