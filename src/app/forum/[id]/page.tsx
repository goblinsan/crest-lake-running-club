import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../../components/Navbar';
import ReplyForm from './ReplyForm';
import DeleteDiscussionButton from './DeleteDiscussionButton';

type PageProps = { params: Promise<{ id: string }> };

export default async function DiscussionPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });

  if (!discussion) notFound();

  const canDelete = sessionUser?.id === discussion.authorId || sessionUser?.role === 'ADMIN';

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/forum" className="mb-6 inline-block text-sm text-gray-400 hover:text-gray-600">
          ← Back to Forum
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-blue-700">{discussion.title}</h1>
            {canDelete && <DeleteDiscussionButton discussionId={discussion.id} />}
          </div>

          <div className="mb-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="font-medium text-gray-600">{discussion.author.name}</span>
            <span>·</span>
            <span>
              {new Date(discussion.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-700">{discussion.body}</p>
        </div>

        {/* Replies */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {discussion.replies.length === 0
              ? 'No replies yet'
              : `${discussion.replies.length} ${discussion.replies.length === 1 ? 'Reply' : 'Replies'}`}
          </h2>

          {discussion.replies.length > 0 && (
            <div className="mb-6 space-y-4">
              {discussion.replies.map((reply) => (
                <div key={reply.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{reply.author.name}</span>
                    <span>·</span>
                    <span>
                      {new Date(reply.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{reply.body}</p>
                </div>
              ))}
            </div>
          )}

          {sessionUser?.id ? (
            <ReplyForm discussionId={discussion.id} />
          ) : (
            <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
              <Link href="/auth/signin" className="font-medium text-blue-700 hover:underline">
                Sign in
              </Link>{' '}
              to post a reply.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
