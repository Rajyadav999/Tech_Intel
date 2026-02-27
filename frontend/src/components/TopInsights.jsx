/**
 * TopInsights.jsx — Decision-ready metric cards across the top of the dashboard.
 */

const CARD_CONFIG = [
  { key: 'total_topics',   label: 'Total Topics',     icon: '📊', format: v => v },
  { key: 'total_mentions', label: 'Total Mentions',    icon: '📈', format: v => v?.toLocaleString() },
  { key: 'top_rising_1',   label: 'Hottest Topic',     icon: '🔥' },
  { key: 'top_declining_1', label: 'Cooling Down',     icon: '❄️' },
];

export default function TopInsights({ summary }) {
  if (!summary) return null;

  const cards = CARD_CONFIG.map(cfg => {
    let value, change, isPositive;

    if (cfg.key === 'total_topics') {
      value = cfg.format(summary.total_topics);
      change = `${summary.total_topics} tracked`;
      isPositive = true;
    } else if (cfg.key === 'total_mentions') {
      value = cfg.format(summary.total_mentions);
      change = 'across all sources';
      isPositive = true;
    } else if (cfg.key === 'top_rising_1' && summary.top_rising?.[0]) {
      const t = summary.top_rising[0];
      value = t.topic;
      change = `+${t.growth_rate}%`;
      isPositive = true;
    } else if (cfg.key === 'top_declining_1' && summary.top_declining?.[0]) {
      const t = summary.top_declining[0];
      value = t.topic;
      change = `${t.growth_rate}%`;
      isPositive = false;
    } else {
      value = '—';
      change = '';
    }

    return { ...cfg, value, change, isPositive };
  });

  return (
    <div className="insights-row">
      {cards.map((card, i) => (
        <div className="insight-card" key={i}>
          <div className="card-header">
            <span className="card-label">{card.label}</span>
            <span className="card-icon">{card.icon}</span>
          </div>
          <div className="card-value">
            {typeof card.value === 'number' ? card.value : card.value}
          </div>
          {card.change && (
            <div className={`card-change ${card.isPositive ? 'positive' : 'negative'}`}>
              {card.isPositive ? '↑' : '↓'} {card.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
