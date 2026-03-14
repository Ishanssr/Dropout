'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ dropTime, size = 'default' }) {
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
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="font-bold text-[#10b981] text-sm uppercase tracking-wider">DROPPED!</span>
      </div>
    );
  }

  const isSmall = size === 'small';

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${isSmall ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'}
          rounded-xl font-bold flex items-center justify-center
          bg-[#0a0a1a] border border-[#1a1a3e]
          text-[#60a5fa]
        `}
        style={{
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)',
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} text-[#6b7280] mt-1 uppercase tracking-wider font-medium`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {timeLeft.days > 0 && <TimeBlock value={timeLeft.days} label="Days" />}
      <TimeBlock value={timeLeft.hours} label="Hrs" />
      <span className={`${isSmall ? 'text-lg' : 'text-xl'} text-[#3b82f6] font-bold self-start mt-2`}>:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className={`${isSmall ? 'text-lg' : 'text-xl'} text-[#3b82f6] font-bold self-start mt-2`}>:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
