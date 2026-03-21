import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crest Lake Running Club',
  description: 'A community running group based at Crest Lake Park in Clearwater, FL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
