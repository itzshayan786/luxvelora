'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafaf9] text-neutral-900 px-4 text-center">
      <h1 className="text-4xl font-bold font-display mb-4">Something went wrong</h1>
      <p className="text-neutral-500 mb-8 max-w-md">
        An error occurred in the Velora timeline. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-[#0a0a0a] text-white hover:bg-[#262626] transition text-sm font-medium"
        >
          Try Again
        </button>
        <Link href="/" className="px-6 py-3 rounded-full border border-neutral-300 hover:bg-neutral-100 transition text-sm font-medium">
          Go Home
        </Link>
      </div>
    </div>
  );
}
