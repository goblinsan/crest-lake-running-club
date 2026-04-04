import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../components/Navbar';

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_SHORT: 'Weekly Short Run',
  WEEKLY_LONG: 'Weekly Long Run',
  SPECIAL: 'Special Event',
};

export default async function EventsPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { attendance: { where: { status: 'ATTENDING' } } } },
    },
  });

  const myAttendance = sessionUser?.id
    ? await prisma.attendance.findMany({
        where: { userId: sessionUser.id },
        select: { eventId: true, status: true },
      })
    : [];

  const myRsvpMap = new Map(myAttendance.map((a) => [a.eventId, a.status]));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-700">Upcoming Runs</h1>
          {sessionUser?.role === 'ADMIN' && (
            <Link
              href="/admin/events/new"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              + New Event
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events. Check back soon!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {events.map((event) => {
              const myStatus = myRsvpMap.get(event.id);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  </span>
                  <h2 className="mb-1 text-lg font-semibold">{event.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
                  {event.distance && <p className="mt-1 text-sm font-medium text-blue-600">{event.distance}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{event._count.attendance} attending</span>
                    {myStatus && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          myStatus === 'ATTENDING'
                            ? 'bg-green-100 text-green-700'
                            : myStatus === 'NOT_ATTENDING'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {myStatus === 'ATTENDING' ? 'Going' : myStatus === 'NOT_ATTENDING' ? 'Not Going' : 'Maybe'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
