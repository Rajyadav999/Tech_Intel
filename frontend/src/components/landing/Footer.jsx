
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-top-line" />
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#footerLogoGrad)" opacity="0.2" />
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#footerLogoGrad)" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="3" fill="url(#footerLogoGrad)" />
            </svg>
            <span>TechIntel</span>
          </div>
          <p className="footer-tagline">
            The world's most advanced AI-powered technology intelligence
            and forecasting platform for enterprise teams.
          </p>
          <div className="social-links">
            {['𝕏', 'in', 'gh', 'yt'].map((s, i) => (
              <a key={i} href="#" className="social-btn" aria-label={s}>{s}</a>
            ))}
          </div>
        </div>

        <div className="footer-links-group">
          <h5>Product</h5>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#">Security</a></li>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h5>Solutions</h5>
          <ul>
            <li><a href="#">Tech Forecasting</a></li>
            <li><a href="#">Market Analysis</a></li>
            <li><a href="#">Competitive Intel</a></li>
            <li><a href="#">Patent Tracking</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h5>Company</h5>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h5>Legal</h5>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">GDPR</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} TechIntel Inc. All rights reserved.</p>
          <p className="footer-built">
            Built with ❤️ using React, TypeScript & Three.js
            <span className="footer-dot">·</span>
            <span className="footer-status">
              <span className="status-dot" />
              All systems operational
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
