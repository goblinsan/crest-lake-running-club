import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      _count: { select: { attendance: { where: { status: 'ATTENDING' } } } },
    },
  });
  return NextResponse.json(events);
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, date, location, distance, type } = body as {
    title: string;
    description?: string;
    date: string;
    location?: string;
    distance?: string;
    type?: string;
  };

  if (!title || !date) {
    return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      location,
      distance,
      type: type ?? 'WEEKLY_SHORT',
    },
  });

  return NextResponse.json(event, { status: 201 });
}
