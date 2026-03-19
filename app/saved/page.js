'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSavedDrops, transformDrop } from '../../lib/api';
import DropCard from '../../components/DropCard';

export default function SavedPage() {
  const router = useRouter();
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSavedDrops(user.id)
      .then((data) => {
        setDrops(data.map(d => transformDrop(d)));
        setLoading(false);
      })
      .catch(() => {
        setDrops([]);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto', padding: '24px 16px' }}>
        <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '24px' }} />
        {[1,2].map(i => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '2px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '24px 16px 10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em' }}>
          <span style={{ color: '#3b82f6' }}>Saved</span> <span style={{ color: '#fff' }}>Drops</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{drops.length} saved</p>
      </div>

      {drops.map((drop) => <DropCard key={drop.id} drop={drop} />)}

      {drops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>◇</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '6px', fontFamily: "'Sora', sans-serif", fontSize: '16px', letterSpacing: '-0.02em' }}>No saved drops</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tap the bookmark icon to save drops</div>
        </div>
      )}
    </div>
  );
}
