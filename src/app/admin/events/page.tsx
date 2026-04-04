import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../../components/Navbar';

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_SHORT: 'Weekly Short Run',
  WEEKLY_LONG: 'Weekly Long Run',
  SPECIAL: 'Special Event',
};

export default async function AdminEventsPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  if (!sessionUser?.id || sessionUser.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { attendance: true } },
    },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-700">Manage Events</h1>
          <Link
            href="/admin/events/new"
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">No events yet.</p>
            <Link
              href="/admin/events/new"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Event</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">RSVPs</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                    <td className="px-6 py-4 text-gray-500">{EVENT_TYPE_LABELS[event.type] ?? event.type}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{event._count.attendance}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/attendance`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Attendance
                        </Link>
                        <Link href={`/events/${event.id}`} className="font-medium text-gray-500 hover:underline">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
