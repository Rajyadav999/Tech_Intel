/**
 * Dashboard.jsx — Full Tech_Intel analytics dashboard
 * Uses mock data with realistic simulation so it works without a backend
 */

import { useState, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ─── Mock data generator ─────────────────────────────────── */
const TOPICS = ['Generative AI','Quantum Computing','Edge Computing','Web3','AR/VR','Cybersecurity','Green Tech','Robotics','Biotech','5G Networks'];

const rand = (min, max) => Math.floor(Math.random()*(max-min+1))+min;

const MOCK_TRENDS = Object.fromEntries(TOPICS.map(t => {
  const base = rand(100,800);
  const hist = Array.from({length:12}, (_,i) => ({
    month: `2025-${String(i+1).padStart(2,'0')}`,
    mentions: Math.max(10, base + rand(-50,80) * (i*0.4)),
  }));
  const forecast = Array.from({length:6}, (_,i) => ({
    month: `2026-${String(i+1).padStart(2,'0')}`,
    mentions: Math.max(10, hist[11].mentions + rand(10,60)*(i+1)*0.5),
  }));
  const gr = parseFloat(((forecast[5].mentions - hist[0].mentions)/hist[0].mentions*100).toFixed(1));
  return [t, { historical:hist, forecast, growth_rate: gr }];
}));

const MOCK_CLUSTERS = [
  { cluster_id:1, label:'AI & Machine Learning', size:420, keywords:['neural','transformer','LLM','inference'] },
  { cluster_id:2, label:'Cloud & Infrastructure', size:310, keywords:['serverless','k8s','edge','microservices'] },
  { cluster_id:3, label:'Security & Privacy',     size:255, keywords:['zero-trust','encryption','compliance','SIEM'] },
  { cluster_id:4, label:'Emerging Hardware',       size:198, keywords:['quantum','photonics','RISC-V','neuromorphic'] },
  { cluster_id:5, label:'Web & Applications',      size:167, keywords:['WebAssembly','PWA','headless','JAMstack'] },
];

const sorted_topics = [...TOPICS].sort((a,b)=>(MOCK_TRENDS[b].growth_rate||0)-(MOCK_TRENDS[a].growth_rate||0));

const MOCK_SUMMARY = {
  total_topics: TOPICS.length,
  total_mentions: Object.values(MOCK_TRENDS).reduce((s,t)=>s+t.historical.reduce((ss,h)=>ss+h.mentions,0),0),
  top_rising: sorted_topics.slice(0,5).map(t=>({topic:t, growth_rate: MOCK_TRENDS[t].growth_rate})),
  top_declining: sorted_topics.slice(-5).reverse().map(t=>({topic:t, growth_rate: MOCK_TRENDS[t].growth_rate})),
};

const MOCK_DOCS = TOPICS.flatMap((t,i) => [
  {id:`${i}-1`, title:`${t}: 2025 State of the Industry`, text:`A comprehensive report covering the latest developments in ${t} across enterprise deployments, investment trends, and technical breakthroughs observed this year.`, source:['TechCrunch','ArXiv','IEEE Spectrum','Wired','GitHub Trending'][i%5], date:'2025-11-15', technology:t},
  {id:`${i}-2`, title:`${t} Adoption Forecast Q2 2026`, text:`Predictive analysis using ML models to forecast ${t} market penetration over the next 6 months, highlighting key risk and opportunity signals.`, source:['ArXiv','IEEE Spectrum','TechCrunch','Wired','GitHub Trending'][(i+1)%5], date:'2025-10-28', technology:t},
]);

/* ─── Nav config ──────────────────────────────────────────── */
const NAV = [
  {section:'Analytics'},
  {id:'dashboard',  label:'Dashboard',      icon:'📊'},
  {id:'trends',     label:'Trends',         icon:'📈'},
  {id:'clusters',   label:'Topic Clusters', icon:'🧠'},
  {id:'forecasts',  label:'Forecasts',      icon:'🔮'},
  {section:'Data'},
  {id:'documents',  label:'Documents',      icon:'📄'},
  {id:'sources',    label:'Sources',        icon:'🗄️'},
  {section:'System'},
  {id:'settings',   label:'Settings',       icon:'⚙️'},
];

const TITLES = {
  dashboard:'Dashboard', trends:'Trends', clusters:'Topic Clusters',
  forecasts:'Forecasts', documents:'Documents', sources:'Sources', settings:'Settings',
};
const SUBS = {
  dashboard:'Overview · Real-time Intelligence', trends:'Historical data & forecasts',
  clusters:'NLP-powered topic discovery',        forecasts:'Predictive analytics',
  documents:'Raw document corpus',               sources:'Data provider management',
  settings:'Platform configuration',
};

/* ─── Chart colors ─────────────────────────────────────────── */
const CCOLORS = ['#6366f1','#22d3ee','#34d399','#fbbf24','#fb7185','#a78bfa','#f472b6','#2dd4bf'];

/* ─── Sub-components ───────────────────────────────────────── */
function TopInsights({ summary }) {
  if (!summary) return null;
  const cards = [
    { label:'Total Topics',   icon:'📊', value: summary.total_topics, change:'tracked', pos:true },
    { label:'Total Mentions', icon:'📈', value: summary.total_mentions?.toLocaleString(), change:'across all sources', pos:true },
    { label:'Hottest Topic',  icon:'🔥', value: summary.top_rising?.[0]?.topic, change:`+${summary.top_rising?.[0]?.growth_rate}%`, pos:true },
    { label:'Cooling Down',   icon:'❄️', value: summary.top_declining?.[0]?.topic, change:`${summary.top_declining?.[0]?.growth_rate}%`, pos:false },
  ];
  return (
    <div className="insights-row">
      {cards.map((c,i) => (
        <div className="insight-card" key={i}>
          <div className="card-header"><span className="card-label">{c.label}</span><span className="card-icon">{c.icon}</span></div>
          <div className="card-value">{c.value}</div>
          <div className={`card-change ${c.pos?'positive':'negative'}`}>{c.pos?'↑':'↓'} {c.change}</div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ trends }) {
  const [filter, setFilter] = useState('Top 5');
  const topics = Object.keys(trends||{});
  const visible = useMemo(() => {
    const s = [...topics].sort((a,b)=>(trends[b]?.growth_rate||0)-(trends[a]?.growth_rate||0));
    return filter==='All'?s : s.slice(0,filter==='Top 3'?3:5);
  },[topics,filter,trends]);

  if (!topics.length) return null;
  const first = trends[topics[0]];
  const allLabels = [...first.historical.map(p=>p.month), ...first.forecast.map(p=>p.month)];
  const histLen = first.historical.length;

  const datasets = visible.flatMap((topic,i) => {
    const t = trends[topic];
    const col = CCOLORS[i%CCOLORS.length];
    return [
      { label:topic, data:[...t.historical.map(p=>p.mentions), ...Array(t.forecast.length).fill(null)],
        borderColor:col, backgroundColor:col+'18', borderWidth:2, pointRadius:0, pointHoverRadius:4, tension:0.35, fill:true },
      { label:`${topic} (forecast)`, data:[...Array(histLen-1).fill(null), t.historical[histLen-1].mentions, ...t.forecast.map(p=>p.mentions)],
        borderColor:col, backgroundColor:'transparent', borderWidth:2, borderDash:[6,4], pointRadius:0, pointHoverRadius:4, tension:0.35, fill:false },
    ];
  });

  const opts = {
    responsive:true, maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{position:'bottom', labels:{color:'#94a3b8',font:{family:'Inter',size:11},boxWidth:12,padding:14,filter:i=>!i.text.includes('(forecast)')}},
      tooltip:{backgroundColor:'rgba(26,31,53,0.95)',titleColor:'#f1f5f9',bodyColor:'#94a3b8',borderColor:'rgba(99,102,241,0.3)',borderWidth:1,padding:12,filter:i=>!i.dataset.label.includes('(forecast)')},
    },
    scales:{
      x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{family:'Inter',size:10},maxRotation:45}},
      y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{family:'Inter',size:10}},beginAtZero:true},
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>📈 Technology Trends <span className="chart-badge">Time-Series</span></h3>
        <div className="chart-filters">
          {['All','Top 5','Top 3'].map(f => (
            <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>
      <div className="chart-wrapper trend-chart-wrapper">
        <Line data={{labels:allLabels,datasets}} options={opts}/>
      </div>
    </div>
  );
}

function ClusterChart({ clusters }) {
  if (!clusters?.length) return null;
  const data = {
    labels: clusters.map(c=>c.label),
    datasets:[{data:clusters.map(c=>c.size), backgroundColor:CCOLORS, borderColor:'rgba(10,14,26,0.8)', borderWidth:3, hoverOffset:8}],
  };
  const opts = {
    responsive:true, maintainAspectRatio:false, cutout:'62%',
    plugins:{
      legend:{display:false},
      tooltip:{backgroundColor:'rgba(26,31,53,0.95)',titleColor:'#f1f5f9',bodyColor:'#94a3b8',borderColor:'rgba(99,102,241,0.3)',borderWidth:1,padding:12,callbacks:{label:c=>`  ${c.parsed} documents`}},
    },
  };
  return (
    <div className="chart-card">
      <div className="chart-card-header"><h3>🧠 Topic Clusters <span className="chart-badge">NLP K-Means</span></h3></div>
      <div className="cluster-chart-wrapper"><div style={{width:'55%',height:'100%'}}><Doughnut data={data} options={opts}/></div></div>
      <div className="cluster-keywords">
        {clusters.map((c,i)=>(
          <div className="cluster-keyword-row" key={c.cluster_id}>
            <span className="cluster-color-dot" style={{background:CCOLORS[i%CCOLORS.length]}}/>
            <span className="cluster-label">{c.label}</span>
            <span className="cluster-size">{c.size} docs</span>
            <div className="cluster-tags">{c.keywords.slice(0,4).map(k=><span className="cluster-tag" key={k}>{k}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page views ──────────────────────────────────────────── */
function DashboardHome({ summary, trends, clusters }) {
  return (
    <>
      <TopInsights summary={summary}/>
      <div className="charts-grid">
        <TrendChart trends={trends}/>
        <ClusterChart clusters={clusters}/>
      </div>
      <div className="bottom-grid">
        <div className="topics-card rising">
          <h3>🚀 Rising Technologies</h3>
          <ul className="topic-list">
            {summary?.top_rising?.map((t,i)=>(
              <li className="topic-item" key={t.topic}>
                <span className="topic-rank">{i+1}</span>
                <span className="topic-name">{t.topic}</span>
                <span className="topic-rate positive">+{t.growth_rate}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="topics-card declining">
          <h3>📉 Declining Technologies</h3>
          <ul className="topic-list">
            {summary?.top_declining?.map((t,i)=>(
              <li className="topic-item" key={t.topic}>
                <span className="topic-rank">{i+1}</span>
                <span className="topic-name">{t.topic}</span>
                <span className={`topic-rate ${t.growth_rate<0?'negative':'positive'}`}>{t.growth_rate>0?'+':''}{t.growth_rate}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function TrendsPage({ trends }) {
  const sorted = [...TOPICS].sort((a,b)=>(trends[b]?.growth_rate||0)-(trends[a]?.growth_rate||0));
  return (
    <div className="page-view">
      <div className="page-header"><h2>📈 Technology Trends</h2><p className="page-subtitle">Historical adoption data with 6-month forecast</p></div>
      <TrendChart trends={trends}/>
      <div className="chart-card" style={{marginTop:20}}>
        <div className="chart-card-header"><h3>📋 All Technologies — Growth Summary</h3></div>
        <table className="data-table">
          <thead><tr><th>#</th><th>Technology</th><th>Data Points</th><th>Latest Mentions</th><th>Growth Rate</th></tr></thead>
          <tbody>{sorted.map((t,i)=>{
            const d = trends[t];
            const last = d.historical[d.historical.length-1];
            return (
              <tr key={t}>
                <td className="table-rank">{i+1}</td>
                <td className="table-name">{t}</td>
                <td>{d.historical.length} months</td>
                <td>{last.mentions.toLocaleString()}</td>
                <td className={d.growth_rate>=0?'positive':'negative'}>{d.growth_rate>0?'+':''}{d.growth_rate}%</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function ClustersPage({ clusters }) {
  return (
    <div className="page-view">
      <div className="page-header"><h2>🧠 Topic Clusters</h2><p className="page-subtitle">NLP-powered topic discovery using K-Means clustering</p></div>
      <ClusterChart clusters={clusters}/>
    </div>
  );
}

function ForecastsPage({ trends }) {
  const sorted = [...TOPICS].sort((a,b)=>(trends[b]?.growth_rate||0)-(trends[a]?.growth_rate||0));
  return (
    <div className="page-view">
      <div className="page-header"><h2>🔮 Forecasts</h2><p className="page-subtitle">6-month linear regression predictions</p></div>
      <div className="forecast-grid">
        {sorted.map(topic => {
          const t = trends[topic];
          const lh = t.historical[t.historical.length-1];
          const lf = t.forecast[t.forecast.length-1];
          const delta = lf.mentions - lh.mentions;
          const pct = ((delta/lh.mentions)*100).toFixed(1);
          return (
            <div className="forecast-card" key={topic}>
              <div className="forecast-header">
                <h4>{topic}</h4>
                <span className={`forecast-badge ${delta>=0?'up':'down'}`}>{delta>=0?'↑':'↓'} {Math.abs(pct)}%</span>
              </div>
              <div className="forecast-body">
                <div className="forecast-stat"><span className="forecast-label">Current</span><span className="forecast-value">{lh.mentions.toLocaleString()}</span><span className="forecast-date">{lh.month}</span></div>
                <div className="forecast-arrow">→</div>
                <div className="forecast-stat"><span className="forecast-label">Predicted</span><span className="forecast-value highlight">{lf.mentions.toLocaleString()}</span><span className="forecast-date">{lf.month}</span></div>
              </div>
              <div className="forecast-bar-track"><div className={`forecast-bar-fill ${delta>=0?'positive':'negative'}`} style={{width:`${Math.min(Math.abs(Number(pct)),100)}%`}}/></div>
              <div className="forecast-timeline">{t.forecast.map(f=><span className="forecast-point" key={f.month}>{f.month.split('-')[1]}: {f.mentions}</span>)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.technology.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="page-view">
      <div className="page-header"><h2>📄 Documents</h2><p className="page-subtitle">{MOCK_DOCS.length} raw documents ingested from multiple sources</p></div>
      <div className="search-bar-wrapper"><input className="search-bar" placeholder="Search documents…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="docs-grid">
        {filtered.map(doc=>(
          <div className="doc-card" key={doc.id}>
            <div className="doc-card-top"><span className="doc-source-badge">{doc.source}</span><span className="doc-date">{doc.date}</span></div>
            <h4 className="doc-title">{doc.title}</h4>
            <p className="doc-text">{doc.text}</p>
            <div className="doc-card-footer"><span className="doc-tech-badge">{doc.technology}</span></div>
          </div>
        ))}
        {!filtered.length && <div style={{gridColumn:'1/-1',textAlign:'center',padding:40,color:'#64748b'}}>No documents match your search.</div>}
      </div>
    </div>
  );
}

const SOURCES = [
  {name:'TechCrunch',icon:'📰',type:'News',status:'active',desc:'Leading technology media covering startups and tech industry news.'},
  {name:'ArXiv',icon:'🎓',type:'Research Papers',status:'active',desc:'Open-access repository of scientific papers in AI, ML, and computing.'},
  {name:'IEEE Spectrum',icon:'🔬',type:'Journal',status:'active',desc:'Magazine of IEEE covering engineering and applied sciences.'},
  {name:'Wired',icon:'🌐',type:'News',status:'active',desc:'Magazine focused on emerging technologies and culture.'},
  {name:'GitHub Trending',icon:'💻',type:'Repositories',status:'active',desc:'Trending open-source repositories across all programming languages.'},
];

function SourcesPage() {
  return (
    <div className="page-view">
      <div className="page-header"><h2>🗄️ Data Sources</h2><p className="page-subtitle">Aggregated intelligence from {SOURCES.length} vetted sources</p></div>
      <div className="sources-grid">
        {SOURCES.map(s=>(
          <div className="source-card" key={s.name}>
            <div className="source-card-header">
              <span className="source-icon">{s.icon}</span>
              <div><h4>{s.name}</h4><span className="source-type">{s.type}</span></div>
              <span className={`source-status ${s.status}`}><span className="status-dot"/> {s.status}</span>
            </div>
            <p className="source-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page-view">
      <div className="page-header"><h2>⚙️ Settings</h2><p className="page-subtitle">Platform configuration and preferences</p></div>
      <div className="settings-grid">
        {[
          {title:'📊 Data Pipeline',rows:[['Auto-refresh interval','How often the dashboard fetches data','Manual'],['Historical window','Months of trend data to track','24 months'],['Forecast horizon','Number of months to forecast ahead','6 months']]},
          {title:'🧠 ML Engine',rows:[['Clustering algorithm','Method used for topic discovery','K-Means'],['Number of clusters','Target topic groups','5'],['Vectorisation','Text representation method','TF-IDF (500 features)']]},
          {title:'🔔 Alerts & Notifications',rows:[['Email alerts','Receive trend spike notifications','Enabled'],['Slack webhook','Post summaries to Slack channel','Configured'],['Alert threshold','Growth rate to trigger alert','> 50%']]},
        ].map(sec=>(
          <div className="settings-section" key={sec.title}>
            <h3>{sec.title}</h3>
            {sec.rows.map(([l,d,v])=>(
              <div className="setting-row" key={l}>
                <div className="setting-info"><span className="setting-label">{l}</span><span className="setting-desc">{d}</span></div>
                <span className="setting-value">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard main ─────────────────────────────────────── */
export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch(page) {
      case 'trends':    return <TrendsPage trends={MOCK_TRENDS}/>;
      case 'clusters':  return <ClustersPage clusters={MOCK_CLUSTERS}/>;
      case 'forecasts': return <ForecastsPage trends={MOCK_TRENDS}/>;
      case 'documents': return <DocumentsPage/>;
      case 'sources':   return <SourcesPage/>;
      case 'settings':  return <SettingsPage/>;
      default: return <DashboardHome summary={MOCK_SUMMARY} trends={MOCK_TRENDS} clusters={MOCK_CLUSTERS}/>;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>Tech_Intel</h1>
            <span className="logo-sub">Intelligence Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item,i) => item.section
            ? <span className="nav-section-label" key={`s${i}`}>{item.section}</span>
            : (
              <a key={item.id} className={`nav-item ${page===item.id?'active':''}`} href="#"
                onClick={e=>{e.preventDefault();setPage(item.id);}}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </a>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{user.initials||'U'}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-email">{user.email}</span>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
          <div className="sidebar-status"><span className="status-dot"/><span>Pipeline Active</span></div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-container">
        <header className="dash-header-bar">
          <div className="dash-header-left">
            <h2>{TITLES[page]}</h2>
            <span className="dash-header-breadcrumb">{SUBS[page]}</span>
          </div>
          <div className="dash-header-right">
            <div className="header-badge"><span className="badge-dot"/>Live</div>
            <span className="header-time">{new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</span>
          </div>
        </header>
        <main className="dashboard">{renderPage()}</main>
      </div>
    </div>
  );
}
