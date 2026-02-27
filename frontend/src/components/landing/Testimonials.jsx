
import './Testimonials.css';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO',
    company: 'TechVentures Inc.',
    content: 'TechIntel transformed how we approach technology strategy. The AI forecasts gave us 6-month advance notice on a market shift that became our biggest revenue driver.',
    avatar: 'SJ',
    rating: 5,
    color: '#6366f1',
    metric: '6mo advance',
    metricLabel: 'Market insight lead',
  },
  {
    name: 'Michael Chen',
    role: 'Innovation Director',
    company: 'Global Insights Corp',
    content: 'The AI predictions are frighteningly accurate. We committed $2M in R&D based on their forecasts and the ROI has been 340%. This platform pays for itself many times over.',
    avatar: 'MC',
    rating: 5,
    color: '#06b6d4',
    metric: '340% ROI',
    metricLabel: 'Investment return',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Chief Strategy Officer',
    company: 'FutureTech Solutions',
    content: 'We\'ve tried every tech intelligence tool on the market. Nothing comes close to TechIntel\'s depth of analysis and the speed at which insights are delivered.',
    avatar: 'ER',
    rating: 5,
    color: '#ec4899',
    metric: '#1 Choice',
    metricLabel: 'Among competitors',
  },
];

const companies = ['Google', 'Microsoft', 'Amazon', 'Salesforce', 'Oracle', 'IBM'];

const Testimonials = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        {/* Company Logos */}
        <div className="company-logos reveal">
          <p>Trusted by teams at world-class companies</p>
          <div className="logos-row">
            {companies.map((c, i) => (
              <div key={i} className="company-chip">{c}</div>
            ))}
          </div>
        </div>

        <div className="section-header">
          <div className="section-tag reveal">⭐ Testimonials</div>
          <h2 className="section-title reveal">
            Loved by <span className="gradient-text">Tech Leaders</span> Worldwide
          </h2>
          <p className="section-subtitle reveal">
            Join 500+ enterprise companies making smarter technology decisions.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card reveal"
              style={{ transitionDelay: `${i * 0.12}s`, '--t-color': t.color }}
            >
              <div className="t-rating">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <p className="t-content">"{t.content}"</p>

              <div className="t-metric" style={{ color: t.color, background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                <span className="t-metric-val">{t.metric}</span>
                <span className="t-metric-lbl">{t.metricLabel}</span>
              </div>

              <div className="t-author">
                <div className="t-avatar" style={{ background: `${t.color}20`, border: `2px solid ${t.color}30`, color: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="t-name">{t.name}</p>
                  <p className="t-role">{t.role} · {t.company}</p>
                </div>
              </div>
              <div className="t-glow" style={{ background: `radial-gradient(circle at 50% 100%, ${t.color}08, transparent 70%)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
