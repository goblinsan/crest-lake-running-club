import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: eventId } = await context.params;
  const body = await request.json();
  const { status } = body as { status?: string };

  const validStatuses = ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'];
  const rsvpStatus = status && validStatuses.includes(status) ? status : 'ATTENDING';

  const attendance = await prisma.attendance.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { status: rsvpStatus },
    create: { userId: user.id, eventId, status: rsvpStatus },
  });

  return NextResponse.json(attendance);
}
