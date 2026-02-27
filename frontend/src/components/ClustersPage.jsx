/**
 * ClustersPage.jsx — Full-page view for NLP topic clusters
 * with the doughnut chart and keyword deep-dive.
 */

import TopicClusters from './TopicClusters';

export default function ClustersPage({ clusters }) {
    if (!clusters || !clusters.length) return null;

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>🧠 Topic Clusters</h2>
                <p className="page-subtitle">TF-IDF vectorisation + K-Means clustering on raw document corpus</p>
            </div>

            <TopicClusters clusters={clusters} />

            <div className="chart-card" style={{ marginTop: 20 }}>
                <div className="chart-card-header">
                    <h3>🔍 Cluster Details</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Label</th>
                            <th>Documents</th>
                            <th>Keywords</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clusters.map(c => (
                            <tr key={c.cluster_id}>
                                <td className="table-rank">{c.cluster_id}</td>
                                <td className="table-name">{c.label}</td>
                                <td>{c.size}</td>
                                <td>
                                    <div className="cluster-tags">
                                        {c.keywords.map(kw => (
                                            <span className="cluster-tag" key={kw}>{kw}</span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
