'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ dropTime }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    function calculate() {
      const diff = new Date(dropTime) - new Date();
      if (diff <= 0) {
        setTimeLeft({ expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        expired: false,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [dropTime]);

  if (timeLeft.expired) {
    return <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>LIVE NOW 🔥</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {timeLeft.days > 0 && (
        <>
          <div className="countdown-block">
            <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="countdown-label">d</span>
          </div>
          <span className="countdown-sep">:</span>
        </>
      )}
      <div className="countdown-block">
        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">h</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-block">
        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">m</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-block">
        <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">s</span>
      </div>
    </div>
  );
}
