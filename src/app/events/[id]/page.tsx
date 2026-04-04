import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../../components/Navbar';
import RsvpButtons from './RsvpButtons';
import SendRemindersButton from './SendRemindersButton';

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEEKLY_SHORT: 'Weekly Short Run',
  WEEKLY_LONG: 'Weekly Long Run',
  SPECIAL: 'Special Event',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      attendance: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { user: { name: 'asc' } },
      },
    },
  });

  if (!event) notFound();

  const myAttendance = sessionUser?.id ? event.attendance.find((a) => a.userId === sessionUser.id) : null;

  const attending = event.attendance.filter((a) => a.status === 'ATTENDING');
  const maybe = event.attendance.filter((a) => a.status === 'MAYBE');

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/events" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
          ← All Events
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </span>

          <h1 className="mb-2 text-3xl font-bold text-blue-700">{event.title}</h1>

          <div className="mb-6 space-y-1 text-sm text-gray-600">
            <p>
              📅{' '}
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {event.location && <p>📍 {event.location}</p>}
            {event.distance && <p>🏃 {event.distance}</p>}
          </div>

          {event.description && <p className="mb-6 leading-relaxed text-gray-700">{event.description}</p>}

          {/* RSVP section */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="mb-4 text-lg font-semibold">RSVP</h2>
            {sessionUser?.id ? (
              <RsvpButtons eventId={event.id} currentStatus={myAttendance?.status ?? null} />
            ) : (
              <p className="text-sm text-gray-500">
                <Link href="/auth/signin" className="font-medium text-blue-700 hover:underline">
                  Sign in
                </Link>{' '}
                to RSVP for this event.
              </p>
            )}
          </div>

          {/* Attendees */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="mb-3 text-lg font-semibold">
              Attendees{' '}
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700">
                {attending.length}
              </span>
            </h2>
            {attending.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attending.map((a) => (
                  <span key={a.id} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {a.user.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No one has RSVPed yet.</p>
            )}

            {maybe.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-500">Maybe ({maybe.length})</p>
                <div className="flex flex-wrap gap-2">
                  {maybe.map((a) => (
                    <span key={a.id} className="rounded-full bg-yellow-50 px-3 py-1 text-sm text-yellow-700">
                      {a.user.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin actions */}
          {sessionUser?.role === 'ADMIN' && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Edit Event
              </Link>
              <Link
                href={`/admin/events/${event.id}/attendance`}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Manage Attendance
              </Link>
              <SendRemindersButton eventId={event.id} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
