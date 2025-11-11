# T-Sentiment Agent API

FastAPI backend that powers the realtime sentiment dashboard. All external integrations are mocked right now so we can prove frontend/backend wiring before plugging in live services.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then drop in your API keys
uvicorn main:app --reload --port 8080
```

## Environment Variables

| Name | Purpose |
| --- | --- |
| `REDDIT_API_KEY` | OAuth bearer token / API key for Reddit search |
| `REDDIT_BASE_URL` | Override host (default `https://oauth.reddit.com`) |
| `NEMOTRON_API_KEY` | NVIDIA Nemotron agent calls |
| `NEMOTRON_MODEL` | Optional override of the Nemotron checkpoint |
| `OPENROUTER_API_KEY` | API key for OpenRouter (JOY chat) |
| `OPENROUTER_MODEL` | Optional override (default `openrouter/auto`) |
| `OPENROUTER_BASE_URL` | Override host (default `https://openrouter.ai/api/v1`) |
| `GEMINI_API_KEY` | (legacy) Google Gemini CSI computation |
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

### JOY Chat via OpenRouter

Set:

```
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openrouter/auto
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

The `/chat` endpoint now uses OpenRouter with a system prompt that makes JOY a T‑Mobile IT expert who provides in‑depth onboarding and troubleshooting guidance.

## Run Nemotron (Mistral) locally for faster, unlimited inference

Two options:

1) vLLM (OpenAI-compatible, easiest dev)

```bash
docker run --rm -it -p 8001:8000 \
  --gpus all \
  -e VLLM_WORKER_CONCURRENCY=1 \
  vllm/vllm-openai:latest \
  --model mistralai/Mistral-7B-Instruct-v0.3 \
  --max-model-len 8192
```

Then set in `backend/.env`:

```
NEMOTRON_BASE_URL=http://localhost:8001/v1
NEMOTRON_MODEL=mistralai/Mistral-7B-Instruct-v0.3
# API key not required for local; leave empty or set NEMOTRON_API_KEY=local
```

2) NVIDIA NIM (enterprise‑grade, requires access)

```bash
docker run --rm -it --gpus all -p 8001:8001 \
  -e NGC_API_KEY=$NGC_API_KEY \
  -e MODEL_ID=mistralai/mistral-nemotron \
  nvcr.io/nim/llm:latest
```

Then set:

```
NEMOTRON_BASE_URL=http://localhost:8001/v1
NEMOTRON_MODEL=mistralai/mistral-nemotron
# NEMOTRON_API_KEY can be left empty for local NIM if not required
```

3) NVIDIA NIM – Nemotron Super 49B v1.5 (OpenAI‑compatible, local)

```bash
# 1) Login to NVIDIA NGC container registry
docker login nvcr.io
# Username: $oauthtoken
# Password: <YOUR_NGC_API_KEY>

# 2) Export key and prepare local cache (improves cold start)
export NGC_API_KEY=<YOUR_NGC_API_KEY>
export LOCAL_NIM_CACHE=~/.cache/nim
mkdir -p "$LOCAL_NIM_CACHE"

# 3) Run the Nemotron Super 49B v1.5 NIM locally
docker run -it --rm \
  --gpus all \
  --shm-size=16GB \
  -e NGC_API_KEY \
  -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
  -u $(id -u) \
  -p 8000:8000 \
  nvcr.io/nim/nvidia/llama-3.3-nemotron-super-49b-v1.5:latest
```

Then set in `backend/.env`:

```
NEMOTRON_BASE_URL=http://0.0.0.0:8000/v1
NEMOTRON_MODEL=nvidia/llama-3.3-nemotron-super-49b-v1.5
# For local NIM, leave NEMOTRON_API_KEY empty
```

Quick sanity check (optional):

```bash
curl -X POST \
  'http://0.0.0.0:8000/v1/chat/completions' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    "messages": [
      {"role": "system", "content": "detailed thinking off"},
      {"role":"user", "content":"Write a limerick about the wonders of GPU computing."}
    ],
    "max_tokens": 64
  }'
```

Notes:
- Port tip: The FastAPI backend defaults to port 8000. If you keep NIM on 8000, start FastAPI on another port (e.g., `uvicorn main:app --port 8080` and set `REACT_APP_BACKEND_URL=http://localhost:8080`). Otherwise, map NIM to 8001 (`-p 8001:8000`) and set `NEMOTRON_BASE_URL=http://localhost:8001/v1`.
- The backend now permits local endpoints without `NEMOTRON_API_KEY`. If `NEMOTRON_BASE_URL` points to `localhost`/`127.0.0.1`, it will proceed with a dummy key.
- You can switch back to NVIDIA hosted by restoring `NEMOTRON_BASE_URL=https://integrate.api.nvidia.com/v1` and setting `NEMOTRON_API_KEY`.
