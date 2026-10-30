import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  twinkleSpeed: number;
}

interface Firefly {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  phase: number;
}

export function CelestialSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let fireflies: Firefly[] = [];

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      // Generate stars
      stars = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 3000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.75),
          r: Math.random() * 1.6 + 0.4,
          alpha: Math.random() * 0.85 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.005
        });
      }

      // Generate fireflies
      fireflies = [];
      const fireflyCount = Math.min(26, Math.max(14, Math.floor(canvas.width / 18)));
      for (let i = 0; i < fireflyCount; i++) {
        fireflies.push({
          x: Math.random() * canvas.width,
          y: canvas.height * 0.58 + Math.random() * (canvas.height * 0.38),
          r: Math.random() * 2.2 + 1,
          color: Math.random() > 0.4 ? '#f6d186' : '#2ee6d6',
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.35,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Stars
      for (const s of stars) {
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 1 || s.alpha < 0.15) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha).toFixed(2)})`;
        ctx.shadowColor = '#d9e7ff';
        ctx.shadowBlur = s.r > 1.2 ? 6 : 0;
        ctx.fill();
      }

      // Render drifting fireflies
      for (const f of fireflies) {
        f.x += f.vx;
        f.y += f.vy;
        f.phase += 0.04;

        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;
        if (f.y < canvas.height * 0.55) f.y = canvas.height * 0.95;
        if (f.y > canvas.height) f.y = canvas.height * 0.58;

        const glowAlpha = (Math.sin(f.phase) + 1) / 2 * 0.8 + 0.15;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = glowAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}
