import { prisma } from '@/lib/prisma';
import Navbar from '../components/Navbar';

export default async function StatsPage(): Promise<React.JSX.Element> {
  const now = new Date();

  const [pastEvents, topAttendees, totalCheckIns] = await Promise.all([
    prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: {
            attendance: { where: { checkedIn: true } },
          },
        },
      },
    }),

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { attendance: { where: { checkedIn: true } } } },
      },
      orderBy: { attendance: { _count: 'desc' } },
      take: 10,
    }),

    prisma.attendance.count({ where: { checkedIn: true } }),
  ]);

  const topAttendeesFiltered = topAttendees.filter((u) => u._count.attendance > 0);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-blue-700">Club Stats</h1>
        <p className="mb-10 text-gray-500">Post-run summaries and member participation highlights.</p>

        {/* Overview cards */}
        <section className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-blue-700">{pastEvents.length}</p>
            <p className="mt-1 text-sm text-gray-500">Runs Completed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-blue-700">{totalCheckIns}</p>
            <p className="mt-1 text-sm text-gray-500">Total Check-Ins</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-4xl font-extrabold text-blue-700">{topAttendeesFiltered.length}</p>
            <p className="mt-1 text-sm text-gray-500">Active Members</p>
          </div>
        </section>

        {/* Top Attendees */}
        {topAttendeesFiltered.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-blue-700">🏆 Top Attendees</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-100">
                {topAttendeesFiltered.map((member, index) => (
                  <li key={member.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{medals[index] ?? `#${index + 1}`}</span>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700">
                      {member._count.attendance} {member._count.attendance === 1 ? 'run' : 'runs'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Past Run Summaries */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-blue-700">📋 Past Run Summaries</h2>
          {pastEvents.length === 0 ? (
            <p className="text-gray-500">No past events yet. Check back after your first run!</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Event</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {event._count.attendance} checked in
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
