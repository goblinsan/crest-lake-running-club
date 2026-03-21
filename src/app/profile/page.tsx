import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '../components/Navbar';

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, bio: true, joinedAt: true },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">My Profile</h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="rounded-full bg-blue-50 px-3 py-0.5 font-medium text-blue-700">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium">{new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>
            {user.bio && (
              <div className="pt-2">
                <span className="text-gray-500">Bio</span>
                <p className="mt-1 text-gray-700">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
