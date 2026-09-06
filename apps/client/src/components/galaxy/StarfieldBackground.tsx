import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const colors = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8'];

    // Pre-render radial gradient circular stamps to avoid per-frame ctx.shadowBlur rasterization (Medium 1)
    const stampCanvases = new Map<string, HTMLCanvasElement>();
    for (const color of colors) {
      const stamp = document.createElement('canvas');
      stamp.width = 32;
      stamp.height = 32;
      const sCtx = stamp.getContext('2d');
      if (sCtx) {
        const radG = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        radG.addColorStop(0, color);
        radG.addColorStop(0.2, color);
        radG.addColorStop(0.5, 'rgba(255,255,255,0.4)');
        radG.addColorStop(1, 'rgba(255,255,255,0)');
        sCtx.fillStyle = radG;
        sCtx.fillRect(0, 0, 32, 32);
      }
      stampCanvases.set(color, stamp);
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    // Create 200 monochromatic micro-stars (deep-space pinpoints)
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 0.9 + 0.4,
        alpha: Math.random() * 0.7 + 0.25,
        twinkleSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw each twinkling star using pre-rendered canvas stamps
      for (const s of stars) {
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.2) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
        const stamp = stampCanvases.get(s.color);
        if (stamp) {
          const size = s.radius * 6;
          ctx.drawImage(stamp, s.x - size / 2, s.y - size / 2, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
