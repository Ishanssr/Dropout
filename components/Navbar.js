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
      {/* Top Navbar */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <span>Drop</span>Space
          </Link>

          {/* Desktop links */}
          <div className="nav-links hide-mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hide-mobile" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-outline" style={{ fontSize: '13px', padding: '6px 16px' }}>Sign In</button>
            <button className="btn-blue" style={{ fontSize: '13px', padding: '6px 16px' }}>Get Started</button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#f5f5f5', padding: '8px', cursor: 'pointer', fontSize: '20px' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="show-mobile" style={{ borderTop: '1px solid #1a1a1a', background: '#000', padding: '8px' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                style={{ display: 'flex', padding: '12px', borderRadius: '8px' }}
              >
                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom mobile nav */}
      <div className="bottom-nav show-mobile">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
