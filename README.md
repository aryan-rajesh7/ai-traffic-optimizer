# AI Traffic Optimizer

A full-stack, real-time Geographic Information System (GIS) that optimizes urban signal flow using live TomTom API telemetry, WebSocket orchestration, and Gemini 2.5 Flash RAG.

## Overview

The AI Traffic Optimizer replaces static traffic light timing models with dynamically generated signal strategies based on live network conditions. It establishes a persistent WebSocket connection to the TomTom Traffic Flow API to ingest live speed, flow, and incident data for any custom global address. This data is visualized via MapLibre GL JS and processed through a Retrieval-Augmented Generation (RAG) pipeline powered by Google's Gemini 2.5 Flash to generate human-readable, real-time mitigation strategies.

*(Note: The machine learning training pipeline for this project is hosted separately in the `landing-ml-graphs` repository).*

## System Architecture

1. **Global Address Resolution:** The Next.js frontend uses the Nominatim OpenStreetMap API for asynchronous forward-geocoding of natural language addresses into precise GPS coordinates.
2. **Dynamic Telemetry Ingestion:** The FastAPI backend queries the TomTom Traffic Flow API for granular JSON payloads containing current street speeds, free-flow speeds, and road closure data.
3. **WebSocket Orchestration:** A background `asyncio` task polls the endpoints every 30 seconds, pushing localized JSON dataframes over an active WebSocket connection to bypass continuous HTTP polling overhead.
4. **Reasoning Engine (RAG):** Live numerical traffic metrics are serialized into structured prompts for Gemini 2.5 Flash to generate actionable signal timing modifications.
5. **Geospatial Rendering:** The React client utilizes MapLibre GL JS to natively render base map tiles and inject live congestion data as color-coded vector layers.

## Tech Stack

**Languages**
* Python 3.11 (Core backend & ML scripting)
* TypeScript / JavaScript (Type-safe frontend development)
* C++ (High-performance extensions via `pybind11`)
* SQL (Database querying & management)

**Frontend**
* Next.js 14 / React 18 (Server-side rendering & stream state management)
* MapLibre GL JS / OpenFreeMap (Geospatial vector rendering)
* Tailwind CSS (Utility-first styling)

**Backend**
* FastAPI / Uvicorn (Asynchronous ASGI framework)
* WebSockets (Real-time duplex streaming)
* Celery / Redis (Distributed task queue & message broker)
* SlowAPI (Endpoint rate limiting)
* httpx / python-dotenv (Async HTTP client & environment configuration)

**Machine Learning & Data Processing**
* PyTorch / LSTM (Deep learning & time-series forecasting)
* XGBoost / ONNX Runtime (Gradient boosting & optimized inference)
* scikit-learn / NumPy / pandas (Data manipulation & traditional ML)
* Matplotlib / Seaborn (Exploratory data visualization)

**APIs & AI**
* Google Gemini 2.5 Flash (Core LLM reasoning engine)
* LangChain / RAG (Retrieval-Augmented Generation pipeline)
* TomTom Traffic Flow API (Live traffic telemetry ingestion)
* Nominatim OpenStreetMap (Address-to-coordinate geocoding)

**DevOps & Infrastructure**
* Docker / Docker Compose (Containerization & local orchestration)
* GitHub Actions (Automated CI/CD pipelines)
* Vercel / Hugging Face Spaces / Koyeb (Cloud deployment & hosting environment)

**Tools**
* Git / GitHub (Version control & repository management)
* pnpm / npm / pip (Dependency management)
* VS Code / virtualenv (Development environment)

## Directory Structure

```text
ai-traffic-optimizer/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application and WebSocket router
│   │   ├── ingestion/        # TomTom API ingestion logic
│   │   ├── rag/              # Gemini 2.5 Flash prompts and integration
│   │   └── ws/               # WebSocket connection manager
│   ├── requirements.txt
│   └── .env                  # Backend API keys
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main map interface and WebSocket client
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/           # UI components (Legend, Controls)
│   ├── package.json
│   └── .env.local            # Frontend public variables
└── README.md
