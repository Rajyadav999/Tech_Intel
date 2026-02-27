/**
 * TopicClusters.jsx — Doughnut chart visualising NLP topic clusters
 * with keyword tags alongside.
 */

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CLUSTER_COLORS = [
    '#6366f1',
    '#22d3ee',
    '#34d399',
    '#fbbf24',
    '#fb7185',
    '#a78bfa',
    '#f472b6',
    '#2dd4bf',
];

export default function TopicClusters({ clusters }) {
    if (!clusters || !clusters.length) return null;

    const data = {
        labels: clusters.map(c => c.label),
        datasets: [
            {
                data: clusters.map(c => c.size),
                backgroundColor: clusters.map((_, i) => CLUSTER_COLORS[i % CLUSTER_COLORS.length]),
                borderColor: 'rgba(10,14,26,0.8)',
                borderWidth: 3,
                hoverBorderColor: '#1a1f35',
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(26,31,53,0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
                callbacks: {
                    label: ctx => `  ${ctx.parsed} documents`,
                },
            },
        },
    };

    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <h3>
                    🧠 Topic Clusters <span className="chart-badge">NLP K-Means</span>
                </h3>
            </div>
            <div className="cluster-chart-wrapper">
                <div style={{ width: '55%', height: '100%' }}>
                    <Doughnut data={data} options={options} />
                </div>
            </div>
            <div className="cluster-keywords">
                {clusters.map((c, i) => (
                    <div className="cluster-keyword-row" key={c.cluster_id}>
                        <span
                            className="cluster-color-dot"
                            style={{ background: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}
                        />
                        <span className="cluster-label">{c.label}</span>
                        <span className="cluster-size">{c.size} docs</span>
                        <div className="cluster-tags">
                            {c.keywords.slice(0, 4).map(kw => (
                                <span className="cluster-tag" key={kw}>{kw}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
