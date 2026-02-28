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
import { useState, useMemo, Component } from 'react';

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

// ── Error Boundary so one bad topic never blanks the page ─────────
class ChartErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>⚠️ Chart unavailable — {String(this.state.error?.message || 'unknown error')}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Helper: build a value-map keyed by month for fast lookup ──────
function toMonthMap(points, field) {
    const map = {};
    for (const p of points) map[p.month] = p[field] ?? null;
    return map;
}

export default function TrendChart({ trends }) {
    const [filter, setFilter] = useState('Top 5');

    const topics = useMemo(() => Object.keys(trends || {}), [trends]);
    const visibleTopics = useMemo(() => {
        if (!topics.length) return [];
        if (filter === 'All') return topics;
        const sorted = [...topics].sort(
            (a, b) => (trends[b]?.growth_rate || 0) - (trends[a]?.growth_rate || 0)
        );
        const n = filter === 'Top 3' ? 3 : 5;
        return sorted.slice(0, n);
    }, [topics, filter, trends]);

    if (!trends || !topics.length) return null;

    // ── Build a unified sorted label set from ALL visible topics ──
    const labelSet = new Set();
    for (const topic of visibleTopics) {
        const t = trends[topic];
        if (!t) continue;
        (t.historical || []).forEach(p => labelSet.add(p.month));
        (t.forecast || []).forEach(p => labelSet.add(p.month));
    }
    const allLabels = [...labelSet].sort();

    // ── Build datasets using month maps (handles ragged arrays) ───
    const datasets = visibleTopics.flatMap((topic, i) => {
        const t = trends[topic];
        if (!t) return [];
        const color = COLORS[i % COLORS.length];

        const histMap = toMonthMap(t.historical || [], 'mentions');
        const foreMap = toMonthMap(t.forecast || [], 'mentions');
        const loMap = toMonthMap(t.forecast || [], 'lower_bound');
        const hiMap = toMonthMap(t.forecast || [], 'upper_bound');

        // Last historical value — used as the bridge point into forecast
        const lastHistMonth = (t.historical || []).at(-1)?.month;
        const lastHistVal = lastHistMonth != null ? (histMap[lastHistMonth] ?? null) : null;
        const bridgeVal = lastHistVal != null ? Math.round(lastHistVal * 10) / 10 : null;

        const round = v => (v != null ? Math.round(v * 10) / 10 : null);

        const histData = allLabels.map(m => {
            const v = histMap[m];
            return v != null ? round(v) : null;
        });

        const foreData = allLabels.map(m => {
            if (m === lastHistMonth) return bridgeVal;
            const v = foreMap[m];
            return v != null ? round(v) : null;
        });

        const hiData = allLabels.map(m => {
            if (m === lastHistMonth) return bridgeVal;
            const v = hiMap[m];
            return v != null ? round(v) : null;
        });

        const loData = allLabels.map(m => {
            if (m === lastHistMonth) return bridgeVal;
            const v = loMap[m];
            return v != null ? round(v) : null;
        });

        return [
            {
                label: topic,
                data: histData,
                borderColor: color.line,
                backgroundColor: color.bg,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: true,
                spanGaps: true,
            },
            {
                label: `${topic} (forecast)`,
                data: foreData,
                borderColor: color.line,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [6, 4],
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: false,
                spanGaps: true,
            },
            {
                label: `${topic} (upper)`,
                data: hiData,
                borderColor: 'transparent',
                backgroundColor: color.bg.replace('0.10', '0.15'),
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: '+1',
                tension: 0.35,
                spanGaps: true,
            },
            {
                label: `${topic} (lower)`,
                data: loData,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0.35,
                spanGaps: true,
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
                    filter: item => !item.text.includes('(forecast)') && !item.text.includes('(upper)') && !item.text.includes('(lower)'),
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
                filter: item => !item.dataset.label.includes('(forecast)') && !item.dataset.label.includes('(upper)') && !item.dataset.label.includes('(lower)'),
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 10 }, maxRotation: 45, maxTicksLimit: 24 },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } },
                beginAtZero: true,
            },
        },
    };

    return (
        <ChartErrorBoundary>
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
        </ChartErrorBoundary>
    );
}
