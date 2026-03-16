'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchUserProfile, updateProfile, uploadImage } from '../../lib/api';

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
  const [user] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState(createEditForm());
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    // Fetch full profile from API
    fetchUserProfile(user.id)
      .then((p) => {
        setProfile(p);
        setEditForm(createEditForm(p));
      })
      .catch(() => {
        // Fallback to localStorage data
        const fallbackProfile = {
          ...user,
          bio: user.bio || '',
          username: user.username || '',
          website: user.website || '',
          instagramHandle: user.instagramHandle || '',
          location: user.location || '',
          _count: { savedDrops: 0, comments: 0 },
        };
        setProfile(fallbackProfile);
        setEditForm(createEditForm(fallbackProfile));
      });
  }, [router, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Upload profile picture
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user || uploading) return;
    setUploading(true);
    setMsg('');
    const previousAvatar = profile?.avatar || '';

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile(p => ({ ...p, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadImage(file, { folder: 'dropout_avatars' });
      const imageUrl = result.url;

      // Save to profile
      const updated = await updateProfile(user.id, { avatar: imageUrl });
      setProfile(updated);
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      Object.assign(localUser, {
        avatar: imageUrl,
        name: updated.name,
        username: updated.username,
        bio: updated.bio,
        website: updated.website,
        instagramHandle: updated.instagramHandle,
        location: updated.location,
      });
      localStorage.setItem('user', JSON.stringify(localUser));
      setMsg('Profile picture updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setProfile((current) => ({ ...current, avatar: previousAvatar }));
      setMsg('Upload failed: ' + (err.message || 'Try a smaller image'));
      setTimeout(() => setMsg(''), 4000);
    }
    setUploading(false);
    e.target.value = '';
  };

  // Save profile edits
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        name: editForm.name.trim(),
        username: editForm.username.trim().replace(/^@+/, ''),
        bio: editForm.bio.trim(),
        website: editForm.website.trim(),
        instagramHandle: editForm.instagramHandle.trim().replace(/^@+/, ''),
        location: editForm.location.trim(),
      });
      setProfile(updated);
      setEditForm(createEditForm(updated));
      setEditing(false);
      // Update localStorage
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      Object.assign(localUser, {
        name: updated.name,
        username: updated.username,
        avatar: updated.avatar,
        bio: updated.bio,
        website: updated.website,
        instagramHandle: updated.instagramHandle,
        location: updated.location,
      });
      localStorage.setItem('user', JSON.stringify(localUser));
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Failed to save. Try again.');
      setTimeout(() => setMsg(''), 3000);
    }
    setSaving(false);
  };

  if (!user || !profile) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#525252' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
      <div style={{ fontSize: '14px' }}>Loading profile...</div>
    </div>
  );

  const initial = (profile.name || '?').charAt(0).toUpperCase();
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const websiteHref = profile.website
    ? (profile.website.startsWith('http://') || profile.website.startsWith('https://')
      ? profile.website
      : `https://${profile.website}`)
    : '';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '14px',
    background: '#111', border: '1px solid #1a1a1a', color: '#fff', outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>
      {/* ---- Header Section ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        {/* Avatar with upload */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '86px', height: '86px', borderRadius: '50%', cursor: 'pointer',
              background: profile.avatar
                ? `url(${profile.avatar}) center/cover`
                : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: profile.avatar ? '0' : '34px', fontWeight: 800, color: '#fff',
              border: '3px solid #1a1a1a', transition: 'all 0.3s ease',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {!profile.avatar && initial}
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s ease',
            }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: '#fff', fontWeight: 600,
            }}>...</div>
          )}
          {/* Camera badge */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '26px', height: '26px', borderRadius: '50%',
              background: '#3b82f6', border: '2px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>

        {/* Name & Role */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{profile.name}</h1>
          {profile.username && (
            <div style={{ fontSize: '13px', color: '#a3a3a3', marginBottom: '4px' }}>@{profile.username}</div>
          )}
          <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 500, marginBottom: '4px', textTransform: 'capitalize' }}>
            {profile.role === 'brand' ? '🏢 Brand Account' : '👤 User'}
          </div>
          <div style={{ fontSize: '12px', color: '#525252' }}>{profile.email}</div>
        </div>
      </div>

      {/* ---- Bio Section ---- */}
      <div style={{ marginBottom: '20px' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Display Name</label>
              <input
                style={inputStyle}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                placeholder="Your name"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Username</label>
              <input
                style={inputStyle}
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                placeholder="yourhandle"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Bio</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                placeholder="Tell people about yourself..."
                maxLength={150}
              />
              <div style={{ fontSize: '11px', color: '#525252', textAlign: 'right', marginTop: '2px' }}>
                {editForm.bio.length}/150
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Website</label>
                <input
                  style={inputStyle}
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                  placeholder="yourbrand.com"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Instagram</label>
                <input
                  style={inputStyle}
                  value={editForm.instagramHandle}
                  onChange={(e) => setEditForm({ ...editForm, instagramHandle: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                  placeholder="@yourhandle"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#737373', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Location</label>
              <input
                style={inputStyle}
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
                placeholder="City, Country"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
              <button
                onClick={() => { setEditing(false); setEditForm(createEditForm(profile)); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: '#111', border: '1px solid #1a1a1a', color: '#a3a3a3',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {profile.bio ? (
              <p style={{ fontSize: '14px', color: '#d4d4d4', lineHeight: 1.5, marginBottom: '8px' }}>{profile.bio}</p>
            ) : (
              <p style={{ fontSize: '14px', color: '#525252', fontStyle: 'italic', marginBottom: '8px' }}>No bio yet. Tap Edit to add one.</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {profile.website && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: '1px solid #1a1a1a',
                    background: '#0f0f0f',
                    color: '#fff',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.instagramHandle && (
                <span style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  border: '1px solid #1a1a1a',
                  background: '#0f0f0f',
                  color: '#fff',
                  fontSize: '12px',
                }}>
                  @{profile.instagramHandle}
                </span>
              )}
              {profile.location && (
                <span style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  border: '1px solid #1a1a1a',
                  background: '#0f0f0f',
                  color: '#fff',
                  fontSize: '12px',
                }}>
                  {profile.location}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                width: '100%', padding: '8px', borderRadius: '8px',
                background: '#111', border: '1px solid #1a1a1a', color: '#fff',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
            >Edit Profile</button>
          </div>
        )}
      </div>

      {/* ---- Stats ---- */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px',
        background: '#0a0a0a', borderRadius: '12px', padding: '16px',
        border: '1px solid #1a1a1a',
      }}>
        {[
          { label: 'Saved', value: profile._count?.savedDrops || 0 },
          { label: 'Comments', value: profile._count?.comments || 0 },
          { label: 'Joined', value: joinDate },
        ].map((stat) => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: typeof stat.value === 'number' ? '20px' : '13px', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#525252', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ---- Message ---- */}
      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: '10px', marginBottom: '16px',
          background: msg.includes('fail') ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
          border: `1px solid ${msg.includes('fail') ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
          color: msg.includes('fail') ? '#ef4444' : '#60a5fa',
          fontSize: '13px', fontWeight: 500, textAlign: 'center',
        }}>{msg}</div>
      )}

      {/* ---- Quick Links ---- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link href="/saved" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px', borderRadius: '12px',
          background: '#0a0a0a', border: '1px solid #1a1a1a',
          color: '#fff', fontSize: '14px', fontWeight: 500,
          textDecoration: 'none', transition: 'all 0.2s ease',
        }}>
          <span style={{ fontSize: '18px' }}>🔖</span>
          <span style={{ flex: 1 }}>Saved Drops</span>
          <span style={{ color: '#525252', fontSize: '13px' }}>{profile._count?.savedDrops || 0}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>

        {profile.role === 'brand' && (
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 16px', borderRadius: '12px',
            background: '#0a0a0a', border: '1px solid #1a1a1a',
            color: '#fff', fontSize: '14px', fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <span style={{ flex: 1 }}>Brand Dashboard</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        )}

        <Link href="/calendar" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 16px', borderRadius: '12px',
          background: '#0a0a0a', border: '1px solid #1a1a1a',
          color: '#fff', fontSize: '14px', fontWeight: 500,
          textDecoration: 'none', transition: 'all 0.2s ease',
        }}>
          <span style={{ fontSize: '18px' }}>📅</span>
          <span style={{ flex: 1 }}>Drop Calendar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>

        <div style={{ height: '1px', background: '#1a1a1a', margin: '4px 0' }} />

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 16px', borderRadius: '12px', width: '100%',
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)',
            color: '#ef4444', fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
