'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RsvpButtonsProps {
  eventId: string;
  currentStatus: string | null;
}

export default function RsvpButtons({ eventId, currentStatus }: RsvpButtonsProps): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(currentStatus);

  async function handleRsvp(newStatus: string): Promise<void> {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
  }

  const options = [
    {
      value: 'ATTENDING',
      label: "I'm Going",
      active: 'bg-green-600 text-white',
      inactive: 'border border-green-600 text-green-700 hover:bg-green-50',
    },
    {
      value: 'MAYBE',
      label: 'Maybe',
      active: 'bg-yellow-500 text-white',
      inactive: 'border border-yellow-500 text-yellow-700 hover:bg-yellow-50',
    },
    {
      value: 'NOT_ATTENDING',
      label: "Can't Go",
      active: 'bg-red-600 text-white',
      inactive: 'border border-red-600 text-red-700 hover:bg-red-50',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleRsvp(opt.value)}
          disabled={loading}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
            status === opt.value ? opt.active : opt.inactive
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
