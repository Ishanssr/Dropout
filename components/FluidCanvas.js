'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive fluid/ripple canvas background.
 * Metaballs float and merge, responding to cursor movement.
 * Creates an organic, living-glass effect.
 */
export default function FluidCanvas({ className, style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: -500, y: -500 };
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Metaballs
    const balls = [];
    const NUM = 8;
    for (let i = 0; i < NUM; i++) {
      balls.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 80 + Math.random() * 120,
      });
    }

    function handleMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function handleTouch(e) {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    }
    function handleLeave() {
      mouse.x = -500;
      mouse.y = -500;
    }

    canvas.addEventListener('mousemove', handleMouse, { passive: true });
    canvas.addEventListener('touchmove', handleTouch, { passive: true });
    canvas.addEventListener('mouseleave', handleLeave);

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Update ball positions
      for (const b of balls) {
        // Drift
        b.x += b.vx;
        b.y += b.vy;

        // Mouse attraction
        const dx = mouse.x - b.x;
        const dy = mouse.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          b.x += dx * 0.008;
          b.y += dy * 0.008;
        }

        // Bounce
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;
      }

      // Render metaball field using ImageData
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      const step = 3; // pixel stepping for performance

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          let sum = 0;
          for (const b of balls) {
            const dx = x - b.x;
            const dy = y - b.y;
            sum += (b.r * b.r) / (dx * dx + dy * dy + 1);
          }

          if (sum > 1) {
            const alpha = Math.min((sum - 1) * 0.6, 1);
            // Gradient color: blue-purple
            const r = 90 + sum * 12;
            const g = 120 + sum * 15;
            const b2 = 220 + sum * 10;

            // Fill the step×step block
            for (let sy = 0; sy < step && y + sy < height; sy++) {
              for (let sx = 0; sx < step && x + sx < width; sx++) {
                const idx = ((y + sy) * width + (x + sx)) * 4;
                data[idx] = Math.min(r, 255);
                data[idx + 1] = Math.min(g, 255);
                data[idx + 2] = Math.min(b2, 255);
                data[idx + 3] = alpha * 50;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto',
        ...style,
      }}
    />
  );
}
