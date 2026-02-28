import { useState } from 'react';
import axios from 'axios';
import TrendChart from './TrendChart';

const API = 'http://localhost:8000/api';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.get(`${API}/search/${encodeURIComponent(query)}`);
            setResult(res.data);
        } catch (err) {
            setError(err.message || 'Search failed. Backend might be down.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>🔍 Deep Search</h2>
                <p className="page-subtitle">Dynamically query real-time trends, latest documents, and AI insights for any technology</p>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <input
                    className="search-bar"
                    type="text"
                    placeholder="E.g., WebAssembly, Rust programming language, LLM agents..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !query.trim()}
                    style={{ padding: '0 24px', cursor: loading ? 'wait' : 'pointer' }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Brief Section */}
                    {result.brief && (
                        <div className="chart-card ai-brief-card">
                            <div className="chart-card-header ai-brief-header">
                                <h3>✨ AI Executive Brief: {result.technology}</h3>
                                <span className="ai-model-badge">Real-time Synthesis</span>
                            </div>
                            <div className="ai-brief-content">
                                <div className="ai-text">
                                    <p dangerouslySetInnerHTML={{
                                        __html: result.brief.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br />')
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart Section */}
                    {result.trends && (
                        <TrendChart trends={{ [result.technology]: result.trends }} />
                    )}
                    {!result.trends && (
                        <div className="chart-card" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                            <p>No mathematical trend data found on Wikipedia for this exact query.</p>
                        </div>
                    )}

                    {/* Documents Section */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3>📄 Latest Sourced Documents</h3>
                        </div>
                        {result.documents && result.documents.length > 0 ? (
                            <div className="docs-grid" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {result.documents.map(doc => (
                                    <div className="doc-card" key={doc.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <div className="doc-card-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                                            <span className="doc-source-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: '4px' }}>{doc.source}</span>
                                            <span className="doc-date">{doc.date}</span>
                                        </div>
                                        <h4 className="doc-title" style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '500' }}>{doc.title}</h4>
                                        <p className="doc-text" style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>{doc.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                No recent documents found across public APIs.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
