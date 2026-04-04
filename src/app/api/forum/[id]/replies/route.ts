import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: discussionId } = await context.params;

  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
  }

  const body = await request.json();
  const { body: replyBody } = body as { body?: string };

  if (!replyBody) {
    return NextResponse.json({ error: 'Reply body is required' }, { status: 400 });
  }

  const reply = await prisma.discussionReply.create({
    data: { body: replyBody, authorId: user.id, discussionId },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(reply, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: discussionId } = await context.params;
  const body = await request.json();
  const { replyId } = body as { replyId?: string };

  if (!replyId) {
    return NextResponse.json({ error: 'replyId is required' }, { status: 400 });
  }

  const reply = await prisma.discussionReply.findUnique({ where: { id: replyId } });
  if (!reply || reply.discussionId !== discussionId) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
  }

  if (reply.authorId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.discussionReply.delete({ where: { id: replyId } });

  return NextResponse.json({ success: true });
}
