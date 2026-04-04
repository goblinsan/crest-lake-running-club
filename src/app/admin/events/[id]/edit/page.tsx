'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  distance: string | null;
  type: string;
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [type, setType] = useState('WEEKLY_SHORT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((event: EventData) => {
        setTitle(event.title);
        setDescription(event.description ?? '');
        setDate(new Date(event.date).toISOString().slice(0, 16));
        setLocation(event.location ?? '');
        setDistance(event.distance ?? '');
        setType(event.type);
      })
      .catch(() => setError('Failed to load event.'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date, location, distance, type }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? 'Failed to update event.');
    } else {
      router.push('/admin/events');
      router.refresh();
    }
  }

  async function handleDelete(): Promise<void> {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    setDeleting(true);

    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });

    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? 'Failed to delete event.');
    } else {
      router.push('/admin/events');
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/events" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
        ← Back to Events
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-blue-700">Edit Event</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
            Date &amp; Time <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="WEEKLY_SHORT">Weekly Short Run</option>
            <option value="WEEKLY_LONG">Weekly Long Run</option>
            <option value="SPECIAL">Special Event</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="distance" className="mb-1 block text-sm font-medium text-gray-700">
            Distance
          </label>
          <input
            id="distance"
            type="text"
            placeholder="e.g. 3–5 miles"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || deleting}
            className="flex-1 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="rounded-lg border border-red-600 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </form>
    </main>
  );
}
