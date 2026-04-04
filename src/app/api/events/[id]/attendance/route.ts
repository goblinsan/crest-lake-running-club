import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: eventId } = await context.params;

  const attendanceList = await prisma.attendance.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
  });

  return NextResponse.json(attendanceList);
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: eventId } = await context.params;
  const body = await request.json();
  const { userId, checkedIn } = body as { userId: string; checkedIn: boolean };

  if (!userId || checkedIn === undefined) {
    return NextResponse.json({ error: 'userId and checkedIn are required' }, { status: 400 });
  }

  const attendance = await prisma.attendance.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: { checkedIn },
    create: { userId, eventId, status: 'ATTENDING', checkedIn },
  });

  return NextResponse.json(attendance);
}
