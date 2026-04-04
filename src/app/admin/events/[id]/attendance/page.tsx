'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  userId: string;
  status: string;
  checkedIn: boolean;
  user: { id: string; name: string; email: string };
}

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
  const { id: eventId } = use(params);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventRes, attendanceRes, membersRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/attendance`),
        fetch('/api/members'),
      ]);
      const eventData = await eventRes.json();
      const attendanceData = await attendanceRes.json();
      const membersData = await membersRes.json();

      setEventTitle((eventData as { title?: string }).title ?? 'Event');
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      setAllMembers(Array.isArray(membersData) ? membersData : []);
    } catch {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function toggleCheckIn(userId: string, currentValue: boolean): Promise<void> {
    setSaving(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, checkedIn: !currentValue }),
      });
      if (res.ok) {
        setAttendance((prev) => prev.map((a) => (a.userId === userId ? { ...a, checkedIn: !currentValue } : a)));
      }
    } finally {
      setSaving(null);
    }
  }

  async function addWalkIn(userId: string): Promise<void> {
    setSaving(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, checkedIn: true }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(null);
    }
  }

  const attendanceUserIds = new Set(attendance.map((a) => a.userId));
  const walkIns = allMembers.filter((m) => !attendanceUserIds.has(m.id));
  const checkedInCount = attendance.filter((a) => a.checkedIn).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/events" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
        ← Back to Events
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Attendance Check-In</h1>
          {eventTitle && <p className="mt-1 text-gray-600">{eventTitle}</p>}
        </div>
        <div className="rounded-xl bg-blue-50 px-5 py-3 text-center">
          <p className="text-3xl font-bold text-blue-700">{checkedInCount}</p>
          <p className="text-xs text-blue-600">Checked In</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <>
          {/* RSVPs list */}
          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-700">RSVPs ({attendance.length})</h2>
            </div>
            {attendance.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No RSVPs yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {attendance.map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{a.user.name}</p>
                      <p className="text-xs text-gray-400">{a.user.email}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.status === 'ATTENDING'
                            ? 'bg-green-100 text-green-700'
                            : a.status === 'NOT_ATTENDING'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {a.status === 'ATTENDING' ? 'Going' : a.status === 'NOT_ATTENDING' ? 'Not Going' : 'Maybe'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCheckIn(a.userId, a.checkedIn)}
                      disabled={saving === a.userId}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        a.checkedIn
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {saving === a.userId ? '…' : a.checkedIn ? '✓ Checked In' : 'Check In'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Walk-ins */}
          {walkIns.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-700">Add Walk-In</h2>
                <p className="mt-0.5 text-xs text-gray-400">Members who did not RSVP</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {walkIns.map((member) => (
                  <li key={member.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                    <button
                      onClick={() => addWalkIn(member.id)}
                      disabled={saving === member.id}
                      className="rounded-lg border border-blue-600 px-4 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                    >
                      {saving === member.id ? '…' : '+ Check In'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
