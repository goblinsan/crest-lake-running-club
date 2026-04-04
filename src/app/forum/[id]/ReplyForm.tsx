'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReplyForm({ discussionId }: { discussionId: string }): React.JSX.Element {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/forum/${discussionId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? 'Failed to post reply.');
    } else {
      setBody('');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700">Add a Reply</h3>
      {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>}
      <textarea
        rows={4}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {loading ? 'Posting…' : 'Post Reply'}
      </button>
    </form>
  );
}
