/**
 * Dashboard.jsx — src/components/Dashboard.jsx
 * Full dashboard shell. Rendered after successful auth.
 * Receives `user` and `onLogout` from App.jsx.
 *
 * NOTE: All imports are siblings (./X), NOT ./components/X,
 * because Dashboard.jsx lives inside src/components/ itself.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

import TopInsights from './TopInsights';
import TrendChart from './TrendChart';
import TopicClusters from './TopicClusters';
import AIBriefCard from './AIBriefCard';
import TrendsPage from './TrendsPage';
import ClustersPage from './ClustersPage';
import ForecastsPage from './ForecastsPage';
import DocumentsPage from './DocumentsPage';
import SourcesPage from './SourcesPage';
import SettingsPage from './SettingsPage';

const API = 'http://localhost:8000/api';

const NAV_ITEMS = [
  { section: 'Analytics' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'clusters', label: 'Topic Clusters', icon: '🧠' },
  { id: 'forecasts', label: 'Forecasts', icon: '🔮' },
  { section: 'Data' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'sources', label: 'Sources', icon: '🗄️' },
  { section: 'System' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  trends: 'Trends',
  clusters: 'Topic Clusters',
  forecasts: 'Forecasts',
  documents: 'Documents',
  sources: 'Sources',
  settings: 'Settings',
};

const PAGE_SUBTITLES = {
  dashboard: 'Overview  ·  Real-time Intelligence',
  trends: 'Historical data & forecasts',
  clusters: 'NLP-powered topic discovery',
  forecasts: 'Predictive analytics',
  documents: 'Raw document corpus',
  sources: 'Data provider management',
  settings: 'Platform configuration',
};

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [trends, setTrends] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [summary, setSummary] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, cRes, sRes, dRes] = await Promise.all([
        axios.get(`${API}/trends`),
        axios.get(`${API}/clusters`),
        axios.get(`${API}/summary`),
        axios.get(`${API}/documents`).catch(() => ({ data: { documents: [] } })),
      ]);
      setTrends(tRes.data.trends);
      setClusters(cRes.data.clusters);
      setSummary(sRes.data.summary);
      setDocuments(dRes.data.documents || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Initialising intelligence pipeline…</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  // ── PDF Export ──
  const handleExportPDF = () => {
    document.body.classList.add('exporting-pdf');
    window.print();
    document.body.classList.remove('exporting-pdf');
  };

  // ── Page content router ──
  const renderPage = () => {
    switch (page) {
      case 'trends': return <TrendsPage trends={trends} />;
      case 'clusters': return <ClustersPage clusters={clusters} />;
      case 'forecasts': return <ForecastsPage trends={trends} />;
      case 'documents': return <DocumentsPage />;
      case 'sources': return <SourcesPage documents={documents} />;
      case 'settings': return <SettingsPage />;
      default:
        return (
          <>
            <TopInsights summary={summary} />

            <div className="charts-grid">
              <TrendChart trends={trends} />
              <TopicClusters clusters={clusters} />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <AIBriefCard trends={trends} />
            </div>

            <div className="bottom-grid">
              <div className="topics-card rising">
                <h3>🚀 Rising Technologies</h3>
                <ul className="topic-list">
                  {summary?.top_rising?.map((t, i) => (
                    <li className="topic-item" key={t.topic}>
                      <span className="topic-rank">{i + 1}</span>
                      <span className="topic-name">{t.topic}</span>
                      <span className="topic-rate positive">+{t.growth_rate}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="topics-card declining">
                <h3>📉 Declining Technologies</h3>
                <ul className="topic-list">
                  {summary?.top_declining?.map((t, i) => (
                    <li className="topic-item" key={t.topic}>
                      <span className="topic-rank">{i + 1}</span>
                      <span className="topic-name">{t.topic}</span>
                      <span className={`topic-rate ${t.growth_rate < 0 ? 'negative' : 'positive'}`}>
                        {t.growth_rate > 0 ? '+' : ''}{t.growth_rate}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>TechIntel</h1>
            <span className="logo-sub">Intelligence Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) =>
            item.section ? (
              <span className="nav-section-label" key={`sec-${i}`}>{item.section}</span>
            ) : (
              <a
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                href="#"
                onClick={e => { e.preventDefault(); setPage(item.id); }}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </a>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '10px' }}>
              <div className="sidebar-user" style={{ marginBottom: 0 }}>
                <div className="sidebar-user-avatar">
                  {user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.name ?? user.email}</span>
                </div>
              </div>
              <button className="sidebar-logout" style={{ justifyContent: 'center' }} onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>Pipeline Active</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="main-container">
        <header className="dash-header-bar">
          <div className="dash-header-left">
            <h2>{PAGE_TITLES[page]}</h2>
            <span className="dash-header-breadcrumb">{PAGE_SUBTITLES[page]}</span>
          </div>
          <div className="dash-header-right">
            {page === 'dashboard' && (
              <button className="btn-outline btn-sm" onClick={handleExportPDF}>
                📥 Download Report
              </button>
            )}
            <div className="header-badge">
              <span className="badge-dot" />
              Live
            </div>
            <span className="header-time">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
          </div>
        </header>

        <main className="dashboard">
          {renderPage()}
        </main>
      </div>
    </>
  );
}