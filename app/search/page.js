'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchBrands = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          // Only show brands
          setResults(data.filter(u => u.role === 'brand'));
        }
      } catch { /* ignore */ }
      setLoading(false);
      setSearched(true);
    }, 300);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    searchBrands(e.target.value);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', width: '100%', padding: '32px 16px' }}>

      {/* ---- Header ---- */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '26px', fontWeight: 700, margin: 0,
          fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em',
          color: '#fff',
        }}>
          Discover <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Brands</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '-0.01em' }}>
          Find your favorite brands and follow their drops
        </p>
      </div>

      {/* ---- Glassmorphism Search Panel ---- */}
      <div className="search-glass-panel">

        {/* Search bar */}
        <div className="search-glass-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search brands..."
            value={query}
            onChange={handleChange}
            className="search-glass-input"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              className="search-glass-clear"
            >✕</button>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '0 -4px' }} />

        {/* Results area */}
        <div style={{ minHeight: '200px' }}>

          {/* Loading shimmer */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' }}>
              {[1,2,3].map(i => (
                <div key={i} className="search-result-shimmer">
                  <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '110px', height: '14px', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ width: '70px', height: '11px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Brand results */}
          {!loading && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 0' }}>
              {results.map(brand => (
                <Link
                  key={brand.id}
                  href={brand.brandId ? `/brand/${brand.brandId}` : `/profile/${brand.id}`}
                  className="search-brand-result"
                >
                  {/* Avatar */}
                  <div className="search-brand-avatar">
                    {brand.avatar ? (
                      <img src={brand.avatar} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontSize: '17px', fontWeight: 700, color: '#60a5fa' }}>
                        {brand.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {brand.name}
                      <span className="search-brand-badge">Brand</span>
                    </div>
                    {brand.bio && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {brand.bio}
                      </div>
                    )}
                  </div>
                  {/* Follow arrow */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && searched && results.length === 0 && query.trim() && (
            <div className="search-empty-state">
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.2 }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>No brands found for &ldquo;{query}&rdquo;</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Try a different brand name</div>
            </div>
          )}

          {/* Empty / default state */}
          {!loading && !searched && (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#searchGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="searchGrad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Discover Brands</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Search for brands to follow their latest drops,<br/>launches, and exclusive releases
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
