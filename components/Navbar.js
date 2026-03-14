'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Feed', icon: '🔥' },
  { href: '/trending', label: 'Trending', icon: '📈' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/categories', label: 'Categories', icon: '🏷️' },
  { href: '/saved', label: 'Saved', icon: '🔖' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'rgba(5, 5, 16, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26, 26, 62, 0.8)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                }}
              >
                🚀
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                <span className="gradient-text">Drop</span>
                <span className="text-[#e8eaed]">Space</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#60a5fa] bg-[rgba(59,130,246,0.1)]'
                        : 'text-[#6b7280] hover:text-[#e8eaed] hover:bg-[#111128]'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right section */}
            <div className="hidden md:flex items-center gap-3">
              <button className="btn-secondary text-xs py-2 px-4">
                Sign In
              </button>
              <button className="btn-primary text-xs py-2 px-4">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#6b7280] hover:text-[#e8eaed] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1a1a3e]" style={{
            background: 'rgba(5, 5, 16, 0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#60a5fa] bg-[rgba(59,130,246,0.1)]'
                        : 'text-[#6b7280] hover:text-[#e8eaed] hover:bg-[#111128]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-[#1a1a3e] flex gap-2">
                <button className="btn-secondary text-xs py-2 px-4 flex-1">Sign In</button>
                <button className="btn-primary text-xs py-2 px-4 flex-1">Get Started</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{
        background: 'rgba(5, 5, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(26, 26, 62, 0.8)',
      }}>
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-all duration-200 ${
                  isActive ? 'text-[#60a5fa]' : 'text-[#6b7280]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
