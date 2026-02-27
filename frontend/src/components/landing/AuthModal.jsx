import { useState, useRef, useEffect } from 'react';
import './AuthModal.css';

/**
 * AuthModal.jsx — Auth modal for landing page
 * Props:
 *   mode         : 'login' | 'signup'
 *   onClose      : () => void  — closes modal without navigating
 *   onSwitchMode : (mode) => void
 *   onAuthSuccess: () => void  — called after successful auth → triggers dashboard navigation
 */
export default function AuthModal({ mode, onClose, onSwitchMode, onAuthSuccess }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [name, setName]                 = useState('');
  const [company, setCompany]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});
  const [success, setSuccess]           = useState(false);
  const [agree, setAgree]               = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const validate = () => {
    const errs = {};
    if (mode === 'signup' && !name.trim()) errs.name = 'Full name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email address';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (mode === 'signup' && !agree) errs.agree = 'You must agree to the terms';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
    // After 1.8s success animation → navigate to dashboard
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess();
      else onClose();
    }, 1800);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="auth-modal success-modal" ref={modalRef}>
          <div className="success-icon">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="#10b981" strokeWidth="2.5" className="success-circle" />
              <path d="M18 30 L27 39 L42 22" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="success-check" />
            </svg>
          </div>
          <h3>{mode === 'login' ? 'Welcome back!' : 'Account created!'}</h3>
          <p>Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" ref={modalRef}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="modal-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id="mLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" fill="url(#mLogoGrad)" opacity="0.15" />
            <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="url(#mLogoGrad)" strokeWidth="1.5" fill="none" />
            <circle cx="14" cy="14" r="3" fill="url(#mLogoGrad)" />
          </svg>
          <span>TechIntel</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => onSwitchMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => onSwitchMode('signup')}
          >
            Create Account
          </button>
          <div className="auth-tab-indicator" style={{ left: mode === 'login' ? '4px' : 'calc(50% + 4px)', width: 'calc(50% - 8px)' }} />
        </div>

        <h2 className="modal-title">
          {mode === 'login' ? 'Welcome back' : 'Start your free trial'}
        </h2>
        <p className="modal-subtitle">
          {mode === 'login'
            ? 'Sign in to your TechIntel account'
            : '30 days free · No credit card required'}
        </p>

        {/* Social Sign In */}
        <div className="social-auth">
          <button className="social-auth-btn" type="button" onClick={() => { setSuccess(true); setTimeout(() => { if (onAuthSuccess) onAuthSuccess(); else onClose(); }, 1800); }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button className="social-auth-btn" type="button" onClick={() => { setSuccess(true); setTimeout(() => { if (onAuthSuccess) onAuthSuccess(); else onClose(); }, 1800); }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="field-row">
              <div className={`form-field ${errors.name ? 'error' : ''}`}>
                <label>Full Name</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})); }}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label>Company <span className="optional">(optional)</span></label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    autoComplete="organization"
                  />
                </div>
              </div>
            </div>
          )}

          <div className={`form-field ${errors.email ? 'error' : ''}`}>
            <label>Email Address</label>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`form-field ${errors.password ? 'error' : ''}`}>
            <div className="field-label-row">
              <label>Password</label>
              {mode === 'login' && <a href="#" className="forgot-link">Forgot password?</a>}
            </div>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
            {mode === 'signup' && password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map(level => {
                    const score = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
                      : password.length >= 10 && /[A-Z]/.test(password) ? 3
                      : password.length >= 8 ? 2 : 1;
                    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
                    return (
                      <div key={level} className="strength-bar" style={{ background: level <= score ? colors[score] : undefined }} />
                    );
                  })}
                </div>
                <span className="strength-label" style={{ color: password.length >= 12 && /[A-Z]/.test(password) ? '#10b981' : password.length >= 8 ? '#3b82f6' : '#ef4444' }}>
                  {password.length < 8 ? 'Too short' : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong' : 'Good'}
                </span>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className={`form-field agree-field ${errors.agree ? 'error' : ''}`}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e => { setAgree(e.target.checked); setErrors(p => ({...p, agree: ''})); }}
                />
                <span className="checkbox-custom" />
                <span>
                  I agree to the <a href="#" target="_blank" rel="noreferrer">Terms of Service</a> and{' '}
                  <a href="#" target="_blank" rel="noreferrer">Privacy Policy</a>
                </span>
              </label>
              {errors.agree && <span className="field-error">{errors.agree}</span>}
            </div>
          )}

          <button type="submit" className={`btn-primary submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign In & Go to Dashboard' : 'Create Account & Get Started'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="switch-mode">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up for free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
