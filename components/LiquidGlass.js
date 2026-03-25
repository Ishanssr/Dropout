'use client';

import React from 'react';

/**
 * SVG Glass Distortion Filter — must be rendered once in the page.
 * Referenced by LiquidGlassPanel and LiquidGlassButton via CSS backdrop-filter.
 */
export function GlassFilter() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        {/* Panel-level glass distortion */}
        <filter
          id="liquid-glass-panel"
          x="0%" y="0%" width="100%" height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>

        {/* Button-level glass distortion (lighter) */}
        <filter
          id="liquid-glass-btn"
          x="0%" y="0%" width="100%" height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.001 0.005"
            numOctaves="1"
            seed="17"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap" surfaceScale="5"
            specularConstant="1" specularExponent="100"
            lightingColor="white" result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight" operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic" in2="softMap"
            scale="200"
            xChannelSelector="R" yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Liquid Glass Panel — wraps content in a glass-morphism container.
 * Uses SVG filter for distortion + layered inset shadows.
 */
export function LiquidGlassPanel({ children, className = '', style = {} }) {
  return (
    <div className={`liquid-glass-panel ${className}`} style={style}>
      {/* Glass distortion layer */}
      <div className="liquid-glass-panel-distortion" />
      {/* White overlay */}
      <div className="liquid-glass-panel-overlay" />
      {/* Inset shadow edges */}
      <div className="liquid-glass-panel-edges" />
      {/* Content */}
      <div className="liquid-glass-panel-content">
        {children}
      </div>
    </div>
  );
}

/**
 * Liquid Glass Button — wraps text/children in a glass button with distortion.
 */
export function LiquidGlassButton({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`liquid-glass-button ${className}`}
    >
      {/* Glass shadow layer */}
      <span className="liquid-glass-button-shadow" />
      {/* Distortion layer */}
      <span className="liquid-glass-button-distortion" />
      {/* Content */}
      <span className="liquid-glass-button-content">
        {children}
      </span>
    </button>
  );
}
