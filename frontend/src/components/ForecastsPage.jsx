/**
 * ForecastsPage.jsx — Dedicated view showing forecast predictions
 * for each technology with historical vs predicted comparison.
 */

export default function ForecastsPage({ trends }) {
    if (!trends) return null;

    const topics = Object.keys(trends);
    const sorted = [...topics].sort(
        (a, b) => (trends[b]?.growth_rate || 0) - (trends[a]?.growth_rate || 0)
    );

    return (
        <div className="page-view">
            <div className="page-header">
                <h2>🔮 Forecasts</h2>
                <p className="page-subtitle">6-month linear regression predictions for each tracked technology</p>
            </div>

            <div className="forecast-grid">
                {sorted.map(topic => {
                    const t = trends[topic];
                    const lastHist = t.historical[t.historical.length - 1];
                    const lastFore = t.forecast[t.forecast.length - 1];
                    const delta = lastFore.mentions - lastHist.mentions;
                    const pct = lastHist.mentions > 0
                        ? ((delta / lastHist.mentions) * 100).toFixed(1)
                        : 0;

                    return (
                        <div className="forecast-card" key={topic}>
                            <div className="forecast-header">
                                <h4>{topic}</h4>
                                <span className={`forecast-badge ${delta >= 0 ? 'up' : 'down'}`}>
                                    {delta >= 0 ? '↑' : '↓'} {Math.abs(pct)}%
                                </span>
                            </div>

                            <div className="forecast-body">
                                <div className="forecast-stat">
                                    <span className="forecast-label">Current</span>
                                    <span className="forecast-value">{lastHist.mentions.toLocaleString()}</span>
                                    <span className="forecast-date">{lastHist.month}</span>
                                </div>
                                <div className="forecast-arrow">{delta >= 0 ? '→' : '→'}</div>
                                <div className="forecast-stat">
                                    <span className="forecast-label">Predicted</span>
                                    <span className="forecast-value highlight">{lastFore.mentions.toLocaleString()}</span>
                                    <span className="forecast-date">{lastFore.month}</span>
                                </div>
                            </div>

                            <div className="forecast-bar-track">
                                <div
                                    className={`forecast-bar-fill ${delta >= 0 ? 'positive' : 'negative'}`}
                                    style={{ width: `${Math.min(Math.abs(Number(pct)), 100)}%` }}
                                />
                            </div>

                            <div className="forecast-timeline">
                                {t.forecast.map(f => (
                                    <span key={f.month} className="forecast-point">
                                        {f.month.split('-')[1]}: {f.mentions}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
