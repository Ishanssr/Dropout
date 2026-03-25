'use client';

import React from 'react';

/**
 * SVG Glass Distortion Filter — renders once per page.
 * Only used by GlassEffect on small elements (buttons, CTAs).
 */
export function GlassFilter() {
  return (
    <svg style={{ display: 'none' }}>
      <filter
        id="glass-distortion"
        x="0%" y="0%" width="100%" height="100%"
        filterUnits="objectBoundingBox"
      >
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
 * GlassPanelLayers — for LARGE panels (sidebar, tab bars, modals).
 * Clean frosted glass: backdrop-blur + white tint + inset edge highlights.
 * NO SVG distortion filter (it destroys text readability on large surfaces).
 */
export function GlassPanelLayers() {
  return (
    <>
      {/* Layer 1: Frosted blur */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        borderRadius: 'inherit',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        pointerEvents: 'none',
      }} />
      {/* Layer 2: Subtle white tint */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        borderRadius: 'inherit',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        pointerEvents: 'none',
      }} />
      {/* Layer 3: Inset edge highlights */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        borderRadius: 'inherit',
        boxShadow:
          'inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />
    </>
  );
}

/**
 * GlassLayers — for SMALL elements (buttons, pills).
 * Uses SVG distortion filter for the full liquid glass effect.
 * DO NOT use on large panels — it will mangle text content.
 */
export function GlassLayers() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        overflow: 'hidden', borderRadius: 'inherit',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        filter: 'url(#glass-distortion)',
        isolation: 'isolate',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        borderRadius: 'inherit',
        background: 'rgba(255, 255, 255, 0.06)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        borderRadius: 'inherit', overflow: 'hidden',
        boxShadow: 'inset 2px 2px 1px 0 rgba(255,255,255,0.12), inset -1px -1px 1px 1px rgba(255,255,255,0.08)',
      }} />
    </>
  );
}

/**
 * GlassEffect wrapper — for small interactive elements (buttons, CTAs).
 * Wraps children with full glass layers including SVG distortion.
 */
export function GlassEffect({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.7s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        boxShadow: '0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      <GlassLayers />
      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Liquid Glass Button — pill-shaped glass button for forms.
 */
export function LiquidGlassButton({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`liquid-glass-button ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '999px',
        padding: '14px 32px',
        fontFamily: "'Sora', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        color: 'rgba(240,237,232,0.9)',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.7s cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        minHeight: '50px',
        boxShadow: '0 6px 6px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)',
      }}
    >
      <GlassLayers />
      <span style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </button>
  );
}
