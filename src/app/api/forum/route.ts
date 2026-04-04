import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  const discussions = await prisma.discussion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json(discussions);
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, body: postBody } = body as { title?: string; body?: string };

  if (!title || !postBody) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
  }

  const discussion = await prisma.discussion.create({
    data: { title, body: postBody, authorId: user.id },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(discussion, { status: 201 });
}
