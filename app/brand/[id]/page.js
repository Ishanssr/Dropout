'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DropCard from '../../../components/DropCard';
import { transformDrop, toggleFollowBrand } from '../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export default function BrandProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState(null);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/brands/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBrand(data);
        setFollowing(data.isFollowing || false);
        setFollowerCount(data._count?.followers || 0);
        setDrops((data.drops || []).map(d => ({
          ...transformDrop(d),
          brand: { id: data.id, name: data.name, logo: data.logo, website: data.website },
        })));
      } catch {
        setBrand(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleFollow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/login'); return; }
    const newFollowing = !following;
    setFollowing(newFollowing);
    setFollowerCount(prev => newFollowing ? prev + 1 : prev - 1);
    try {
      const result = await toggleFollowBrand(id);
      setFollowing(result.following);
      setFollowerCount(result.followers);
    } catch {
      setFollowing(!newFollowing);
      setFollowerCount(prev => newFollowing ? prev - 1 : prev + 1);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '140px', height: '18px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '80px', height: '14px' }} />
          </div>
        </div>
        {[1,2].map(i => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '2px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!brand) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', fontFamily: "'Sora', sans-serif" }}>Brand not found</div>
        <Link href="/" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>← Back to feed</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%' }}>
      {/* Back button */}
      <div style={{ padding: '14px 16px' }}>
        <Link href="/" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>← Feed</Link>
      </div>

      {/* Brand Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '8px 16px 24px',
      }}>
        {/* Logo */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '3px',
        }}>
          <img
            src={brand.logo}
            alt={brand.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-secondary)', border: '3px solid var(--bg-primary)' }}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${brand.name}&background=0a0a0f&color=3b82f6&size=80`; }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px',
            fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em',
          }}>{brand.name}</h1>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>{drops.length}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Drops</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif" }}>{followerCount}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Followers</div>
            </div>
          </div>
          <button
            onClick={handleFollow}
            style={{
              width: '100%', padding: '9px 0', borderRadius: 'var(--radius-full)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.25s ease', fontFamily: "'Sora', sans-serif",
              border: following ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(59,130,246,0.3)',
              background: following ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.12)',
              color: following ? 'var(--text-secondary)' : '#60a5fa',
            }}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Website */}
      {brand.website && (
        <div style={{ padding: '0 16px 16px' }}>
          <a href={brand.website} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            🌐 {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 16px' }} />

      {/* Drops */}
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ padding: '0 16px 12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.01em' }}>
          {drops.length} {drops.length === 1 ? 'Drop' : 'Drops'}
        </div>
        {drops.map((drop, i) => (
          <DropCard key={drop.id} drop={drop} index={i} />
        ))}
        {drops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No drops yet
          </div>
        )}
      </div>
    </div>
  );
}
