# ClinAlert 🏥

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](#)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?logo=react&logoColor=black)](#)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](#)
[![Neon Postgres](https://img.shields.io/badge/Database-Neon_Postgres-00E599?logo=postgresql&logoColor=black)](#)

ClinAlert is an AI-powered clinical assistant designed to analyze handwritten medical prescriptions, identify cheaper generic alternatives, warn about known side effects, and highlight regulatory alerts from government databases.

**🌍 Live Demo:** [https://clin-alert.vercel.app](https://clin-alert.vercel.app)

> **Demo Login:** `demo@clinalert.com` / `password123`

## Screenshots 📸

<div align="center">
  <img src="image/landing_features.png" alt="Landing Page Features" width="49%">
  <img src="image/landing_steps.png" alt="Landing Page Steps" width="49%">
</div>
<br>
<div align="center">
  <img src="image/ai_assistant.png" alt="Agentic AI Assistant Chat" width="49%">
  <img src="image/dashboard.png" alt="Clinical Dashboard" width="49%">
</div>

## System Architecture 🏗️

```mermaid
graph TD;
    A["User Uploads Prescription"] -->|"React / Vite"| B["FastAPI Backend"];
    B -->|"Extracts Text"| C["OpenAI Vision / LangChain"];
    B -->|"Uploads Image"| D["Cloudinary Storage"];
    B -->|"Queries DB"| E[("Neon PostgreSQL")];
    E --> F["Master Drugs"];
    E --> G["PMBI Alternatives"];
    E --> H["SIDER Side Effects"];
    E --> I["CDSCO Recalls"];
    F --> J["Aggregated JSON Response"];
    G --> J;
    H --> J;
    I --> J;
    J --> B;
    B -->|"Returns Analysis"| A;
```

## Features 🚀

- **Vision AI Prescription Parsing**: Upload handwritten prescriptions and automatically extract drug names using OpenAI's GPT-4 Vision and LangChain.
- **Brand-to-Generic Translation**: Automatically cross-references branded medications with their underlying chemical generic names.
- **Cheaper Alternatives (PMBI)**: Suggests affordable, government-subsidized generic equivalents.
- **Side Effect Warnings (SIDER)**: Maps prescribed drugs against databases to instantly flag known adverse side effects.
- **Regulatory Recalls (CDSCO)**: Checks Indian regulatory databases to warn doctors and patients about recalled medications.
- **Persistent Cloud Storage**: Safely stores prescription images using Cloudinary.

## Datasets Used 📚

This application leverages real-world medical data to provide accurate insights:
1. **Tata 1mg Dataset**: Used to map thousands of Indian commercial brand names to their true generic components.
2. **PMBI (Pradhan Mantri Bhartiya Janaushadhi Pariyojana)**: Indian government data used to recommend highly subsidized generic alternatives.
3. **SIDER (Side Effect Resource)**: European biological database used to map medications to their known adverse side effects and MedDRA concepts.
4. **CDSCO (Central Drugs Standard Control Organisation)**: Used to flag Not of Standard Quality (NSQ) or recalled drugs in the Indian market.

## Tech Stack 🛠️

**Frontend:**
- React (Vite)
- TailwindCSS
- Vercel (Deployment)

**Backend:**
- Python & FastAPI
- SQLAlchemy (ORM)
- Render (Deployment)

**AI & Data:**
- LangChain & OpenAI Vision API
- FAISS (Vector Database)
- PostgreSQL hosted on Neon (Serverless Cloud DB)

## Running Locally 💻

### Backend Setup
1. `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Install dependencies: `pip install -r requirements.txt`
4. Set up your `.env` file with `DATABASE_URL`, `OPENAI_API_KEY`, and `CLOUDINARY_URL`.
5. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd clinalert-frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## License
MIT License
