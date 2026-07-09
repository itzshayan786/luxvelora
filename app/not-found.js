import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafaf9] text-neutral-900 px-4 text-center">
      <h1 className="text-4xl font-bold font-display mb-4">404 - Page Not Found</h1>
      <p className="text-neutral-500 mb-8 max-w-md">
        The futuristic couture you are looking for does not exist in this timeline.
      </p>
      <Link href="/" className="px-6 py-3 rounded-full bg-[#0a0a0a] text-white hover:bg-[#262626] transition text-sm font-medium">
        Return to Velora
      </Link>
    </div>
  );
}
