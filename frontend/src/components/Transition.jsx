/**
 * Transition.jsx — Full-screen animated loader between landing → dashboard
 */

import { useEffect, useRef } from 'react';
import './Transition.css';

export default function Transition() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 2 + 0.5,
      color: ['#6366f1','#06b6d4','#ec4899','#818cf8','#22d3ee'][Math.floor(Math.random()*5)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw connections
        particles.forEach(q => {
          const d = Math.hypot(p.x-q.x, p.y-q.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.color + Math.round((1 - d/100) * 0.2 * 255).toString(16).padStart(2,'0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="transition-screen">
      <canvas ref={canvasRef} className="transition-canvas" />
      <div className="transition-content">
        <div className="transition-logo">
          <svg width="64" height="64" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#tg)" opacity="0.2"/>
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#tg)" strokeWidth="1.5" fill="none"/>
            <circle cx="14" cy="14" r="3" fill="url(#tg)"/>
            <line x1="14" y1="2" x2="14" y2="11" stroke="url(#tg)" strokeWidth="1"/>
            <line x1="24" y1="8" x2="17.6" y2="11.5" stroke="url(#tg)" strokeWidth="1"/>
            <line x1="4" y1="8" x2="10.4" y2="11.5" stroke="url(#tg)" strokeWidth="1"/>
          </svg>
        </div>
        <h2 className="transition-title">Tech_Intel</h2>
        <p className="transition-sub">Initialising Intelligence Pipeline…</p>
        <div className="transition-bar">
          <div className="transition-bar-fill" />
        </div>
        <div className="transition-steps">
          <span className="t-step">✓ Authenticating</span>
          <span className="t-step t-step-active">⟳ Loading AI Models</span>
          <span className="t-step t-step-dim">◌ Syncing Data</span>
        </div>
      </div>
    </div>
  );
}
