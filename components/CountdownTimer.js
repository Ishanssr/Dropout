'use client';

import { useState, useEffect } from 'react';

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
    return <span className="text-blue-500 font-bold text-sm">LIVE NOW 🔥</span>;
  }

  const Block = ({ val, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-blue-500 font-bold text-lg tabular-nums leading-none">
        {String(val).padStart(2, '0')}
      </span>
      <span className="text-[#525252] text-[9px] uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      {time.d > 0 && (
        <>
          <Block val={time.d} label="d" />
          <span className="text-[#262626] font-bold text-lg leading-none">:</span>
        </>
      )}
      <Block val={time.h} label="h" />
      <span className="text-[#262626] font-bold text-lg leading-none">:</span>
      <Block val={time.m} label="m" />
      <span className="text-[#262626] font-bold text-lg leading-none">:</span>
      <Block val={time.s} label="s" />
    </div>
  );
}
