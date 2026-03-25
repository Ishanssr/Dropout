'use client';

import React from 'react';

/**
 * SVG Glass Distortion Filter — only used by LiquidGlassButton.
 */
export function GlassFilter() {
  return (
    <svg style={{ display: 'none' }}>
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/**
 * GlassPanelLayers — for sidebar & tabs.
 * Visible frosted glass with bright inset edge highlights.
 */
export function GlassPanelLayers() {
  return (
    <>
      {/* Frosted blur */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        borderRadius: 'inherit',
        backdropFilter: 'blur(20px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
        pointerEvents: 'none',
      }} />
      {/* Top gradient glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        borderRadius: 'inherit',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 30%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Visible inset edge highlights */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        borderRadius: 'inherit',
        boxShadow:
          'inset 1px 1px 0 rgba(255,255,255,0.12), ' +
          'inset -1px -1px 0 rgba(255,255,255,0.05), ' +
          'inset 0 1px 0 rgba(255,255,255,0.15), ' +
          'inset 0 0 8px 2px rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />
    </>
  );
}

/**
 * Liquid Glass Button — pill button with multi-shadow glass bubble.
 * This is the CSS-shadow approach that works reliably on all platforms.
 */
export function LiquidGlassButton({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`liquid-glass-button ${className}`}
    >
      <span className="liquid-glass-button-content">
        {children}
      </span>
    </button>
  );
}
