import { useState } from 'react';
import './Pricing.css';


const plans = [
  {
    name: 'Starter',
    price: { monthly: 49, annual: 39 },
    description: 'Perfect for individual analysts and small teams exploring tech intelligence.',
    features: [
      '500 technologies tracked',
      'Monthly trend reports',
      'Basic AI predictions',
      '3 user seats',
      'Email support',
      'API access (1K calls/mo)',
    ],
    cta: 'Get Started',
    color: '#6366f1',
    popular: false,
  },
  {
    name: 'Professional',
    price: { monthly: 149, annual: 119 },
    description: 'For growing teams that need deep insights and real-time intelligence.',
    features: [
      '5,000 technologies tracked',
      'Weekly AI-powered forecasts',
      'Advanced trend predictions',
      '15 user seats',
      'Priority support & SLA',
      'API access (50K calls/mo)',
      'Custom dashboards',
      'Slack & Teams integration',
    ],
    cta: 'Start Free Trial',
    color: '#06b6d4',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 499, annual: 399 },
    description: 'Full-scale deployment for large organizations requiring maximum power.',
    features: [
      'Unlimited technologies',
      'Real-time AI forecasting',
      'Custom ML model training',
      'Unlimited user seats',
      'Dedicated success manager',
      'Unlimited API access',
      'White-label reports',
      'On-premise deployment',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
    color: '#ec4899',
    popular: false,
  },
];

const Pricing = ({ onGetStarted }) => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-bg-glow" />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">💎 Pricing</div>
          <h2 className="section-title reveal">
            Transparent, <span className="gradient-text">Scalable</span> Pricing
          </h2>
          <p className="section-subtitle reveal">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="pricing-toggle reveal">
            <span className={!annual ? 'active' : ''}>Monthly</span>
            <button
              className={`toggle-btn ${annual ? 'annual' : ''}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle billing period"
            >
              <span className="toggle-thumb" />
            </button>
            <span className={annual ? 'active' : ''}>
              Annual
              <span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card reveal ${plan.popular ? 'popular' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s`, '--plan-color': plan.color }}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}

              <div className="plan-header">
                <h3 className="plan-name" style={{ color: plan.color }}>{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">
                    {annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="price-period">/mo</span>
                </div>
                {annual && (
                  <p className="price-billed">Billed annually · Save ${(plan.price.monthly - plan.price.annual) * 12}/yr</p>
                )}
              </div>

              <button
                className={`plan-cta ${plan.popular ? 'btn-primary' : 'btn-outline-plan'}`}
                style={plan.popular ? {} : { borderColor: `${plan.color}40`, color: plan.color }}
                onClick={onGetStarted}
              >
                {plan.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <div className="plan-divider" style={{ background: `${plan.color}20` }} />

              <ul className="plan-features">
                {plan.features.map((feat, j) => (
                  <li key={j}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="pricing-footer reveal">
          All plans include a <strong>30-day free trial</strong>. No credit card required.
          Need something custom? <a href="#contact">Talk to our team →</a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
