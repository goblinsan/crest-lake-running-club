'use client';

import { useState } from 'react';

export default function SendRemindersButton({ eventId }: { eventId: string }): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSend(): Promise<void> {
    if (!confirm('Send email reminders to all members who RSVPed as Attending?')) return;

    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/events/${eventId}/notify`, { method: 'POST' });
    const data = await res.json();

    setLoading(false);

    if (res.ok) {
      const { sent, total } = data as { sent: number; total: number };
      setResult(`✓ Reminders sent to ${sent} of ${total} attendees.`);
    } else {
      setResult(`Error: ${(data as { error?: string }).error ?? 'Failed to send reminders.'}`);
    }
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? 'Sending…' : '📧 Send Reminders'}
      </button>
      {result && <p className="mt-2 text-xs text-gray-500">{result}</p>}
    </div>
  );
}
