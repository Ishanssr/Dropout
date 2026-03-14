'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Feed', icon: '🔥' },
  { href: '/trending', label: 'Trending', icon: '📈' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/categories', label: 'Explore', icon: '🏷️' },
  { href: '/saved', label: 'Saved', icon: '🔖' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#1a1a1a] h-[56px]">
        <div className="max-w-[935px] mx-auto h-full flex items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-extrabold tracking-tight no-underline">
            <span className="text-blue-500">Drop</span>
            <span className="text-white">Space</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`no-underline text-[13px] font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  pathname === item.href
                    ? 'text-blue-500 bg-blue-500/10'
                    : 'text-[#737373] hover:text-white hover:bg-[#111]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button className="text-[13px] font-medium px-4 py-[6px] rounded-lg border border-[#262626] bg-transparent text-white hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
              Sign In
            </button>
            <button className="text-[13px] font-semibold px-4 py-[6px] rounded-lg bg-blue-500 text-white border-none hover:bg-blue-600 transition-colors cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden bg-transparent border-none text-white text-xl p-2 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-[#1a1a1a] px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`no-underline flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-500 bg-blue-500/10'
                    : 'text-[#737373] hover:text-white hover:bg-[#111]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#1a1a1a] flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`no-underline flex flex-col items-center gap-[2px] px-2 py-1 text-[9px] font-medium ${
              pathname === item.href ? 'text-blue-500' : 'text-[#737373]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
