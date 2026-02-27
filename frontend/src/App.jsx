/**
 * App.jsx — Tech_Intel root
 * Routes: Landing Page → AuthModal → Dashboard
 */

import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import Transition from './components/Transition';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'transitioning' | 'dashboard'
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  /* Scroll reveal observer for landing page */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });

  const openLogin  = () => { setAuthMode('login');  setShowAuth(true); };
  const openSignup = () => { setAuthMode('signup'); setShowAuth(true); };
  const closeAuth  = () => setShowAuth(false);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuth(false);
    setView('transitioning');
    setTimeout(() => setView('dashboard'), 2200);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  if (view === 'transitioning') return <Transition />;
  if (view === 'dashboard') return <Dashboard user={user} onLogout={handleLogout} />;

  return (
    <div className="app-landing">
      <LandingPage
        onLogin={openLogin}
        onSignup={openSignup}
        onGetStarted={openSignup}
      />
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onSwitchMode={(m) => setAuthMode(m)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
