/**
 * SourcesPage.jsx — Shows the data sources the platform aggregates from.
 */

const SOURCES = [
    {
        name: 'TechCrunch',
        type: 'News',
        icon: '📰',
        docs: 0,
        status: 'active',
        description: 'Leading technology media property covering startups and tech industry news.',
    },
    {
        name: 'ArXiv',
        type: 'Research Papers',
        icon: '🎓',
        docs: 0,
        status: 'active',
        description: 'Open-access repository of scientific papers in AI, ML, and computing.',
    },
    {
        name: 'IEEE Spectrum',
        type: 'Journal',
        icon: '🔬',
        docs: 0,
        status: 'active',
        description: 'Magazine of the IEEE covering engineering and applied sciences.',
    },
    {
        name: 'Wired',
        type: 'News',
        icon: '🌐',
        docs: 0,
        status: 'active',
        description: 'Monthly magazine focused on emerging technologies and culture.',
    },
    {
        name: 'GitHub Trending',
        type: 'Repositories',
        icon: '💻',
        docs: 0,
        status: 'active',
        description: 'Trending open-source repositories across all programming languages.',
    },
];

export default function SourcesPage({ documents }) {
    // Count docs per source
    const counts = {};
    (documents || []).forEach(d => {
        counts[d.source] = (counts[d.source] || 0) + 1;
    });
    const sources = SOURCES.map(s => ({ ...s, docs: counts[s.name] || 0 }));

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>🗄️ Data Sources</h2>
                <p className="page-subtitle">Aggregated intelligence from {sources.length} vetted sources</p>
            </div>

            <div className="sources-grid">
                {sources.map(src => (
                    <div className="source-card" key={src.name}>
                        <div className="source-card-header">
                            <span className="source-icon">{src.icon}</span>
                            <div>
                                <h4>{src.name}</h4>
                                <span className="source-type">{src.type}</span>
                            </div>
                            <span className={`source-status ${src.status}`}>
                                <span className="status-dot" /> {src.status}
                            </span>
                        </div>
                        <p className="source-desc">{src.description}</p>
                        <div className="source-card-footer">
                            <span className="source-docs">{src.docs} documents</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
