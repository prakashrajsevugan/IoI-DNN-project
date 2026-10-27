# IoT-Based EV Charging Demand Prediction Using DNN

> **Final-Year Project**: An integrated engineering dashboard combining ESP32 IoT telemetry (Wokwi simulation) and Deep Neural Network forecasting models to monitor and predict short-term EV charging demand.

---

## ⚡ Project Overview

Electric Vehicle (EV) adoption poses challenges to grid resilience due to unpredictable charging loads. This system implements an end-to-end pipeline:
1. **IoT Edge Simulation**: ESP32 microcontrollers simulated in Wokwi transmit real-time telemetry (station voltage, current draw, power kW, temperature, charging session status) over MQTT/HTTP.
2. **AI Forecasting Engine**: Compares multiple state-of-the-art time-series models:
   - **DNN / LSTM**: Primary deep learning model tailored for recurrent load profiles.
   - **PatchTST**: Transformer-based baseline utilizing subseries patch extraction.
   - **TimesFM 2.5**: Zero-shot foundation model for time-series forecasting.
3. **Engineering Dashboard**: React + TypeScript frontend providing live telemetry visualization, 24h demand forecasting with confidence intervals, model benchmark comparisons, and system settings.

---

## 🚀 Key Features

- **Executive KPI Dashboard**: Live aggregated demand (kW), grid load utilization (%), active charging sessions, and automated demand surge alerts.
- **Real-Time IoT Telemetry**: Per-station voltage, current, power factor, thermal status, and charging curve graphs with live polling/streaming support.
- **Multi-Model Forecast Hub**: Dynamic side-by-side visualization of DNN/LSTM, PatchTST, and TimesFM predictions across customizable forecasting horizons (6h, 12h, 24h).
- **Model Benchmark & Metrics**: Comprehensive evaluation metrics (RMSE, MAE, R², MAPE, inference latency, parameter footprint).
- **Historical Analytics**: Historical charging trends, peak usage heatmaps, and energy consumption analysis.
- **Wokwi Device Manager**: Real-time ESP32 gateway health, MQTT broker status, packet loss statistics, and simulated telemetry generator.
- **Configurable Settings**: Custom API endpoints, polling frequencies, alert thresholds, and toggle between simulated and live backend data.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a dark cyber-engineering theme and glassmorphism elements
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)

---

## 📁 Directory Structure

```text
IoT-DNN/
├── src/
│   ├── assets/                # Static assets & icons
│   ├── components/
│   │   ├── charts/            # Reusable Recharts components
│   │   │   ├── ChargingLoadChart.tsx
│   │   │   ├── ForecastChart.tsx
│   │   │   ├── ModelComparisonChart.tsx
│   │   │   └── RealTimeDemandChart.tsx
│   │   └── ui/                # UI cards, badges, KPI cards, alerts
│   │       ├── DemandAlert.tsx
│   │       ├── KPICard.tsx
│   │       └── SharedComponents.tsx
│   ├── hooks/                 # Custom React hooks (usePolling, useSettings)
│   ├── layouts/               # Sidebar & AppLayout wrappers
│   ├── pages/                 # Route pages
│   │   ├── DashboardPage.tsx  # Overview & executive KPIs
│   │   ├── MonitoringPage.tsx # Live station telemetry
│   │   ├── ForecastPage.tsx   # AI load demand predictions
│   │   ├── ModelsPage.tsx     # DNN vs PatchTST vs TimesFM comparison
│   │   ├── AnalyticsPage.tsx  # Historical usage trends
│   │   ├── DevicePage.tsx     # ESP32 / Wokwi gateway status
│   │   ├── SessionsPage.tsx   # Active and historical charging logs
│   │   └── SettingsPage.tsx   # System configurations
│   ├── services/              # API layer & mock telemetry generator
│   ├── types/                 # TypeScript interfaces and data contracts
│   ├── utils/                 # Formatting and math utilities
│   ├── App.tsx                # Application routes
│   ├── index.css              # Custom styling & Tailwind configuration
│   └── main.tsx               # App entry point
├── index.html                 # HTML shell with Google Fonts
├── vite.config.ts             # Vite configuration
└── package.json
```

---

## 🏃 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or newer recommended)
- `npm` or `yarn`

### 2. Installation
```bash
# Clone or navigate to the project directory
cd IoT-DNN

# Install dependencies
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173/`.

### 4. Building for Production
```bash
npm run build
npm run preview
```

---

## 🔌 Connecting to Live Hardware / Backend

By default, the application runs in **Simulated Mode**, generating realistic synthetic telemetry and model forecasts.

To link the dashboard to a live backend (e.g., FastAPI, Flask, or Node.js MQTT broker):
1. Navigate to **Settings** in the dashboard sidebar.
2. Toggle off **Mock Data Fallback**.
3. Set your **Backend API Base URL** (e.g., `http://localhost:8000/api`).
4. Set the **Wokwi ESP32 Telemetry Endpoint** or WebSocket stream.
5. Save the configuration.

---

## 📊 AI Models Explained

| Model | Role | Characteristics |
| :--- | :--- | :--- |
| **DNN / LSTM** | Primary Deep Model | Captures sequential charging curves and diurnal periodicity. |
| **PatchTST** | Baseline Architecture | Segments time-series into subseries patches to preserve local semantics. |
| **TimesFM 2.5** | Foundation Comparison | Google zero-shot foundation model demonstrating generalized forecasting capabilities. |
