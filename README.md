# TechIntel - Technology Intelligence Platform

TechIntel is an advanced AI-powered platform that aggregates real-time technology data, detects emerging technology clusters, forecasts future growth trends, and generates AI-based executive summaries for technology insights.

##🚀 Features

### Core Capabilities

- **Real-time Tech Data Aggregation** - Collects and processes live data from multiple sources including News, GitHub, and Research publications
- **Emerging Technology Detection** - Automatically identifies and clusters emerging technology trends using advanced ML algorithms
- **Growth Trend Forecasting** - Predicts future technology adoption and growth patterns with data-driven insights
- **AI Executive Summaries** - Generates concise, actionable summaries for business and technical decision-making

### Key Components

- **Data Ingestion Engine** - Real-time data collection from diverse tech sources
- **ML Analysis Engine** - Machine learning models for pattern detection and clustering
- **AI Summarization** - Natural language processing for intelligent content summarization
- **Interactive Dashboard** - Modern React frontend for data visualization and insights

##🛠️ Tech Stack

### Backend
- **Python 3.8+**
- **FastAPI** - High-performance API framework
- **SQLite** - Database storage
- **Scikit-learn** - Machine learning algorithms
- **Transformers** - AI/ML models for summarization
- **LangChain** - Framework for developing language model applications
- **Requests** - HTTP client for data fetching

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **CSS Modules** - Scoped styling
- **React Router** - Client-side routing

##📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- Git (for cloning)

##🏗️ Project Structure

```
TechIntel/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── ai_summarizer.py     # AI summarization engine
│   ├── data_generator.py   # Sample data generation
│   ├── ml_engine.py        # Machine learning analysis
│   ├── real_ingester.py    # Real-time data ingestion
│   ├── storage.py          # Database operations
│   ├── requirements.txt    # Python dependencies
│  └── tech_intel.db       # SQLite database
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── App.jsx         # Main application component
    │  └── main.jsx        # Application entry point
    ├── package.json        # Node.js dependencies
   └── vite.config.js      # Vite configuration
```

##⚙ Environment Setup

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd TechIntel/backend
   ```

2. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database (if needed):**
   ```bash
   python storage.py
   ```

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd TechIntel/frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

##▶ Running the Application

### Backend Server

1. **Start the FastAPI server:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Server will start at:** `http://localhost:8000`

### Frontend Development Server

1. **Start the React development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Frontend will be available at:** `http://localhost:5173`

### Running Both Services

For development, run both servers simultaneously in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8000   

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📈 Data Flow

1. **Data Ingestion** → Collect data from News, GitHub, Research sources
2. **Storage** → Save raw data in SQLite database
3. **Processing** → Clean and preprocess text data
4. **Analysis** → Run ML clustering and trend detection
5. **Summarization** → Generate AI-powered executive summaries
6. **Presentation** → Display insights through React frontend
