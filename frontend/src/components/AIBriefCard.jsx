import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

export default function AIBriefCard({ trends }) {
    const [selectedTech, setSelectedTech] = useState('');
    const [brief, setBrief] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const topics = Object.keys(trends || {});

    // Auto-select the first topic when trends load
    useEffect(() => {
        if (topics.length > 0 && !selectedTech) {
            setSelectedTech(topics[0]);
        }
    }, [topics, selectedTech]);

    // Clear the brief if they change the technology so they know they need to generate again
    useEffect(() => {
        setBrief('');
        setError(null);
    }, [selectedTech]);

    const handleGenerate = async () => {
        if (!selectedTech) return;

        setLoading(true);
        setError(null);
        setBrief('');

        try {
            // Encode the tech name for the URL path
            const res = await axios.get(`${API}/brief/${encodeURIComponent(selectedTech)}`);
            setBrief(res.data.brief);
        } catch (err) {
            if (err.response && err.response.status === 429) {
                setError('Rate limit exceeded. The free Gemini API tier only allows a few requests per minute. Please wait 60 seconds and try again.');
            } else if (err.response && err.response.data && err.response.data.detail) {
                // Sometimes the backend throws a 500 with the specific Google API error string
                const detail = String(err.response.data.detail);
                if (detail.includes('429') || detail.includes('Quota')) {
                    setError('Rate limit exceeded. The free Gemini API tier only allows a few requests per minute. Please wait 60 seconds and try again.');
                } else {
                    setError(`Failed to generate AI brief: ${detail}`);
                }
            } else {
                setError('Failed to generate AI brief. Confirm backend is running and GROQ_API_KEY is set.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!topics.length) return null;

    return (
        <div className="chart-card ai-brief-card">
            <div className="chart-card-header ai-brief-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, paddingBottom: '4px' }}>
                        ✨ Generative AI Executive Brief
                    </h3>
                    <span className="ai-model-badge">AI Powered</span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        className="ai-tech-select"
                        value={selectedTech}
                        onChange={e => setSelectedTech(e.target.value)}
                        disabled={loading}
                    >
                        {topics.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <button
                        className="export-btn"
                        onClick={handleGenerate}
                        disabled={loading}
                        style={{ padding: '6px 16px', margin: 0 }}
                    >
                        {loading ? 'Thinking...' : 'Generate ⚡'}
                    </button>
                </div>
            </div>

            <div className="ai-brief-content">
                {loading ? (
                    <div className="ai-loading">
                        <div className="ai-sparkles">✨</div>
                        <p>Synthesizing insights for {selectedTech}...</p>
                    </div>
                ) : error ? (
                    <div className="ai-error">
                        <p>{error}</p>
                    </div>
                ) : brief ? (
                    <div className="ai-text">
                        {/* Simple markdown parsing for bold text since Gemini uses **bold** */}
                        <p dangerouslySetInnerHTML={{
                            __html: brief.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                        }} />
                    </div>
                ) : (
                    <div className="ai-text" style={{ textAlign: 'center', opacity: 0.6, padding: '20px 0' }}>
                        <p>Select a technology and click <strong>Generate</strong> to write a custom AI executive brief.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
