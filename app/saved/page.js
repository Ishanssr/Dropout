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
      <div style={{ maxWidth: '470px', margin: '0 auto', textAlign: 'center', padding: '80px 20px', color: '#525252' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <div style={{ fontSize: '14px' }}>Loading saved drops...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '16px 16px 8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
          <span style={{ color: '#3b82f6' }}>Saved</span> Drops
        </h1>
        <p style={{ fontSize: '13px', color: '#737373', marginBottom: '8px' }}>{drops.length} saved</p>
      </div>

      {drops.map((drop) => <DropCard key={drop.id} drop={drop} />)}

      {drops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#737373' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔖</div>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>No saved drops</div>
          <div style={{ fontSize: '14px' }}>Tap the bookmark icon to save drops</div>
        </div>
      )}
    </div>
  );
}
