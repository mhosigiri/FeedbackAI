function firstFromList(val?: string | null): string | undefined {
  if (!val) return undefined;
  const pick = val.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)[0];
  return pick;
}

const RUNTIME_FALLBACK =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : 'http://localhost:8080';

const FROM_ENV = firstFromList(process.env.REACT_APP_BACKEND_URL);
const BASE_URL = (FROM_ENV || RUNTIME_FALLBACK).replace(/\/+$/, '');

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getConfig() {
  const res = await fetch(`${BASE_URL}/config`);
  return handle(res);
}

export async function analyze(payload: { query: string; limit?: number; subreddits?: string[]; keywords?: string[] }) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limit: 9, ...payload }),
  });
  return handle(res);
}

export async function chat(payload: { message: string }) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle<{ reply: string }>(res);
}

export { BASE_URL };

export async function listAnalyses(limit: number = 10) {
  const res = await fetch(`${BASE_URL}/feedback/analyses?limit=${Math.max(1, limit)}`);
  return handle(res);
}


