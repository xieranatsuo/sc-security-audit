'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/audit');
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading Smart Contract Audit Platform...</p>
      </div>
    </div>
  );
}
