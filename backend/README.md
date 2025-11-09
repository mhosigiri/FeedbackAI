# T-Sentiment Agent API

FastAPI backend that powers the realtime sentiment dashboard. All external integrations are mocked right now so we can prove frontend/backend wiring before plugging in live services.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then drop in your API keys
uvicorn main:app --reload --port 8000
```

## Environment Variables

| Name | Purpose |
| --- | --- |
| `REDDIT_API_KEY` | OAuth bearer token / API key for Reddit search |
| `REDDIT_BASE_URL` | Override host (default `https://oauth.reddit.com`) |
| `NEMOTRON_API_KEY` | NVIDIA Nemotron agent calls |
| `NEMOTRON_MODEL` | Optional override of the Nemotron checkpoint |
| `GEMINI_API_KEY` | Google Gemini CSI computation |
| `GOOGLE_MAPS_API_KEY` | Google Maps / geocoding |
| `FRONTEND_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `MOCK_MODE` | Force mock data even if keys exist |

## Endpoints

- `GET /health` – readiness check used by the frontend.
- `GET /config` – lets the UI know which API keys are configured.
- `GET /posts?query=` – pulls Reddit discussions tied to the query (falls back to mocks if no key).
- `POST /analyze` – orchestrates Reddit ingestion + Nemotron classification and returns sentiment, CSI, and highlights.

### Reddit credentials

Create a Reddit application (script or installed app) and exchange your client credentials for an OAuth bearer token (client credentials grant or password grant both work). Drop that short-lived token into `REDDIT_API_KEY` and keep `MOCK_MODE=false` to hit the live `/search` endpoint. During demos you can flip `MOCK_MODE=true` to avoid external calls.

### Nemotron (NVIDIA)

Set `NEMOTRON_API_KEY` to your NVIDIA AI Foundation key. The backend uses the OpenAI-compatible SDK to call `mistralai/mistral-nemotron`, which returns per-post ratings (1–5), problem categories, and a CSI summary. Without a key the service falls back to lightweight keyword heuristics so the UI still renders.
