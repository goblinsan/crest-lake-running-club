'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteDiscussionButton({ discussionId }: { discussionId: string }): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    setLoading(true);

    const res = await fetch(`/api/forum/${discussionId}`, { method: 'DELETE' });

    setLoading(false);

    if (res.ok) {
      router.push('/forum');
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
