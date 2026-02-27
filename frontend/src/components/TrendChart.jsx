/**
 * TrendChart.jsx — Line chart showing technology adoption over time
 * with a forecast overlay (dashed lines).
 */

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useState, useMemo } from 'react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

const COLORS = [
    { line: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
    { line: '#22d3ee', bg: 'rgba(34,211,238,0.10)' },
    { line: '#34d399', bg: 'rgba(52,211,153,0.10)' },
    { line: '#fb7185', bg: 'rgba(251,113,133,0.10)' },
    { line: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
    { line: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
    { line: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
    { line: '#2dd4bf', bg: 'rgba(45,212,191,0.10)' },
    { line: '#fb923c', bg: 'rgba(251,146,60,0.10)' },
    { line: '#e879f9', bg: 'rgba(232,121,249,0.10)' },
];

const FILTER_OPTIONS = ['All', 'Top 5', 'Top 3'];

export default function TrendChart({ trends }) {
    const [filter, setFilter] = useState('Top 5');

    const topics = useMemo(() => Object.keys(trends || {}), [trends]);
    const visibleTopics = useMemo(() => {
        if (!topics.length) return [];
        if (filter === 'All') return topics;
        // Sort by growth_rate descending and take top N
        const sorted = [...topics].sort(
            (a, b) => (trends[b]?.growth_rate || 0) - (trends[a]?.growth_rate || 0)
        );
        const n = filter === 'Top 3' ? 3 : 5;
        return sorted.slice(0, n);
    }, [topics, filter, trends]);

    if (!trends || !topics.length) return null;

    // Build unified labels (historical months + forecast months)
    const firstTopic = trends[topics[0]];
    const allLabels = [
        ...firstTopic.historical.map(p => p.month),
        ...firstTopic.forecast.map(p => p.month),
    ];
    const histLen = firstTopic.historical.length;

    // Build datasets — solid for historical, dashed for forecast
    const datasets = visibleTopics.flatMap((topic, i) => {
        const t = trends[topic];
        const color = COLORS[i % COLORS.length];

        // Historical dataset
        const histData = t.historical.map(p => p.mentions);
        const forecastPad = new Array(t.forecast.length).fill(null);

        // Forecast dataset — starts from last historical point for continuity
        const histPad = new Array(histLen - 1).fill(null);
        const forecastData = [t.historical[histLen - 1].mentions, ...t.forecast.map(p => p.mentions)];

        return [
            {
                label: topic,
                data: [...histData, ...forecastPad],
                borderColor: color.line,
                backgroundColor: color.bg,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: true,
            },
            {
                label: `${topic} (forecast)`,
                data: [...histPad, ...forecastData],
                borderColor: color.line,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [6, 4],
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: false,
            },
        ];
    });

    const data = { labels: allLabels, datasets };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Inter', size: 11 },
                    boxWidth: 12,
                    padding: 16,
                    filter: item => !item.text.includes('(forecast)'),
                },
            },
            tooltip: {
                backgroundColor: 'rgba(26,31,53,0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
                filter: item => !item.dataset.label.includes('(forecast)'),
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 10 }, maxRotation: 45 },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <h3>
                    📈 Technology Trends <span className="chart-badge">Time-Series</span>
                </h3>
                <div className="chart-filters">
                    {FILTER_OPTIONS.map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div className="chart-wrapper trend-chart-wrapper">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
