import { useState, useEffect } from 'react';
import './Header.css';


const Header = ({ onLogin, onSignup }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <div className="logo">
          <div className="logo-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#logoGrad)" opacity="0.2" />
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="3" fill="url(#logoGrad)" />
              <line x1="14" y1="2" x2="14" y2="11" stroke="url(#logoGrad)" strokeWidth="1" />
              <line x1="24" y1="8" x2="17.6" y2="11.5" stroke="url(#logoGrad)" strokeWidth="1" />
              <line x1="24" y1="20" x2="17.6" y2="16.5" stroke="url(#logoGrad)" strokeWidth="1" />
              <line x1="14" y1="26" x2="14" y2="17" stroke="url(#logoGrad)" strokeWidth="1" />
              <line x1="4" y1="20" x2="10.4" y2="16.5" stroke="url(#logoGrad)" strokeWidth="1" />
              <line x1="4" y1="8" x2="10.4" y2="11.5" stroke="url(#logoGrad)" strokeWidth="1" />
            </svg>
          </div>
          <span className="logo-text">TechIntel</span>
          <span className="logo-badge">AI</span>
        </div>

        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Clients</a>
          <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
        </nav>

        <div className="header-actions">
          <button className="btn-secondary btn-sm" onClick={onLogin}>Sign In</button>
          <button className="btn-primary btn-sm" onClick={onSignup}>
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <button
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
