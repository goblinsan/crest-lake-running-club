import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../components/Navbar';

export default async function ForumPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;

  const discussions = await prisma.discussion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { replies: true } },
    },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-700">Community Forum</h1>
          {sessionUser?.id && (
            <Link
              href="/forum/new"
              className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              + New Post
            </Link>
          )}
        </div>

        {discussions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-2 text-gray-500">No discussions yet.</p>
            {sessionUser?.id ? (
              <Link href="/forum/new" className="text-sm font-medium text-blue-700 hover:underline">
                Start the first conversation
              </Link>
            ) : (
              <p className="text-sm text-gray-400">
                <Link href="/auth/signin" className="font-medium text-blue-700 hover:underline">
                  Sign in
                </Link>{' '}
                to start a discussion.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {discussions.map((d) => (
              <Link key={d.id} href={`/forum/${d.id}`} className="block px-6 py-5 transition-colors hover:bg-gray-50">
                <h2 className="mb-1 text-base font-semibold text-gray-900">{d.title}</h2>
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">{d.body}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>By {d.author.name}</span>
                  <span>·</span>
                  <span>
                    {new Date(d.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>·</span>
                  <span>
                    {d._count.replies} {d._count.replies === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
