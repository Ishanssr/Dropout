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

  return (
    <>
      {/* ===== LEFT SIDEBAR (Desktop) ===== */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col border-r border-[#1a1a1a] bg-black"
        style={{ width: '72px' }}
      >
        {/* Logo */}
        <Link href="/" className="no-underline flex items-center justify-center py-6">
          <span className="text-blue-500 text-2xl font-extrabold">D</span>
        </Link>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1 px-2 pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`no-underline w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'text-white bg-[#111]'
                    : 'text-[#737373] hover:text-white hover:bg-[#111]'
                }`}
              >
                <span className={isActive ? 'scale-110' : 'group-hover:scale-110'} style={{ transition: 'transform 0.15s ease', display: 'flex' }}>
                  {item.icon}
                </span>
                {/* Tooltip */}
                <span className="absolute left-[60px] bg-[#1a1a1a] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[#262626]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-1 px-2 pb-4">
          <button
            title="Create Drop"
            className="w-12 h-12 flex items-center justify-center rounded-xl text-[#737373] hover:text-white hover:bg-[#111] transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button
            title="More"
            className="w-12 h-12 flex items-center justify-center rounded-xl text-[#737373] hover:text-white hover:bg-[#111] transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </aside>

      {/* ===== BOTTOM NAV (Mobile) ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#1a1a1a] flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`no-underline flex flex-col items-center gap-0.5 p-1.5 ${
              pathname === item.href ? 'text-white' : 'text-[#737373]'
            }`}
          >
            <span style={{ transform: 'scale(0.85)', display: 'flex' }}>{item.icon}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
