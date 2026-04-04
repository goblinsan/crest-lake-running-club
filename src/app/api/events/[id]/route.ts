import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      attendance: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { title, description, date, location, distance, type } = body as {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    distance?: string;
    type?: string;
  };

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(location !== undefined && { location }),
      ...(distance !== undefined && { distance }),
      ...(type !== undefined && { type }),
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  await prisma.attendance.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
