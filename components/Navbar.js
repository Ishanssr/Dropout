'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  processDueNotifications,
  requestNotificationPermission,
} from '../lib/notifications';
import {
  getStoredUserSnapshot,
  parseStoredUser,
  subscribeToStoredUser,
} from '../lib/userStorage';

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
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
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => (
    []
  ));
  const [unreadCount, setUnreadCount] = useState(() => (
    0
  ));
  const rawStoredUser = useSyncExternalStore(subscribeToStoredUser, getStoredUserSnapshot, () => null);
  const storedUser = useMemo(() => parseStoredUser(rawStoredUser), [rawStoredUser]);
  const loggedIn = !!storedUser;
  const isBrand = storedUser?.role === 'brand';
  const userName = storedUser?.name || '';
  const userAvatar = storedUser?.avatar || '';

  const syncNotifications = () => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadNotificationsCount());
  };

  useEffect(() => {
    const handleNotificationsChanged = () => syncNotifications();
    const intervalId = window.setInterval(() => {
      processDueNotifications();
      syncNotifications();
    }, 30000);

    window.addEventListener('dropout-notifications-changed', handleNotificationsChanged);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('dropout-notifications-changed', handleNotificationsChanged);
    };
  }, [pathname]);

  const visibleNavItems = navItems;

  const sidebarWidth = expanded ? 244 : 72;

  const openNotifications = async () => {
    setNotificationOpen((current) => !current);
    processDueNotifications();
    syncNotifications();
    await requestNotificationPermission();
  };

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    setNotificationOpen(false);
    router.push(`/drop/${notification.dropId}`);
  };

  const formatNotificationTime = (notification) => {
    const date = new Date(notification.dropTime);
    if (Number.isNaN(date.getTime())) return 'Drop scheduled';

    if (notification.notifiedAt) return 'Live now';
    return `Drops ${date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  };

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
              <span style={{ color: '#3b82f6' }}>Drop</span>out
            </span>
          ) : (
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#3b82f6' }}>D</span>
          )}
        </Link>

        {/* ---- Nav Items ---- */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {visibleNavItems.map((item) => {
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
          {/* Dashboard — brand users only */}
          {loggedIn && isBrand && (
            <Link
              href="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px', borderRadius: '12px',
                color: pathname === '/dashboard' ? '#fff' : '#a3a3a3',
                background: pathname === '/dashboard' ? 'rgba(59,130,246,0.12)' : 'transparent',
                textDecoration: 'none', fontSize: '15px',
                fontWeight: pathname === '/dashboard' ? 700 : 400,
                overflow: 'hidden', whiteSpace: 'nowrap', minHeight: '48px',
                transition: 'all 0.2s ease',
                border: pathname === '/dashboard' ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (pathname !== '/dashboard') { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.color = '#60a5fa'; }}}
              onMouseLeave={(e) => { if (pathname !== '/dashboard') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a3a3a3'; }}}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </span>
              {expanded && <span>Dashboard</span>}
            </Link>
          )}
          {/* Profile */}
          <Link
            href="/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px', borderRadius: '12px',
              color: pathname === '/profile' ? '#fff' : '#a3a3a3',
              background: pathname === '/profile' ? 'rgba(255,255,255,0.08)' : 'transparent',
              textDecoration: 'none', fontSize: '15px',
              fontWeight: pathname === '/profile' ? 700 : 400,
              overflow: 'hidden', whiteSpace: 'nowrap', minHeight: '48px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { if (pathname !== '/profile') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}}
            onMouseLeave={(e) => { if (pathname !== '/profile') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a3a3a3'; }}}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            {expanded && <span>Profile</span>}
          </Link>
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER (hidden on desktop) ===== */}
      <div
        className="mobile-top-header"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', height: '52px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#3b82f6', fontSize: '20px' }}>⚡</span>
          <span style={{ fontSize: '18px', fontWeight: 800 }}>
            <span style={{ color: '#3b82f6' }}>Drop</span><span style={{ color: '#fff' }}>out</span>
          </span>
        </Link>
        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { if (loggedIn) openNotifications(); else router.push('/login'); }}
              style={{ color: notificationOpen ? '#fff' : '#737373', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-6px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '999px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notificationOpen && loggedIn && (
              <div style={{
                position: 'absolute',
                top: '34px',
                right: '-8px',
                width: '290px',
                maxHeight: '360px',
                overflowY: 'auto',
                borderRadius: '16px',
                background: 'rgba(8,8,8,0.98)',
                border: '1px solid #1f1f1f',
                boxShadow: '0 22px 40px rgba(0,0,0,0.4)',
                padding: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Notifications</div>
                  <button
                    onClick={() => { markAllNotificationsRead(); syncNotifications(); }}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                  >
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#737373', lineHeight: 1.5, padding: '10px 4px' }}>
                    Save a drop with Notify Me and we&apos;ll alert you here when it goes live.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        cursor: 'pointer',
                        background: notification.readAt ? 'transparent' : 'rgba(59,130,246,0.08)',
                        borderRadius: '12px',
                        padding: '10px',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{notification.title}</span>
                        {!notification.readAt && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a3a3a3' }}>{notification.brandName}</div>
                      <div style={{ fontSize: '11px', color: notification.notifiedAt ? '#34d399' : '#737373' }}>
                        {formatNotificationTime(notification)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Link href={loggedIn ? '/profile' : '/login'} style={{ display: 'flex' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: userAvatar ? `url(${userAvatar}) center/cover` : (loggedIn ? '#3b82f6' : '#262626'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: userAvatar ? '0' : '13px', fontWeight: 700, color: '#fff',
              border: pathname === '/profile' ? '2px solid #60a5fa' : '2px solid transparent',
              overflow: 'hidden',
            }}>
              {!userAvatar && (userName ? userName.charAt(0).toUpperCase() : '?')}
            </div>
          </Link>
        </div>
      </div>

      {/* ===== BOTTOM NAV (Mobile only) ===== */}
      <div
        className="mobile-bottom-nav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid #1a1a1a',
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0 12px',
        }}
      >
        {[
          { href: '/', icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>) },
          { href: '/trending', icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>) },
          { href: '/categories', icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>) },
          { href: '/saved', icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>) },
          ...(loggedIn && isBrand ? [{
            href: '/dashboard',
            icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
          }] : []),
        ].map((item) => (
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
