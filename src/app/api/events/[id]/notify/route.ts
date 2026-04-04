import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, buildReminderEmail } from '@/lib/notifications';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: eventId } = await context.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const attendees = await prisma.attendance.findMany({
    where: { eventId, status: 'ATTENDING' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const results = await Promise.allSettled(
    attendees.map(async (a) => {
      const payload = buildReminderEmail(a.user.name, event.title, event.date, event.location ?? null);
      payload.to = a.user.email;
      await sendEmail(payload);
      return a.user.email;
    }),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ sent, failed, total: attendees.length });
}
