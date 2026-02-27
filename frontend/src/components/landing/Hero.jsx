import { useEffect, useRef, useState } from 'react';
import './Hero.css';


const WORDS = ['Technologies', 'Innovations', 'Disruptions', 'Market Shifts', 'AI Trends'];

const Hero = ({ onGetStarted }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const countersStarted = useRef(false);

  // Typewriter Effect
  useEffect(() => {
    const word = WORDS[wordIdx];
    let timeout;
    if (typing) {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, wordIdx]);

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersStarted.current) {
          countersStarted.current = true;
          animateCounter(setCount1, 10000, 1800);
          animateCounter(setCount2, 500, 1600);
          animateCounter(setCount3, 99.9, 2000, true);
        }
      });
    }, { threshold: 0.5 });
    const el = document.querySelector('.hero-stats');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function animateCounter(
    setter,
    target,
    duration,
    isFloat = false
  ) {
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(isFloat ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Three.js-like neural network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const NODES = 80;
    const CONNECT_DIST = 130;
    const PULSE_NODES = 8;

    const colors = ['#6366f1', '#06b6d4', '#ec4899', '#818cf8', '#22d3ee'];
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    // Pulse particles
    const pulses = [];

    const addPulse = () => {
      const n1 = nodes[Math.floor(Math.random() * NODES)];
      const n2 = nodes[Math.floor(Math.random() * NODES)];
      const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
      if (dist < CONNECT_DIST) {
        pulses.push({ x: n1.x, y: n1.y, tx: n2.x, ty: n2.y, progress: 0, speed: 0.015 + Math.random() * 0.01, color: n1.color });
      }
    };

    let lastPulse = 0;

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      if (time - lastPulse > 200 && pulses.length < PULSE_NODES) {
        addPulse();
        lastPulse = time;
      }

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, nodes[i].color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(1, nodes[j].color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw pulse particles
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) { pulses.splice(i, 1); continue; }
        const px = p.x + (p.tx - p.x) * p.progress;
        const py = p.y + (p.ty - p.y) * p.progress;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulseFactor = 1 + Math.sin(n.pulse) * 0.3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formatCount = (n) => {
    if (n >= 10000) return '10K+';
    if (n >= 500) return '500+';
    return isFloat ? n.toFixed(1) + '%' : n.toString();
  };

  return (
    <section className="hero" id="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="container hero-inner">
        <div className="hero-text">
          <div className="section-tag reveal">
            <span className="tag-dot" />
            AI-Powered Intelligence Platform
          </div>

          <h1 className="hero-title reveal">
            Predict & Track
            <br />
            Emerging <span className="typewriter-word">{displayed}<span className="cursor">|</span></span>
          </h1>

          <p className="hero-subtitle reveal">
            Harness the power of machine learning to monitor technology landscapes,
            forecast industry disruptions, and make data-driven strategic decisions
            with unparalleled accuracy.
          </p>

          <div className="hero-actions reveal">
            <button className="btn-primary btn-hero" onClick={onGetStarted}>
              Start Free Trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline btn-hero-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16"/>
              </svg>
              Watch Demo
            </button>
          </div>

          <div className="hero-trust reveal">
            <div className="trust-avatars">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <div key={i} className="trust-avatar" style={{ background: ['#6366f1','#06b6d4','#ec4899','#f59e0b'][i] }}>{l}</div>
              ))}
            </div>
            <span className="trust-text">Trusted by <strong>500+</strong> enterprise teams</span>
          </div>
        </div>

        <div className="hero-visual">
          {/* 3D Dashboard Mockup */}
          <div className="dashboard-3d">
            <div className="dashboard-face front">
              <div className="dash-header">
                <div className="dash-dots">
                  <span style={{background:'#ff6b6b'}} />
                  <span style={{background:'#ffd93d'}} />
                  <span style={{background:'#6bcb77'}} />
                </div>
                <span className="dash-title">TechIntel Dashboard</span>
              </div>
              <div className="dash-chart">
                {[40, 65, 50, 80, 60, 90, 75, 95].map((h, i) => (
                  <div key={i} className="bar-wrap">
                    <div className="bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
              <div className="dash-metrics">
                <div className="metric">
                  <span className="metric-val gradient-text">+24.5%</span>
                  <span className="metric-lbl">AI Accuracy</span>
                </div>
                <div className="metric">
                  <span className="metric-val" style={{color:'#06b6d4'}}>8.7/10</span>
                  <span className="metric-lbl">Tech Score</span>
                </div>
                <div className="metric">
                  <span className="metric-val" style={{color:'#ec4899'}}>↑ Growing</span>
                  <span className="metric-lbl">Market</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="float-card fc-1">
            <div className="fc-icon">🤖</div>
            <div>
              <div className="fc-title">AI Analysis</div>
              <div className="fc-val">+24.5% Growth</div>
            </div>
          </div>
          <div className="float-card fc-2">
            <div className="fc-icon">📊</div>
            <div>
              <div className="fc-title">Trend Forecast</div>
              <div className="fc-val">Q2 2026 ↑</div>
            </div>
          </div>
          <div className="float-card fc-3">
            <div className="fc-icon">⚡</div>
            <div>
              <div className="fc-title">Processing</div>
              <div className="fc-val">Real-Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hero-stats container">
        <div className="stat-item reveal">
          <span className="stat-num gradient-text">{count1 >= 10000 ? '10K+' : count1}</span>
          <span className="stat-label">Technologies Tracked</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item reveal">
          <span className="stat-num" style={{color:'#06b6d4'}}>{count2 >= 500 ? '500+' : count2}</span>
          <span className="stat-label">Enterprise Clients</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item reveal">
          <span className="stat-num" style={{color:'#ec4899'}}>{count3}%</span>
          <span className="stat-label">Prediction Accuracy</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item reveal">
          <span className="stat-num" style={{color:'#f59e0b'}}>50+</span>
          <span className="stat-label">Industry Sectors</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
