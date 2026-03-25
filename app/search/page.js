'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const StarField = dynamic(() => import('../../components/FluidCanvas'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
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

  const showResults = focused && (loading || results.length > 0 || (searched && query.trim()));

  return (
    <div className="search-page">
      {/* Star background */}
      <div className="search-bg">
        <StarField />
      </div>

      {/* Content */}
      <div className="search-content">

        {/* Header */}
        <div className="search-header">
          <h1 className="search-title">
            Discover{' '}
            <span className="search-title-accent">Brands</span>
          </h1>
          <p className="search-subtitle">
            Find your favorite brands and follow their latest drops, launches, and exclusive releases
          </p>
        </div>

        {/* Liquid Glass Search Bar */}
        <div className="search-bar-wrap">
          <div className={`search-bar-glass ${focused ? 'search-bar-glass--active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search brands..."
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              className="search-bar-input"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                className="search-bar-clear"
              >✕</button>
            )}
          </div>
        </div>

        {/* Results Glass Plate */}
        {showResults && (
          <div className="search-results-plate">

            {/* Loading */}
            {loading && (
              <div className="search-results-inner">
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px' }}>
                    <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '120px', height: '15px', marginBottom: '8px' }} />
                      <div className="skeleton" style={{ width: '80px', height: '12px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Brand Results */}
            {!loading && results.length > 0 && (
              <div className="search-results-inner">
                {results.map(brand => (
                  <Link
                    key={brand.id}
                    href={brand.brandId ? `/brand/${brand.brandId}` : `/profile/${brand.id}`}
                    className="search-result-item"
                  >
                    <div className="search-result-avatar">
                      {brand.avatar ? (
                        <img src={brand.avatar} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
                          {brand.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="search-result-name">
                        {brand.name}
                        <span className="search-result-badge">Brand</span>
                      </div>
                      {brand.bio && (
                        <div className="search-result-bio">{brand.bio}</div>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && searched && results.length === 0 && query.trim() && (
              <div className="search-no-results">
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>No brands found</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Try a different brand name
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default empty — floating hint below search bar */}
        {!focused && !searched && (
          <div className="search-hint">
            <p>Type to search from hundreds of brands</p>
          </div>
        )}
      </div>
    </div>
  );
}
