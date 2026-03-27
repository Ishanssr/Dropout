'use client';

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchUserProfile, updateProfile, uploadImage } from '../../lib/api';
import ClientShell from '../../components/ClientShell';
import { GlassPanelLayers } from '../../components/LiquidGlass';
import {
  clearStoredUser,
  getStoredUserSnapshot,
  getStoredToken,
  notifyUserChanged,
  parseStoredUser,
  restoreStoredUserSession,
  subscribeToStoredUser,
} from '../../lib/userStorage';

function createEditForm(profile = {}) {
  return {
    name: profile.name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    website: profile.website || '',
    instagramHandle: profile.instagramHandle || '',
    location: profile.location || '',
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const rawStoredUser = useSyncExternalStore(subscribeToStoredUser, getStoredUserSnapshot, () => null);
  const user = useMemo(() => parseStoredUser(rawStoredUser), [rawStoredUser]);
  const hasStoredToken = !!getStoredToken();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState(createEditForm());
  const [msg, setMsg] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (!user) {
      if (!hasStoredToken) { router.push('/login'); return; }
      let cancelled = false;
      restoreStoredUserSession().then((r) => { if (!cancelled && !r) router.push('/login'); });
      return () => { cancelled = true; };
    }
    fetchUserProfile(user.id)
      .then((p) => { setProfile(p); setEditForm(createEditForm(p)); })
      .catch((err) => {
        if (err.message?.includes('User not found')) { clearStoredUser(); router.push('/login'); return; }
        const fb = { ...user, bio: '', username: '', website: '', instagramHandle: '', location: '', createdAt: new Date().toISOString(), _count: { savedDrops: 0, comments: 0 } };
        setProfile(fb); setEditForm(createEditForm(fb));
      });
  }, [hasStoredToken, router, user]);

  const handleLogout = () => { clearStoredUser(); router.push('/login'); };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user || uploading) return;
    setUploading(true); setMsg('');
    const prev = profile?.avatar || '';
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewAvatar(ev.target.result);
    reader.readAsDataURL(file);
    try {
      const result = await uploadImage(file, { folder: 'dropout_avatars' });
      const updated = await updateProfile(user.id, { avatar: result.url });
      setProfile(updated);
      const lu = JSON.parse(localStorage.getItem('user') || '{}');
      Object.assign(lu, { avatar: result.url, name: updated.name, username: updated.username });
      localStorage.setItem('user', JSON.stringify(lu));
      notifyUserChanged(); setPreviewAvatar('');
      setMsg('Profile picture updated!'); setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setPreviewAvatar(''); setProfile((c) => ({ ...c, avatar: prev }));
      setMsg(`Upload failed: ${err.message || 'Try a smaller image'}`); setTimeout(() => setMsg(''), 4000);
    }
    setUploading(false); e.target.value = '';
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        name: editForm.name.trim(), username: editForm.username.trim().replace(/^@+/, ''),
        bio: editForm.bio.trim(), website: editForm.website.trim(),
        instagramHandle: editForm.instagramHandle.trim().replace(/^@+/, ''), location: editForm.location.trim(),
      });
      setProfile(updated); setEditForm(createEditForm(updated)); setEditing(false);
      const lu = JSON.parse(localStorage.getItem('user') || '{}');
      Object.assign(lu, { name: updated.name, username: updated.username, avatar: updated.avatar, bio: updated.bio, website: updated.website, instagramHandle: updated.instagramHandle, location: updated.location });
      localStorage.setItem('user', JSON.stringify(lu)); notifyUserChanged();
      setMsg('Profile updated!'); setTimeout(() => setMsg(''), 2000);
    } catch (err) { setMsg(`Failed to save: ${err.message || 'Try again.'}`); setTimeout(() => setMsg(''), 3000); }
    setSaving(false);
  };

  if (!user && hasStoredToken) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><div className="skeleton" style={{ width: '86px', height: '86px', borderRadius: '50%', margin: '0 auto 16px' }} /><div className="skeleton" style={{ width: '140px', height: '18px', margin: '0 auto' }} /></div>;
  if (!user || !profile) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><div className="skeleton" style={{ width: '86px', height: '86px', borderRadius: '50%', margin: '0 auto 16px' }} /><div className="skeleton" style={{ width: '140px', height: '18px', margin: '0 auto' }} /></div>;

  const initial = (profile.name || '?').charAt(0).toUpperCase();
  const jd = profile.createdAt ? new Date(profile.createdAt) : null;
  const joinDate = jd && !Number.isNaN(jd.getTime()) ? jd.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  const websiteHref = profile.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : '';
  const avatarSrc = previewAvatar || profile.avatar || '';
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', outline: 'none', transition: 'all 0.25s ease', letterSpacing: '-0.01em' };

  return (
    <ClientShell fallback={<div style={{ textAlign: 'center', padding: '80px 20px' }}><div className="skeleton" style={{ width: '86px', height: '86px', borderRadius: '50%', margin: '0 auto 16px' }} /></div>}>
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '16px 12px' }}>

      {/* ═══ LIQUID GLASS PROFILE CARD ═══ */}
      <div style={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', background: 'rgba(8,8,16,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)', marginBottom: '16px' }}>
        <GlassPanelLayers />
        <div style={{ position: 'relative', zIndex: 5, padding: '32px 24px 28px' }}>

          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            <div onClick={() => fileRef.current?.click()} style={{ width: '96px', height: '96px', borderRadius: '50%', margin: '0 auto 16px', padding: '3px', position: 'relative', cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6)', backgroundSize: '200% 200%', boxShadow: '0 0 24px rgba(59,130,246,0.25), 0 0 48px rgba(139,92,246,0.1)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarSrc ? <img src={avatarSrc} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '36px', fontWeight: 800, color: '#60a5fa', fontFamily: "'Sora', sans-serif" }}>{initial}</span>}
              </div>
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0a0a14', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              {uploading && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 600 }}>...</div>}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.04em', marginBottom: '4px', lineHeight: 1.2 }}>{profile.name}</h1>
            {profile.username && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 500 }}>@{profile.username}</div>}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>{profile.email}</div>
          </div>

          {/* Bio Edit / Display */}
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Display Name</label><input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your name" /></div>
              <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Username</label><input style={inputStyle} value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} placeholder="yourhandle" /></div>
              <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio</label><textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell people about yourself..." maxLength={150} /><div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>{editForm.bio.length}/150</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Website</label><input style={inputStyle} value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="yourbrand.com" /></div>
                <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Instagram</label><input style={inputStyle} value={editForm.instagramHandle} onChange={(e) => setEditForm({ ...editForm, instagramHandle: e.target.value })} placeholder="@yourhandle" /></div>
              </div>
              <div><label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</label><input style={inputStyle} value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="City, Country" /></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 16px rgba(59,130,246,0.25)' }}>{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => { setEditing(false); setEditForm(createEditForm(profile)); }} style={{ flex: 1, padding: '12px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {profile.bio && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: '10px' }}>{profile.bio}</p>}
              {(profile.website || profile.instagramHandle || profile.location) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '14px' }}>
                  {profile.location && <span style={{ padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>📍 {profile.location}</span>}
                  {profile.instagramHandle && <span style={{ padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>@{profile.instagramHandle}</span>}
                  {profile.website && <a href={websiteHref} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#60a5fa', fontSize: '11px', textDecoration: 'none' }}>{profile.website.replace(/^https?:\/\//, '')}</a>}
                </div>
              )}
              <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '12px', borderRadius: '50px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.25s' }}>Edit Profile</button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: 'Saved', value: profile._count?.savedDrops || 0 },
              { label: 'Following', value: profile._count?.follows || 0, clickable: true },
              { label: 'Joined', value: joinDate },
            ].map((s) => (
              <div key={s.label} onClick={s.clickable ? () => setShowFollowing(true) : undefined} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)', cursor: s.clickable ? 'pointer' : 'default', transition: 'all 0.25s ease' }}
                onMouseEnter={s.clickable ? (e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; } : undefined}
                onMouseLeave={s.clickable ? (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; } : undefined}
              >
                <div style={{ fontSize: typeof s.value === 'number' ? '18px' : '11px', fontWeight: 800, color: s.clickable ? '#60a5fa' : '#fff', fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {msg && <div style={{ padding: '10px 16px', borderRadius: '14px', marginTop: '12px', background: msg.includes('fail') ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${msg.includes('fail') ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'}`, color: msg.includes('fail') ? '#ef4444' : '#60a5fa', fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>{msg}</div>}
        </div>
      </div>

      {/* ═══ QUICK LINKS GLASS CARD ═══ */}
      <div style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'rgba(8,8,16,0.6)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', padding: '8px' }}>
        <GlassPanelLayers />
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link href="/saved" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '16px' }}>🔖</span><span style={{ flex: 1 }}>Saved Drops</span><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{profile._count?.savedDrops || 0}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          {profile.role === 'brand' && (
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '16px' }}>📊</span><span style={{ flex: 1 }}>Brand Dashboard</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          )}
          <Link href="/calendar" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '16px' }}>📅</span><span style={{ flex: 1 }}>Drop Calendar</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          <button onClick={() => setShowFollowing(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '16px' }}>👥</span><span style={{ flex: 1 }}>Following</span><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{profile._count?.follows || 0}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '2px 16px' }} />
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '16px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: '16px' }}>🚪</span><span>Log Out</span>
          </button>
        </div>
      </div>
    </div>

    {/* ═══ FOLLOWING MODAL ═══ */}
    {showFollowing && (
      <div onClick={() => setShowFollowing(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', maxHeight: '70vh', borderRadius: '24px', overflow: 'hidden', background: 'rgba(12,12,20,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', position: 'relative' }}>
          <GlassPanelLayers />
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 5 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.03em', margin: 0 }}>Following</h3>
            <button onClick={() => setShowFollowing(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '16px' }}>✕</button>
          </div>
          <div style={{ padding: '12px 16px', overflowY: 'auto', maxHeight: 'calc(70vh - 70px)', position: 'relative', zIndex: 5 }}>
            {(!profile.follows || profile.follows.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>
                Not following any brands yet.
                <Link href="/search" style={{ display: 'block', marginTop: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>Discover brands →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {profile.follows.map((f) => (
                  <Link key={f.id} href={`/brand/${f.brand?.id}`} onClick={() => setShowFollowing(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', textDecoration: 'none', color: '#fff', transition: 'all 0.2s ease', background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(59,130,246,0.15)' }}>
                      {f.brand?.logo ? <img src={f.brand.logo} alt={f.brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '18px', fontWeight: 700 }}>{f.brand?.name?.charAt(0) || '?'}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>{f.brand?.name}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </ClientShell>
  );
}
