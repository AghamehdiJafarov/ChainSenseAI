# ChainSense — Supply Chain Intelligence

Trilingual (RU / EN / AZ) supply-chain analytics platform. Fifteen modules spanning the full planning cycle: demand forecasting, inventory optimization, procurement, supplier scoring, route optimization, warehouse slotting, predictive maintenance, quality inspection, risk management, ETA estimation, classification, invoice OCR, an agentic assistant, packing, and carbon accounting.

Built as a single React application with a self-contained analytics core (no backend required for the fifteen modules) and three optional AI features that call the Anthropic API through a serverless proxy.

## What runs where

The **analytics core** — all fifteen modules' math — runs entirely in the browser. Holt–Winters forecasting with rolling-origin backtest, EOQ / ROP / safety-stock with a demand simulation, MRP purchase planning, weighted supplier scoring with sensitivity flip-points, nearest-neighbour + 2-opt routing, ABC slotting, health / RUL / logistic-failure maintenance models, a precision/recall detector with an adjustable threshold, a seeded Monte-Carlo risk model with a loss-exceedance curve, log-normal P50/P90 ETA, dictionary classification, invoice parsing with arithmetic cross-checks, first-fit-decreasing bin packing with an isometric 3D layout, and CO2e factors with a modal-shift scenario. None of this needs a key or a network.

Three **AI features** need the Anthropic API: invoice OCR from an image (SC-12), the agentic chat assistant that can drive the UI (SC-13), and the "Ask Claude" classifier comparison (SC-11). These call `/api/claude`, a serverless function that holds the key server-side.

## Local development

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. The fifteen modules work immediately. For the AI features, create a `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Note: `npm run dev` (Vite) does not run the `/api` serverless function locally. To exercise the AI features locally, use the Vercel CLI (`npm i -g vercel`, then `vercel dev`), which serves both the frontend and the `/api` function together.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, import the repository. Vercel auto-detects Vite — no configuration needed.
3. In **Project Settings → Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Deploy. Every push to the main branch triggers a rebuild.

The `/api/claude.js` file becomes a serverless endpoint automatically. The key lives only in the server environment and never reaches the browser bundle.

## API key

Get a key at [console.anthropic.com](https://console.anthropic.com/). Usage is billed per token against your Anthropic account. Without a key the platform still runs — only the three AI features are inert.

## Stack

React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide icons, PapaParse (CSV import), SheetJS (XLSX export). State lives in a single Context + reducer data bus; the pipeline links demand → inventory → procurement, supplier risk → risk register, and route distance → ETA / carbon. Scenario snapshots and language preference persist via `localStorage`.
