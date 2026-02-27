/**
 * LandingPage.jsx — Full marketing landing page for Tech_Intel
 */

import { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

/* ─── Header ──────────────────────────────────────────────────── */
function Header({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`lp-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container lp-header-inner">
        {/* Logo */}
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="hLogoG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#hLogoG)" opacity="0.2"/>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#hLogoG)" strokeWidth="1.5" fill="none"/>
              <circle cx="14" cy="14" r="3" fill="url(#hLogoG)"/>
              <line x1="14" y1="2" x2="14" y2="11" stroke="url(#hLogoG)" strokeWidth="1"/>
              <line x1="24" y1="8" x2="17.6" y2="11.5" stroke="url(#hLogoG)" strokeWidth="1"/>
              <line x1="4" y1="8" x2="10.4" y2="11.5" stroke="url(#hLogoG)" strokeWidth="1"/>
            </svg>
          </div>
          <span className="lp-logo-text">Tech_Intel</span>
          <span className="lp-logo-badge">AI</span>
        </div>

        {/* Nav */}
        <nav className={`lp-nav ${menuOpen ? 'open' : ''}`}>
          {['Features','How It Works','Pricing','Clients','Contact'].map(n => (
            <a key={n} href={`#${n.toLowerCase().replace(/\s/g,'-')}`}
               onClick={() => setMenuOpen(false)}>{n}</a>
          ))}
        </nav>

        {/* Actions */}
        <div className="lp-header-actions">
          <button className="btn-secondary btn-sm" onClick={onLogin}>Sign In</button>
          <button className="btn-primary btn-sm" onClick={onSignup}>
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Mobile toggle */}
        <button className={`lp-menu-btn ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
const TYPEWORDS = ['Technologies','Innovations','Disruptions','Market Shifts','AI Trends'];

function Hero({ onGetStarted }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(0);
  const [wordIdx, setWordIdx]   = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping]     = useState(true);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const countersStarted = useRef(false);

  /* Typewriter */
  useEffect(() => {
    const word = TYPEWORDS[wordIdx];
    let t;
    if (typing) {
      if (displayed.length < word.length)
        t = setTimeout(() => setDisplayed(word.slice(0, displayed.length+1)), 80);
      else
        t = setTimeout(() => setTyping(false), 2000);
    } else {
      if (displayed.length > 0)
        t = setTimeout(() => setDisplayed(displayed.slice(0,-1)), 40);
      else { setWordIdx(i => (i+1) % TYPEWORDS.length); setTyping(true); }
    }
    return () => clearTimeout(t);
  }, [displayed, typing, wordIdx]);

  /* Counters */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !countersStarted.current) {
          countersStarted.current = true;
          animate(setCount1, 10000, 1800);
          animate(setCount2, 500,   1600);
          animate(setCount3, 99.9,  2000, true);
        }
      });
    }, { threshold: 0.5 });
    const el = document.querySelector('.hero-stats');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function animate(setter, target, duration, isFloat=false) {
    const start = performance.now();
    const step = now => {
      const p = Math.min((now-start)/duration,1);
      const e = 1 - Math.pow(1-p,3);
      setter(isFloat ? parseFloat((e*target).toFixed(1)) : Math.round(e*target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Neural network canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const colors = ['#6366f1','#06b6d4','#ec4899','#818cf8','#22d3ee'];
    const nodes = Array.from({length:80}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4,
      r: Math.random()*2.5+1,
      color: colors[Math.floor(Math.random()*5)],
      pulse: Math.random()*Math.PI*2, pulseSpeed: 0.02+Math.random()*0.03,
    }));

    const pulses = [];
    let lastPulse = 0;

    const addPulse = () => {
      const n1 = nodes[Math.floor(Math.random()*80)];
      const n2 = nodes[Math.floor(Math.random()*80)];
      if (Math.hypot(n1.x-n2.x, n1.y-n2.y) < 130)
        pulses.push({x:n1.x,y:n1.y,tx:n2.x,ty:n2.y,progress:0,speed:.015+Math.random()*.01,color:n1.color});
    };

    const draw = time => {
      ctx.clearRect(0,0,W,H);
      if (time - lastPulse > 200 && pulses.length < 8) { addPulse(); lastPulse=time; }
      nodes.forEach(n => {
        n.x+=n.vx; n.y+=n.vy; n.pulse+=n.pulseSpeed;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
      });
      for (let i=0;i<80;i++) for(let j=i+1;j<80;j++) {
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<130){
          const a=(1-d/130)*.25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          const g=ctx.createLinearGradient(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y);
          g.addColorStop(0,nodes[i].color+Math.round(a*255).toString(16).padStart(2,'0'));
          g.addColorStop(1,nodes[j].color+Math.round(a*255).toString(16).padStart(2,'0'));
          ctx.strokeStyle=g; ctx.lineWidth=0.8; ctx.stroke();
        }
      }
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i]; p.progress+=p.speed;
        if(p.progress>=1){pulses.splice(i,1);continue;}
        const px=p.x+(p.tx-p.x)*p.progress, py=p.y+(p.ty-p.y)*p.progress;
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
      }
      nodes.forEach(n=>{
        const pf=1+Math.sin(n.pulse)*.3;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pf,0,Math.PI*2);
        ctx.fillStyle=n.color; ctx.shadowColor=n.color; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      W=canvas.offsetWidth; H=canvas.offsetHeight;
      canvas.width=W; canvas.height=H;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',onResize); };
  }, []);

  return (
    <section className="lp-hero" id="hero">
      <canvas ref={canvasRef} className="hero-canvas"/>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      <div className="container hero-inner">
        <div className="hero-text">
          <div className="section-tag reveal">
            <span className="tag-dot"/>
            AI-Powered Intelligence Platform
          </div>

          <h1 className="hero-title reveal">
            Predict &amp; Track<br/>
            Emerging <span className="typewriter-word">{displayed}<span className="cursor">|</span></span>
          </h1>

          <p className="hero-subtitle reveal">
            Harness machine learning to monitor technology landscapes, forecast
            industry disruptions, and make data-driven strategic decisions with
            unparalleled accuracy.
          </p>

          <div className="hero-actions reveal">
            <button className="btn-primary btn-hero" onClick={onGetStarted}>
              Get Started — It's Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline btn-hero-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/>
              </svg>
              Watch Demo
            </button>
          </div>

          <div className="hero-trust reveal">
            <div className="trust-avatars">
              {['A','B','C','D'].map((l,i) => (
                <div key={i} className="trust-avatar" style={{background:['#6366f1','#06b6d4','#ec4899','#f59e0b'][i]}}>{l}</div>
              ))}
            </div>
            <span className="trust-text">Trusted by <strong>500+</strong> enterprise teams</span>
          </div>
        </div>

        {/* 3D Dashboard Mockup */}
        <div className="hero-visual">
          <div className="dashboard-3d">
            <div className="dashboard-face">
              <div className="dash-titlebar">
                <div className="dash-dots">
                  <span style={{background:'#ff6b6b'}}/><span style={{background:'#ffd93d'}}/><span style={{background:'#6bcb77'}}/>
                </div>
                <span className="dash-name">Tech_Intel Dashboard</span>
              </div>
              <div className="dash-chart">
                {[40,65,50,80,60,90,75,95].map((h,i) => (
                  <div key={i} className="bar-wrap">
                    <div className="bar" style={{height:`${h}%`,animationDelay:`${i*0.1}s`}}/>
                  </div>
                ))}
              </div>
              <div className="dash-metrics">
                <div className="metric"><span className="metric-val gradient-text">+24.5%</span><span className="metric-lbl">AI Accuracy</span></div>
                <div className="metric"><span className="metric-val" style={{color:'#06b6d4'}}>8.7/10</span><span className="metric-lbl">Tech Score</span></div>
                <div className="metric"><span className="metric-val" style={{color:'#ec4899'}}>↑ Growing</span><span className="metric-lbl">Market</span></div>
              </div>
            </div>
          </div>
          {/* Floating cards */}
          <div className="float-card fc-1"><div className="fc-icon">🤖</div><div><div className="fc-title">AI Analysis</div><div className="fc-val">+24.5% Growth</div></div></div>
          <div className="float-card fc-2"><div className="fc-icon">📊</div><div><div className="fc-title">Trend Forecast</div><div className="fc-val">Q2 2026 ↑</div></div></div>
          <div className="float-card fc-3"><div className="fc-icon">⚡</div><div><div className="fc-title">Processing</div><div className="fc-val">Real-Time</div></div></div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats container">
        {[
          {val: count1>=10000?'10K+':count1, label:'Technologies Tracked', color:'var(--primary-light)'},
          {val: count2>=500?'500+':count2,   label:'Enterprise Clients',   color:'#06b6d4'},
          {val: `${count3}%`,                label:'Prediction Accuracy',  color:'#ec4899'},
          {val: '50+',                        label:'Industry Sectors',     color:'#f59e0b'},
        ].map((s,i) => (
          <>
            {i > 0 && <div className="stat-divider" key={`d${i}`}/>}
            <div className="stat-item reveal" key={s.label}>
              <span className="stat-num" style={{color:s.color}}>{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </>
        ))}
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────── */
const FEATURES = [
  {icon:'📡',title:'Real-Time Tech Tracking',desc:'Monitor 10,000+ emerging technologies across industries with live data feeds, patent filings, and research publications.',tag:'Live Data',color:'#6366f1'},
  {icon:'🧠',title:'AI-Powered Forecasting',desc:'Deep learning models analyze patterns across millions of data points to forecast technology adoption curves and market disruptions.',tag:'Machine Learning',color:'#06b6d4'},
  {icon:'🔭',title:'Competitive Intelligence',desc:'Track competitor investments, partnerships, and R&D activities. Understand the competitive landscape before your rivals do.',tag:'Strategic',color:'#ec4899'},
  {icon:'⚡',title:'Lightning Performance',desc:'Process terabytes of data in milliseconds with our distributed cloud infrastructure. No lag, no limits.',tag:'Infrastructure',color:'#f59e0b'},
  {icon:'🔐',title:'Enterprise Security',desc:'Military-grade AES-256 encryption, SOC2 Type II certified, GDPR compliant. Your data is always protected.',tag:'Security',color:'#10b981'},
  {icon:'🔗',title:'Seamless Integration',desc:'Connect with 200+ tools via REST API, webhooks, and native integrations. Plug into your existing workflow instantly.',tag:'Integration',color:'#8b5cf6'},
];

function Features() {
  return (
    <section id="features" className="lp-features">
      <div className="features-bg-glow"/>
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">⚡ Platform Features</div>
          <h2 className="section-title reveal">Everything You Need to Stay <span className="gradient-text">Ahead</span></h2>
          <p className="section-subtitle reveal">A comprehensive suite of AI tools designed to give technology leaders an unfair competitive advantage.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f,i) => (
            <div key={i} className="feature-card reveal" style={{transitionDelay:`${i*.08}s`,'--ac':f.color}}>
              <div className="feature-icon-wrap" style={{background:`${f.color}15`,border:`1px solid ${f.color}30`}}>
                <span className="feature-icon">{f.icon}</span>
              </div>
              <div className="feature-tag" style={{color:f.color,background:`${f.color}10`,border:`1px solid ${f.color}20`}}>{f.tag}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-arrow" style={{color:f.color}}>
                Learn more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div className="feature-glow" style={{background:`radial-gradient(circle at 50% 100%, ${f.color}15, transparent 70%)`}}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────── */
const STEPS = [
  {n:'01',icon:'🔌',title:'Connect Your Data Sources',desc:'Integrate with existing data pipelines, research feeds, and market databases. Set up in minutes with our zero-code connectors.',color:'#6366f1'},
  {n:'02',icon:'🧠',title:'AI Engine Analyzes Signals',desc:'Our proprietary ML algorithms continuously scan millions of signals — patents, papers, funding rounds, social chatter — to detect trends before they go mainstream.',color:'#06b6d4'},
  {n:'03',icon:'📊',title:'Receive Forecasts & Insights',desc:'Get personalized dashboards with actionable intelligence, trend scores, and confidence-rated predictions tailored to your industry vertical.',color:'#ec4899'},
  {n:'04',icon:'🚀',title:'Execute Data-Driven Strategy',desc:'Turn intelligence into action. Share reports, set automated alerts, and integrate findings into your strategic planning workflow.',color:'#f59e0b'},
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-how">
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">⚙️ Process</div>
          <h2 className="section-title reveal">From Data to <span className="gradient-text">Intelligence</span> in 4 Steps</h2>
          <p className="section-subtitle reveal">A streamlined workflow that transforms raw data into strategic advantage.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s,i) => (
            <div key={i} className="step-card reveal" style={{transitionDelay:`${i*.1}s`}}>
              <div className="step-num-wrap" style={{background:`${s.color}15`,border:`1px solid ${s.color}30`}}>
                <span className="step-num" style={{color:s.color}}>{s.n}</span>
              </div>
              {i<3 && <div className="step-line" style={{background:`linear-gradient(90deg,${s.color},${STEPS[i+1].color})`}}/>}
              <div className="step-icon" style={{color:s.color}}>{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="integrations-box reveal">
          <div><h3>Works With Your Entire Stack</h3><p>Native integrations with 200+ tools and platforms</p></div>
          <div className="integrations-logos">
            {[{i:'📊',n:'Analytics'},{i:'☁️',n:'AWS/GCP'},{i:'🗄️',n:'Databases'},{i:'📧',n:'Slack'},{i:'🔗',n:'REST API'},{i:'⚙️',n:'Zapier'},{i:'📈',n:'Tableau'},{i:'🤖',n:'OpenAI'}].map((x,j) => (
              <div key={j} className="integration-chip"><span>{x.i}</span><span>{x.n}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─────────────────────────────────────────────────── */
const PLANS = [
  {name:'Starter',monthly:49,annual:39,desc:'Perfect for individual analysts exploring tech intelligence.',features:['500 technologies tracked','Monthly trend reports','Basic AI predictions','3 user seats','Email support','API access (1K calls/mo)'],cta:'Get Started',color:'#6366f1',popular:false},
  {name:'Professional',monthly:149,annual:119,desc:'For growing teams that need deep insights and real-time intelligence.',features:['5,000 technologies tracked','Weekly AI-powered forecasts','Advanced trend predictions','15 user seats','Priority support & SLA','API access (50K calls/mo)','Custom dashboards','Slack & Teams integration'],cta:'Start Free Trial',color:'#06b6d4',popular:true},
  {name:'Enterprise',monthly:499,annual:399,desc:'Full-scale deployment for large organizations requiring maximum power.',features:['Unlimited technologies','Real-time AI forecasting','Custom ML model training','Unlimited user seats','Dedicated success manager','Unlimited API access','White-label reports','On-premise deployment','SSO & advanced security'],cta:'Contact Sales',color:'#ec4899',popular:false},
];

function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" className="lp-pricing">
      <div className="pricing-bg-glow"/>
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">💎 Pricing</div>
          <h2 className="section-title reveal">Transparent, <span className="gradient-text">Scalable</span> Pricing</h2>
          <p className="section-subtitle reveal">Start free, scale as you grow. No hidden fees, no surprises.</p>
          <div className="pricing-toggle reveal">
            <span className={!annual?'active':''}>Monthly</span>
            <button className={`toggle-btn ${annual?'annual':''}`} onClick={()=>setAnnual(!annual)}>
              <span className="toggle-thumb"/>
            </button>
            <span className={annual?'active':''}>Annual <span className="save-badge">Save 20%</span></span>
          </div>
        </div>
        <div className="pricing-grid">
          {PLANS.map((p,i) => (
            <div key={i} className={`pricing-card reveal ${p.popular?'popular':''}`} style={{transitionDelay:`${i*.1}s`}}>
              {p.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name" style={{color:p.color}}>{p.name}</h3>
              <p className="plan-desc">{p.desc}</p>
              <div className="plan-price">
                <span className="price-cur">$</span>
                <span className="price-amt">{annual?p.annual:p.monthly}</span>
                <span className="price-per">/mo</span>
              </div>
              {annual && <p className="price-billed">Billed annually · Save ${(p.monthly-p.annual)*12}/yr</p>}
              <ul className="plan-features">
                {p.features.map((f,j) => (
                  <li key={j}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={p.popular?'btn-primary plan-btn':'btn-outline plan-btn'} onClick={onGetStarted}
                style={p.popular?{}:{borderColor:p.color,color:p.color}}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */
const TESTIMONIALS = [
  {name:'Sarah Chen',role:'CTO, Nexus Ventures',avatar:'S',color:'#6366f1',quote:'Tech_Intel transformed how we evaluate technology investments. The AI forecasting is incredibly accurate — we caught the rise of edge computing 18 months before it went mainstream.'},
  {name:'Marcus Rodriguez',role:'VP Strategy, TechCore',avatar:'M',color:'#06b6d4',quote:'The competitive intelligence features alone are worth 10x the subscription price. We now know what our competitors are investing in before they announce it publicly.'},
  {name:'Emily Watson',role:'Head of Innovation, FutureLabs',avatar:'E',color:'#ec4899',quote:'The predictive accuracy is remarkable. Tech_Intel predicted three of our top five technology shifts this year with precision we\'ve never seen from any competitor.'},
];

function Testimonials() {
  return (
    <section id="clients" className="lp-testimonials">
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">⭐ Testimonials</div>
          <h2 className="section-title reveal">Trusted by <span className="gradient-text">Industry Leaders</span></h2>
          <p className="section-subtitle reveal">See what technology executives say about Tech_Intel.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t,i) => (
            <div key={i} className="testimonial-card reveal" style={{transitionDelay:`${i*.1}s`}}>
              <div className="stars">{'★'.repeat(5)}</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{background:t.color}}>{t.avatar}</div>
                <div><div className="author-name">{t.name}</div><div className="author-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────────── */
function CTA({ onGetStarted }) {
  return (
    <section id="contact" className="lp-cta">
      <div className="cta-orb-1"/><div className="cta-orb-2"/>
      <div className="container cta-inner">
        <div className="cta-content reveal">
          <div className="section-tag" style={{justifyContent:'center'}}>🚀 Get Started Today</div>
          <h2 className="cta-title">Ready to Transform Your<br/><span className="gradient-text">Technology Strategy?</span></h2>
          <p className="cta-subtitle">Join 500+ leading companies using Tech_Intel to predict, plan, and prosper. Start free — no credit card required.</p>
          <div className="cta-actions">
            <button className="btn-primary cta-btn" onClick={onGetStarted}>
              Start Free 30-Day Trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn-outline cta-btn-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Schedule a Demo
            </button>
          </div>
          <div className="cta-assurances">
            {['No credit card required','30-day free trial','Cancel anytime','SOC2 Certified'].map((a,i) => (
              <div key={i} className="assurance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="container lp-footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <defs><linearGradient id="fLG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#fLG)" opacity="0.2"/>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#fLG)" strokeWidth="1.5" fill="none"/>
              <circle cx="14" cy="14" r="3" fill="url(#fLG)"/>
            </svg>
            <span>Tech_Intel</span>
          </div>
          <p className="footer-tagline">The world's most advanced AI-powered technology intelligence and forecasting platform for enterprise teams.</p>
        </div>
        {[
          {h:'Product',links:['Features','Pricing','Security','Documentation','Changelog']},
          {h:'Solutions',links:['Tech Forecasting','Market Analysis','Competitive Intel','Patent Tracking']},
          {h:'Company',links:['About Us','Blog','Careers','Contact']},
          {h:'Legal',links:['Privacy Policy','Terms of Service','Cookie Policy','GDPR']},
        ].map(g => (
          <div key={g.h} className="footer-group">
            <h5>{g.h}</h5>
            <ul>{g.links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Tech_Intel Inc. All rights reserved.</p>
          <p className="footer-built">
            Built with ❤️ using React &amp; Three.js
            <span className="footer-dot">·</span>
            <span className="footer-status"><span className="status-dot"/>All systems operational</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── LandingPage (main export) ──────────────────────────────── */
export default function LandingPage({ onLogin, onSignup, onGetStarted }) {
  return (
    <>
      <Header onLogin={onLogin} onSignup={onSignup}/>
      <main>
        <Hero onGetStarted={onGetStarted}/>
        <Features/>
        <HowItWorks/>
        <Pricing onGetStarted={onGetStarted}/>
        <Testimonials/>
        <CTA onGetStarted={onGetStarted}/>
      </main>
      <Footer/>
    </>
  );
}
