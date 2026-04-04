import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
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

  return NextResponse.json({
    pastEvents,
    topAttendees,
    totalCheckIns,
    totalPastEvents: pastEvents.length,
  });
}
