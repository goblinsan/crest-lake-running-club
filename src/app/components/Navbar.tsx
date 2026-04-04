'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Navbar(): React.JSX.Element {
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string } | undefined;

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-200">
          🏃 Crest Lake Running Club
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200">
            Home
          </Link>
          <Link href="/events" className="hover:text-blue-200">
            Events
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin/events" className="hover:text-blue-200">
              Admin
            </Link>
          )}
          {session ? (
            <Link href="/profile" className="hover:text-blue-200">
              My Profile
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-blue-200">
                Sign In
              </Link>
              <Link href="/auth/signup" className="rounded-full bg-white px-4 py-1.5 text-blue-700 hover:bg-blue-100">
                Join Us
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
