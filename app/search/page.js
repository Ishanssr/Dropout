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

  const searchUsers = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch { /* ignore */ }
      setLoading(false);
      setSearched(true);
    }, 300);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    searchUsers(e.target.value);
  };

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '24px 16px' }}>
      {/* Search Header */}
      <h1 style={{
        fontSize: '22px', fontWeight: 700, marginBottom: '18px',
        fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em',
      }}>
        <span style={{ color: '#3b82f6' }}>Search</span> <span style={{ color: '#fff' }}>Users</span>
      </h1>

      {/* Search Input */}
      <div style={{
        position: 'relative', marginBottom: '24px',
      }}>
        <div style={{
          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by username or name..."
          value={query}
          onChange={handleChange}
          style={{
            width: '100%', padding: '14px 16px 14px 46px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', fontSize: '14px', outline: 'none',
            transition: 'all 0.25s ease',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.01em',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(59,130,246,0.3)'; e.target.style.background = 'rgba(59,130,246,0.04)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
              width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px',
            }}
          >✕</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px' }}>
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
                <div className="skeleton" style={{ width: '80px', height: '12px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {results.map(user => {
            const profileUrl = (user.role === 'brand' && user.brandId)
              ? `/brand/${user.brandId}`
              : `/profile/${user.id}`;
            return (
            <Link
              key={user.id}
              href={profileUrl}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '16px',
                textDecoration: 'none', color: 'inherit',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: user.avatar ? 'transparent' : 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(59,130,246,0.15)',
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px', fontWeight: 600, color: '#fff',
                  letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {user.name}
                  {user.role === 'brand' && (
                    <span style={{
                      fontSize: '9px', fontWeight: 600, padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Brand</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  @{user.username || 'user'}
                </div>
                {user.bio && (
                  <div style={{
                    fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.bio}
                  </div>
                )}
              </div>
              {/* Arrow */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && query.trim() && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.5 }}>◇</div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>No users found for &ldquo;{query}&rdquo;</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Try a different name or username</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '16px' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>Find people</div>
          <div style={{ fontSize: '12px' }}>Search by username or name</div>
        </div>
      )}
    </div>
  );
}
