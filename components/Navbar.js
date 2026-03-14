'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { href: '/trending', label: 'Trending', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  )},
  { href: '/categories', label: 'Explore', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  )},
  { href: '/calendar', label: 'Calendar', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { href: '/saved', label: 'Saved', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  )},
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  )},
];

const bottomItems = [
  { label: 'Create', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  )},
  { label: 'More', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  )},
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const sidebarWidth = expanded ? 244 : 72;

  return (
    <>
      {/* ===== LEFT SIDEBAR (Desktop) ===== */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: `${sidebarWidth}px`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 50,
          borderRight: '1px solid #262626',
          background: '#000',
          overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        {/* ---- Logo ---- */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: expanded ? '28px 20px 36px' : '28px 0 36px',
            justifyContent: expanded ? 'flex-start' : 'center',
            textDecoration: 'none',
            transition: 'padding 0.3s ease',
          }}
        >
          {expanded ? (
            <span style={{
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#3b82f6' }}>Drop</span>Space
            </span>
          ) : (
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#3b82f6' }}>D</span>
          )}
        </Link>

        {/* ---- Nav Items ---- */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : '#a3a3a3',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '15px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  minHeight: '48px',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a3a3a3'; }}}
              >
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '24px', flexShrink: 0,
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}>
                  {item.icon}
                </span>
                {expanded && (
                  <span style={{
                    opacity: 1,
                    transition: 'opacity 0.2s ease 0.1s',
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---- Bottom Items ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px 24px' }}>
          {bottomItems.map((item) => (
            <button
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                borderRadius: '12px',
                color: '#a3a3a3',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                minHeight: '48px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a3a3a3'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', flexShrink: 0 }}>
                {item.icon}
              </span>
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* ===== BOTTOM NAV (Mobile) ===== */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid #1a1a1a',
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0',
        }}
      >
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px',
              color: pathname === item.href ? '#fff' : '#525252',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            <span style={{ display: 'flex', transform: 'scale(0.9)' }}>{item.icon}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
