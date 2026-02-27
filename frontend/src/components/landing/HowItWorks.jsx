
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    icon: '🔌',
    title: 'Connect Your Data Sources',
    description: 'Integrate with your existing data pipelines, research feeds, and market databases. Set up in minutes with our zero-code connectors.',
    color: '#6366f1',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI Engine Analyzes Signals',
    description: 'Our proprietary ML algorithms continuously scan millions of signals — patents, papers, funding rounds, social chatter — to detect trends before they go mainstream.',
    color: '#06b6d4',
  },
  {
    number: '03',
    icon: '📊',
    title: 'Receive Forecasts & Insights',
    description: 'Get personalized dashboards with actionable intelligence, trend scores, and confidence-rated predictions tailored to your industry vertical.',
    color: '#ec4899',
  },
  {
    number: '04',
    icon: '🚀',
    title: 'Execute Data-Driven Strategy',
    description: 'Turn intelligence into action. Share reports with your team, set automated alerts, and integrate findings into your strategic planning workflow.',
    color: '#f59e0b',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">⚙️ Process</div>
          <h2 className="section-title reveal">
            From Data to <span className="gradient-text">Intelligence</span> in 4 Steps
          </h2>
          <p className="section-subtitle reveal">
            A streamlined workflow that transforms raw data into strategic advantage.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="step-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="step-number-wrap" style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                <span className="step-number" style={{ color: step.color }}>{step.number}</span>
              </div>
              {i < steps.length - 1 && <div className="step-line" style={{ background: `linear-gradient(90deg, ${step.color}, ${steps[i+1].color})` }} />}
              <div className="step-icon-wrap" style={{ color: step.color }}>
                <span>{step.icon}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
              <div className="step-badge" style={{ color: step.color, borderColor: `${step.color}30` }}>
                Step {step.number}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Section */}
        <div className="integrations-box reveal">
          <div className="integrations-text">
            <h3>Works With Your Entire Stack</h3>
            <p>Native integrations with 200+ tools and platforms</p>
          </div>
          <div className="integrations-logos">
            {[
              { icon: '📊', name: 'Analytics' },
              { icon: '☁️', name: 'AWS / GCP' },
              { icon: '🗄️', name: 'Databases' },
              { icon: '📧', name: 'Slack' },
              { icon: '🔗', name: 'REST API' },
              { icon: '⚙️', name: 'Zapier' },
              { icon: '📈', name: 'Tableau' },
              { icon: '🤖', name: 'OpenAI' },
            ].map((item, i) => (
              <div key={i} className="integration-chip">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
