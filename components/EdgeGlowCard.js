'use client';

import { useRef, useCallback } from 'react';

/**
 * EdgeGlowCard — A card with edge-proximity glow effect.
 * Tracks cursor position and sets CSS vars for the glow.
 */
export default function EdgeGlowCard({ children, className = '', style = {}, onClick, href, ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Edge proximity (0 = center, 100 = edge)
    const edgeX = Math.max(1 - (x / w) * 2, (x / w) * 2 - 1);
    const edgeY = Math.max(1 - (y / h) * 2, (y / h) * 2 - 1);
    const proximity = Math.min(100, Math.max(0, Math.max(edgeX, edgeY) * 100));

    // Angle from center to cursor
    const angle = Math.atan2(y - h / 2, x - w / 2) * (180 / Math.PI) + 90;

    card.style.setProperty('--edge-proximity', proximity.toFixed(1));
    card.style.setProperty('--cursor-angle', `${angle.toFixed(1)}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--edge-proximity', '0');
  }, []);

  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={cardRef}
      className={`border-glow-card ${className}`}
      style={style}
      onClick={onClick}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </Tag>
  );
}
