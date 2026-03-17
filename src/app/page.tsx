import Link from 'next/link';
import Navbar from './components/Navbar';

const upcomingRuns = [
  {
    id: '1',
    title: 'Tuesday Morning Short Run',
    date: 'Every Tuesday, 6:00 AM',
    location: 'Crest Lake Park, Clearwater, FL',
    type: 'Weekly Short Run',
    distance: '3–5 miles',
  },
  {
    id: '2',
    title: 'Saturday Long Run to the Beach',
    date: 'Every Saturday, 7:00 AM',
    location: 'Crest Lake Park → Clearwater Beach',
    type: 'Weekly Long Run',
    distance: '8–12 miles',
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero */}
        <section className="mb-16 rounded-2xl bg-blue-700 px-10 py-16 text-center text-white shadow-lg">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Crest Lake Running Club</h1>
          <p className="mb-8 text-lg text-blue-100">
            A community running group based at <span className="font-semibold">Crest Lake Park, Clearwater, FL</span>
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow hover:bg-blue-50"
            >
              Join the Club
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-full border border-white px-8 py-3 font-semibold text-white hover:bg-blue-600"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* About */}
        <section className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-blue-700">About Us</h2>
          <p className="leading-relaxed text-gray-700">
            We are a welcoming community of runners who gather weekly at Crest Lake Park. Whether you are new to running
            or a seasoned marathoner, you will find your pace with us. We host two regular weekly runs — a shorter
            Tuesday morning run and a longer Saturday run to the beach — plus occasional special events throughout the
            year.
          </p>
        </section>

        {/* Upcoming Runs */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-blue-700">Upcoming Runs</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {upcomingRuns.map((run) => (
              <div
                key={run.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {run.type}
                </span>
                <h3 className="mb-1 text-lg font-semibold">{run.title}</h3>
                <p className="text-sm text-gray-500">{run.date}</p>
                <p className="text-sm text-gray-500">{run.location}</p>
                <p className="mt-3 text-sm font-medium text-blue-600">{run.distance}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Crest Lake Running Club · Clearwater, FL
      </footer>
    </>
  );
}
