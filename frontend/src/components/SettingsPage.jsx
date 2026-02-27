/**
 * SettingsPage.jsx — Platform settings and configuration.
 */

export default function SettingsPage() {
    return (
        <div className="page-view">
            <div className="page-header">
                <h2>⚙️ Settings</h2>
                <p className="page-subtitle">Platform configuration and preferences</p>
            </div>

            <div className="settings-grid">
                <div className="settings-section">
                    <h3>📊 Data Pipeline</h3>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Auto-refresh interval</span>
                            <span className="setting-desc">How often the dashboard fetches new data</span>
                        </div>
                        <span className="setting-value">Manual</span>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Historical window</span>
                            <span className="setting-desc">Number of months of trend data to track</span>
                        </div>
                        <span className="setting-value">24 months</span>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Forecast horizon</span>
                            <span className="setting-desc">Number of months to forecast ahead</span>
                        </div>
                        <span className="setting-value">6 months</span>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🧠 ML Engine</h3>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Clustering algorithm</span>
                            <span className="setting-desc">Method used for topic discovery</span>
                        </div>
                        <span className="setting-value">K-Means</span>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Number of clusters</span>
                            <span className="setting-desc">Target topic groups for K-Means</span>
                        </div>
                        <span className="setting-value">5</span>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Vectorisation</span>
                            <span className="setting-desc">Text representation method</span>
                        </div>
                        <span className="setting-value">TF-IDF (500 features)</span>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Forecasting model</span>
                            <span className="setting-desc">Regression model for trend prediction</span>
                        </div>
                        <span className="setting-value">Linear Regression</span>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🎨 Appearance</h3>
                    <div className="setting-row">
                        <div className="setting-info">
                            <span className="setting-label">Theme</span>
                            <span className="setting-desc">Dashboard colour scheme</span>
                        </div>
                        <span className="setting-value">Dark</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
