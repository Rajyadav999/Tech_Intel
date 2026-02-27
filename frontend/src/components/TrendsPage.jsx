/**
 * TrendsPage.jsx — Full-page view dedicated to technology trends
 * with the line chart and a detailed breakdown table.
 */

import TrendChart from './TrendChart';

export default function TrendsPage({ trends }) {
    if (!trends) return null;

    const topics = Object.keys(trends);
    const sorted = [...topics].sort(
        (a, b) => (trends[b]?.growth_rate || 0) - (trends[a]?.growth_rate || 0)
    );

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>📈 Technology Trends</h2>
                <p className="page-subtitle">Historical adoption data with 6-month linear regression forecast</p>
            </div>

            <TrendChart trends={trends} />

            <div className="chart-card" style={{ marginTop: 20 }}>
                <div className="chart-card-header">
                    <h3>📋 All Technologies — Growth Summary</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Technology</th>
                            <th>Data Points</th>
                            <th>Latest Mentions</th>
                            <th>Growth Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((topic, i) => {
                            const t = trends[topic];
                            const last = t.historical[t.historical.length - 1];
                            return (
                                <tr key={topic}>
                                    <td className="table-rank">{i + 1}</td>
                                    <td className="table-name">{topic}</td>
                                    <td>{t.historical.length} months</td>
                                    <td>{last.mentions.toLocaleString()}</td>
                                    <td className={t.growth_rate >= 0 ? 'positive' : 'negative'}>
                                        {t.growth_rate > 0 ? '+' : ''}{t.growth_rate}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
