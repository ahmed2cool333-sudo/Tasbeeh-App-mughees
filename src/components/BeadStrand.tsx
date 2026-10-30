import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BeadThemeId, BEAD_THEMES } from '../types/tasbih';

interface BeadStrandProps {
  count: number;
  theme: BeadThemeId;
  onIncrement: () => void;
  onDecrement?: () => void;
  disabled?: boolean;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  text: string;
}

export function BeadStrand({
  count,
  theme,
  onIncrement,
  onDecrement,
  disabled
}: BeadStrandProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<SVGGElement | null>(null);
  const touchZoneRef = useRef<HTMLDivElement | null>(null);

  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const currentOffsetRef = useRef<number>(count);
  const targetOffsetRef = useRef<number>(count);

  const dragStartXRef = useRef<number | null>(null);
  const dragAccumRef = useRef<number>(0);

  // Update target when count changes
  useEffect(() => {
    targetOffsetRef.current = count;
  }, [count]);

  const addParticle = useCallback((text = '+1') => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev.slice(-4), { id, x: 50 + (Math.random() * 8 - 4), y: 44, text }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 750);
  }, []);

  const handleZoneClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    // Only trigger increment if not dragging significantly
    if (Math.abs(dragAccumRef.current) < 15) {
      addParticle('+1');
      onIncrement();
    }
    dragAccumRef.current = 0;
  }, [disabled, onIncrement, addParticle]);

  // Touch and drag handlers for physical bead sliding
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    dragStartXRef.current = e.touches[0].clientX;
    dragAccumRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || dragStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartXRef.current;
    dragAccumRef.current = diff;

    // Provide visual drag feedback
    if (diff < -38) {
      // Swiped left = advance bead forward
      addParticle('+1');
      onIncrement();
      dragStartXRef.current = currentX;
      dragAccumRef.current = 0;
    } else if (diff > 38 && onDecrement && count > 0) {
      // Swiped right = slide back
      addParticle('-1');
      onDecrement();
      dragStartXRef.current = currentX;
      dragAccumRef.current = 0;
    }
  };

  const handleTouchEnd = () => {
    dragStartXRef.current = null;
  };

  // Continuous animation loop for smooth bead sliding
  useEffect(() => {
    let animId: number;
    const path = pathRef.current;
    const container = containerRef.current;

    if (!path || !container) return;

    const BEAD_SPACING = 31;
    let trackLength = 540;
    try {
      trackLength = path.getTotalLength() || 540;
    } catch {
      trackLength = 540;
    }
    const trackCenter = trackLength / 2;

    const currentTheme = BEAD_THEMES.find(t => t.id === theme) || BEAD_THEMES[0];

    const renderMovingBeads = () => {
      // Spring toward target offset
      const diff = targetOffsetRef.current - currentOffsetRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentOffsetRef.current += diff * 0.16;
      } else {
        currentOffsetRef.current = targetOffsetRef.current;
      }

      container.innerHTML = '';
      const curr = currentOffsetRef.current;

      const minVisibleIndex = Math.floor(curr - (trackCenter / BEAD_SPACING) - 2);
      const maxVisibleIndex = Math.ceil(curr + (trackCenter / BEAD_SPACING) + 2);

      for (let i = minVisibleIndex; i <= maxVisibleIndex; i++) {
        const distanceAlongCurve = trackCenter - (i - curr) * BEAD_SPACING;

        if (distanceAlongCurve < -20 || distanceAlongCurve > trackLength + 20) continue;

        let pt = { x: 220, y: 74 };
        try {
          pt = path.getPointAtLength(Math.max(0, Math.min(trackLength, distanceAlongCurve)));
        } catch {
          // fallback
        }

        const distFromCenter = Math.abs(distanceAlongCurve - trackCenter);
        const scaleFactor = Math.max(0, 1 - distFromCenter / 150);
        const radius = 9.5 + scaleFactor * 7.5;

        let opacity = 1;
        if (distanceAlongCurve < 55) opacity = Math.max(0, distanceAlongCurve / 55);
        if (distanceAlongCurve > trackLength - 55) opacity = Math.max(0, (trackLength - distanceAlongCurve) / 55);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('opacity', opacity.toFixed(2));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x.toString());
        circle.setAttribute('cy', pt.y.toString());
        circle.setAttribute('r', radius.toString());

        const isMilestoneBead = (Math.abs(i) % 11 === 0 && i !== 0);

        if (distFromCenter < 12) {
          circle.setAttribute('fill', 'url(#activeBeadGradient)');
          circle.setAttribute('filter', 'url(#superGlowFilter)');
        } else if (isMilestoneBead) {
          circle.setAttribute('fill', 'url(#amberBeadGradient)');
        } else if (distFromCenter < 52) {
          circle.setAttribute('fill', 'url(#themePrimaryGradient)');
        } else {
          circle.setAttribute('fill', 'url(#deepBeadGradient)');
        }

        // Realistic glassy glint reflection
        const glint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glint.setAttribute('cx', (pt.x - radius * 0.32).toString());
        glint.setAttribute('cy', (pt.y - radius * 0.32).toString());
        glint.setAttribute('r', (radius * 0.28).toString());
        glint.setAttribute('fill', '#ffffff');
        glint.setAttribute('opacity', distFromCenter < 12 ? '0.92' : '0.45');

        g.appendChild(circle);
        g.appendChild(glint);
        container.appendChild(g);
      }

      animId = requestAnimationFrame(renderMovingBeads);
    };

    animId = requestAnimationFrame(renderMovingBeads);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  const currentTheme = BEAD_THEMES.find(t => t.id === theme) || BEAD_THEMES[0];

  return (
    <div
      ref={touchZoneRef}
      onClick={handleZoneClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative z-10 w-full h-[135px] flex items-center justify-center cursor-pointer select-none touch-manipulation active:scale-[0.99] transition-transform duration-100"
      title="Tap or swipe to count dhikr"
    >
      {/* Tap Target Breathing Halo Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full border border-dashed border-[#f6d186]/45 animate-pulse-halo pointer-events-none" />

      {/* Floating Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className={`absolute pointer-events-none font-bold text-lg text-[#f6d186] animate-float-up z-30 drop-shadow-[0_0_10px_rgba(246,209,134,0.9)] ${
            p.text === '-1' ? 'text-amber-200' : 'text-[#f6d186]'
          }`}
        >
          {p.text}
        </div>
      ))}

      {/* SVG Bead String Track */}
      <svg
        ref={svgRef}
        viewBox="0 0 440 125"
        className="w-full h-full overflow-visible pointer-events-none"
      >
        <defs>
          {/* Active Center Glow Bead */}
          <radialGradient id="activeBeadGradient" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor={currentTheme.primaryColor} />
            <stop offset="70%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </radialGradient>

          {/* Theme Dynamic Gradient */}
          <radialGradient id="themePrimaryGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={currentTheme.gradientStopStart} />
            <stop offset="40%" stopColor={currentTheme.primaryColor} />
            <stop offset="85%" stopColor="#0f3d39" />
            <stop offset="100%" stopColor="#041a18" />
          </radialGradient>

          {/* Amber Milestone Bead */}
          <radialGradient id="amberBeadGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>

          {/* Deep Outer Beads */}
          <radialGradient id="deepBeadGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0b133b" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="superGlowFilter" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="goldRingFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sacred Arch String Track */}
        <path
          ref={pathRef}
          d="M -50,30 Q 220,118 490,30"
          fill="none"
          stroke="rgba(246, 209, 134, 0.35)"
          strokeWidth="2"
          strokeDasharray="3,3"
        />

        {/* Container for Dynamic Moving Beads */}
        <g ref={containerRef} />

        {/* Center Focal Halo Target Ring */}
        <g pointerEvents="none">
          <circle
            cx="220"
            cy="74"
            r="23"
            fill="none"
            stroke="#f6d186"
            strokeWidth="2"
            filter="url(#goldRingFilter)"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  );
}
