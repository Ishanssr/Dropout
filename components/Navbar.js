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

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ===== LEFT SIDEBAR (Desktop) — expands on hover ===== */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? '220px' : '72px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col border-r border-[#1a1a1a] bg-black/95 backdrop-blur-xl"
      >
        {/* Logo — click goes to homepage */}
        <Link href="/" className="no-underline flex items-center gap-3 px-5 py-6 overflow-hidden">
          <span className="text-blue-500 text-2xl font-extrabold shrink-0" style={{ minWidth: '24px' }}>D</span>
          <span
            className="text-white font-extrabold text-lg whitespace-nowrap"
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}
          >
            ropSpace
          </span>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`no-underline flex items-center gap-4 px-3 py-3 rounded-xl overflow-hidden group
                  ${isActive
                    ? 'text-white bg-white/10'
                    : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                  }`}
                style={{ transition: 'all 0.2s ease' }}
              >
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    minWidth: '24px',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}
                  style={{
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? 'translateX(0)' : 'translateX(-12px)',
                    transition: 'opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-0.5 px-3 pb-5">
          <Link
            href="/dashboard"
            className="no-underline flex items-center gap-4 px-3 py-3 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-white/5 overflow-hidden"
            style={{ transition: 'all 0.2s ease' }}
          >
            <span className="shrink-0 flex items-center justify-center" style={{ minWidth: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </span>
            <span className="text-sm font-medium whitespace-nowrap" style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-12px)',
              transition: 'opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s',
            }}>
              Create
            </span>
          </Link>
          <button
            className="flex items-center gap-4 px-3 py-3 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-white/5 bg-transparent border-none cursor-pointer overflow-hidden"
            style={{ transition: 'all 0.2s ease' }}
          >
            <span className="shrink-0 flex items-center justify-center" style={{ minWidth: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </span>
            <span className="text-sm font-medium whitespace-nowrap" style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-12px)',
              transition: 'opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s',
            }}>
              More
            </span>
          </button>
        </div>
      </aside>

      {/* ===== BOTTOM NAV (Mobile) ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#1a1a1a] flex justify-around py-1.5">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`no-underline flex flex-col items-center p-2 rounded-xl ${
              pathname === item.href ? 'text-white' : 'text-[#525252]'
            }`}
            style={{ transition: 'color 0.2s ease' }}
          >
            <span style={{ transform: 'scale(0.9)', display: 'flex' }}>{item.icon}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
