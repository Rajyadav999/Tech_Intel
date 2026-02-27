/**
 * App.jsx — Main dashboard shell for the Tech Intelligence Platform.
 * Dark‑themed layout: sidebar navigation, header, and content grid
 * with live data from the FastAPI backend.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

import TopInsights from './components/TopInsights';
import TrendChart from './components/TrendChart';
import TopicClusters from './components/TopicClusters';
import TrendsPage from './components/TrendsPage';
import ClustersPage from './components/ClustersPage';
import ForecastsPage from './components/ForecastsPage';
import DocumentsPage from './components/DocumentsPage';
import SourcesPage from './components/SourcesPage';
import SettingsPage from './components/SettingsPage';
import './App.css';

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

export default function App() {
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

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Initialising intelligence pipeline…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  // ── Page Content Router ──
  const renderPage = () => {
    switch (page) {
      case 'trends':
        return <TrendsPage trends={trends} />;
      case 'clusters':
        return <ClustersPage clusters={clusters} />;
      case 'forecasts':
        return <ForecastsPage trends={trends} />;
      case 'documents':
        return <DocumentsPage />;
      case 'sources':
        return <SourcesPage documents={documents} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <>
            {/* Row 1 — Insight Cards */}
            <TopInsights summary={summary} />

            {/* Row 2 — Charts */}
            <div className="charts-grid">
              <TrendChart trends={trends} />
              <TopicClusters clusters={clusters} />
            </div>

            {/* Row 3 — Rising & Declining Topics */}
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
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>Pipeline Active</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-container">
        <header className="header">
          <div className="header-left">
            <h2>{PAGE_TITLES[page]}</h2>
            <span className="header-breadcrumb">{PAGE_SUBTITLES[page]}</span>
          </div>
          <div className="header-right">
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
