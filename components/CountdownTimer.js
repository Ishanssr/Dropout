'use client';

import { useState, useEffect } from 'react';

function TimeBlock({ val, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{
        color: '#3b82f6', fontWeight: 700, fontSize: '17px',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em',
      }}>
        {String(val).padStart(2, '0')}
      </span>
      <span style={{
        color: 'var(--text-muted)', fontSize: '8px', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginTop: '3px', fontWeight: 500,
      }}>{label}</span>
    </div>
  );
}

export default function CountdownTimer({ dropTime }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = new Date(dropTime) - new Date();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0, expired: true });
      setTime({
        expired: false,
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [dropTime]);

  if (time.expired) {
    return (
      <span style={{
        color: '#3b82f6', fontWeight: 700, fontSize: '13px',
        fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em',
      }}>LIVE NOW 🔥</span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {time.d > 0 && (
        <>
          <TimeBlock val={time.d} label="d" />
          <span style={{ color: 'rgba(255,255,255,0.12)', fontWeight: 600, fontSize: '16px', lineHeight: 1 }}>:</span>
        </>
      )}
      <TimeBlock val={time.h} label="h" />
      <span style={{ color: 'rgba(255,255,255,0.12)', fontWeight: 600, fontSize: '16px', lineHeight: 1 }}>:</span>
      <TimeBlock val={time.m} label="m" />
      <span style={{ color: 'rgba(255,255,255,0.12)', fontWeight: 600, fontSize: '16px', lineHeight: 1 }}>:</span>
      <TimeBlock val={time.s} label="s" />
    </div>
  );
}
