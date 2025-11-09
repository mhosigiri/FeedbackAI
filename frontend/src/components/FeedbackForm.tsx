import React, { useState } from 'react';
import { BASE_URL } from '../api';

interface Props {
  onAdded?: () => void;
}

const FeedbackForm: React.FC<Props> = ({ onAdded }) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('customer');
  const [locationHint, setLocationHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setStatus('Please enter feedback text.');
      return;
    }
    setBusy(true);
    setStatus('Submitting…');
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          author: author.trim() || 'customer',
          location_hint: locationHint.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      // Mark the moment feedback was received to unlock workflow processing
      const now = Date.now();
      try {
        localStorage.setItem('feedbackLastSubmittedAt', String(now));
        window.dispatchEvent(new CustomEvent('feedback:submitted', { detail: { at: now } }));
      } catch {}
      setText('');
      setLocationHint('');
      setStatus('Saved. Recomputing analytics…');
      onAdded?.();
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Failed to submit'}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Add Feedback</h3>
      <div>
        <label className="block text-sm mb-1">Text</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your experience…"
          required
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">Author</label>
          <input className="w-full border rounded px-3 py-2" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Location hint</label>
          <input className="w-full border rounded px-3 py-2" value={locationHint} onChange={(e) => setLocationHint(e.target.value)} placeholder="e.g., Dallas, TX" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="px-4 py-2 bg-[#E20074] text-white rounded disabled:opacity-60">
          {busy ? 'Saving…' : 'Save'}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </form>
  );
};

export default FeedbackForm;


