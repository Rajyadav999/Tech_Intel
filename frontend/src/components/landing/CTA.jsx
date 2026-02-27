
import './CTA.css';


const CTA = ({ onGetStarted }) => {
  return (
    <section id="contact" className="cta-section">
      <div className="cta-orb-1" />
      <div className="cta-orb-2" />
      <div className="container cta-inner">
        <div className="cta-content reveal">
          <div className="section-tag" style={{ justifyContent: 'center' }}>🚀 Get Started Today</div>
          <h2 className="cta-title">
            Ready to Transform Your
            <br />
            <span className="gradient-text">Technology Strategy?</span>
          </h2>
          <p className="cta-subtitle">
            Join 500+ leading companies using TechIntel to predict, plan, and
            prosper in the technology-driven future. Start your free trial — no
            credit card required.
          </p>

          <div className="cta-actions">
            <button className="btn-primary cta-btn" onClick={onGetStarted}>
              Start Free 30-Day Trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-outline cta-btn-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Schedule a Demo
            </button>
          </div>

          <div className="cta-assurances">
            {['No credit card required', '30-day free trial', 'Cancel anytime', 'SOC2 Certified'].map((a, i) => (
              <div key={i} className="assurance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid pattern */}
        <div className="cta-grid-pattern" />
      </div>
    </section>
  );
};

export default CTA;
