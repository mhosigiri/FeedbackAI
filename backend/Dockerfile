FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install dependencies first for better layer caching.
# NOTE: Build context must be the backend/ directory.
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . ./

# Cloud Run will set $PORT; default to 8080 for local runs
ENV PORT=8080

# Use shell form to expand $PORT at runtime (required by Cloud Run)
CMD sh -c 'uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}'


