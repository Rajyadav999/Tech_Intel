/**
 * DocumentsPage.jsx — Browse raw source documents ingested
 * by the intelligence pipeline.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get(`${API}/documents`)
            .then(res => setDocs(res.data.documents || []))
            .catch(() => setDocs([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = docs.filter(d =>
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.text?.toLowerCase().includes(search.toLowerCase()) ||
        d.technology?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>📄 Documents</h2>
                <p className="page-subtitle">{docs.length} raw documents ingested from multiple sources</p>
            </div>

            <div className="search-bar-wrapper">
                <input
                    className="search-bar"
                    type="text"
                    placeholder="Search documents by title, content, or technology…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    Loading documents…
                </div>
            ) : (
                <div className="docs-grid">
                    {filtered.map(doc => (
                        <div className="doc-card" key={doc.id}>
                            <div className="doc-card-top">
                                <span className="doc-source-badge">{doc.source}</span>
                                <span className="doc-date">{doc.date}</span>
                            </div>
                            <h4 className="doc-title">{doc.title}</h4>
                            <p className="doc-text">{doc.text}</p>
                            <div className="doc-card-footer">
                                <span className="doc-tech-badge">{doc.technology}</span>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                            No documents match your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
