# 🔬 CodeSenseX – Intelligent Code Quality & Bug Risk Analyzer

<div align="center">

**AI-Powered Static Analysis • ML-Based Bug Risk Prediction • NLP Code Understanding**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-00C7B7?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 🎯 Overview

CodeSenseX is a cutting-edge code quality analysis platform that combines **Machine Learning**, **Natural Language Processing**, and **Static Analysis** to predict bug-prone code, detect code smells, and provide intelligent refactoring suggestions.

### Key Features

- 🔮 **ML-Based Bug Risk Prediction** – Heuristic and ML models for risk scoring
- 🧠 **NLP-Powered Code Understanding** – Natural language explanations of code issues
- 📊 **Rich Visualizations** – Interactive heatmaps, charts, and risk dashboards
- 🎯 **SHAP Explainability** – Understand why code is flagged as risky
- 📝 **AI Refactoring Suggestions** – GPT-powered fix recommendations
- 📄 **PDF Report Export** – Generate executive summary reports

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ & npm
- **Python** 3.10+
- **MongoDB** (optional – uses in-memory DB by default)

---

## Backend (FastAPI)

### Setup
```powershell
Set-Location "c:\Users\JUNAID ASAD KHAN\bug risk NLP\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Test Endpoints
```powershell
# Health check
curl http://localhost:8000/

# Queue a repository
curl -X POST http://localhost:8000/upload/repo -H "Content-Type: application/json" -d '{"source_type":"github","source_ref":"https://github.com/org/repo"}'

# Start scan
curl -X POST http://localhost:8000/scan/project -H "Content-Type: application/json" -d '{"project_id":"demo"}'

# Get metrics
curl http://localhost:8000/metrics/demo

# Get risks
curl http://localhost:8000/risks/demo

# Get suggestions
curl http://localhost:8000/suggestions/file123

# Export report
curl -X POST http://localhost:8000/report/export -H "Content-Type: application/json" -d '{"project_id":"demo","format":"pdf"}'
```

---

## Frontend (React + Tailwind)

### Setup
```powershell
Set-Location "c:\Users\JUNAID ASAD KHAN\bug risk NLP\frontend"
npm install
npm run dev
```

Open http://localhost:5173

---

## 📁 Project Structure

```
codesensex/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── controllers/            # Route handlers
│   ├── services/               # Business logic & database
│   ├── ml/                     # Machine learning models
│   ├── parsers/                # Code parsers (Python AST)
│   ├── config/                 # MongoDB configuration
│   └── models/                 # Pydantic schemas
│
└── frontend/
    └── src/
        ├── main.jsx            # App shell & navigation
        ├── components/         # Reusable UI components
        ├── pages/              # Page components
        └── services/           # API client
```

---

## 🎨 UI Theme

- **Dark Mode** – Deep grey background (#09090b)
- **Glassmorphism** – Frosted glass effect cards
- **Teal/Cyan Accents** – Gradient highlights
- **Framer Motion** – Smooth animations

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload/repo` | POST | Queue a GitHub repository |
| `/scan/project/{id}/start` | POST | Start analysis |
| `/metrics/{project_id}` | GET | Get file metrics |
| `/risks/{project_id}` | GET | Get risk scores |
| `/suggestions/{file_id}` | GET | Get AI suggestions |
| `/report/export` | POST | Generate PDF report |

---

## 📄 License

MIT © 2024 CodeSenseX
