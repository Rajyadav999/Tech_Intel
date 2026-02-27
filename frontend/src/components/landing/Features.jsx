
import './Features.css';


const Features = () => {
  const features = [
    {
      id: 1,
      icon: '📡',
      title: 'Real-Time Tech Tracking',
      description: 'Monitor 10,000+ emerging technologies across industries with live data feeds, patent filings, and research publications.',
      tag: 'Live Data',
      color: '#6366f1',
    },
    {
      id: 2,
      icon: '🧠',
      title: 'AI-Powered Forecasting',
      description: 'Deep learning models analyze patterns across millions of data points to forecast technology adoption curves and market disruptions.',
      tag: 'Machine Learning',
      color: '#06b6d4',
    },
    {
      id: 3,
      icon: '🔭',
      title: 'Competitive Intelligence',
      description: 'Track competitor investments, partnerships, and R&D activities. Understand the competitive landscape before your rivals do.',
      tag: 'Strategic',
      color: '#ec4899',
    },
    {
      id: 4,
      icon: '⚡',
      title: 'Lightning Performance',
      description: 'Process terabytes of data in milliseconds with our distributed cloud infrastructure. No lag, no limits.',
      tag: 'Infrastructure',
      color: '#f59e0b',
    },
    {
      id: 5,
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'Military-grade AES-256 encryption, SOC2 Type II certified, GDPR compliant. Your data is always protected.',
      tag: 'Security',
      color: '#10b981',
    },
    {
      id: 6,
      icon: '🔗',
      title: 'Seamless Integration',
      description: 'Connect with 200+ tools via REST API, webhooks, and native integrations. Plug into your existing workflow instantly.',
      tag: 'Integration',
      color: '#8b5cf6',
    },
  ];

  return (
    <section id="features" className="features">
      <div className="features-bg-glow" />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">⚡ Platform Features</div>
          <h2 className="section-title reveal">
            Everything You Need to Stay <span className="gradient-text">Ahead</span>
          </h2>
          <p className="section-subtitle reveal">
            A comprehensive suite of AI tools designed to give technology leaders an
            unfair competitive advantage.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.id}
              className="feature-card reveal"
              style={{ transitionDelay: `${i * 0.08}s`, '--accent-color': f.color }}
            >
              <div className="feature-icon-wrap" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                <span className="feature-icon">{f.icon}</span>
              </div>
              <div className="feature-tag" style={{ color: f.color, background: `${f.color}10`, border: `1px solid ${f.color}20` }}>
                {f.tag}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
              <div className="feature-arrow" style={{ color: f.color }}>
                Learn more
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div className="feature-glow" style={{ background: `radial-gradient(circle at 50% 100%, ${f.color}15, transparent 70%)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
