import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-surface-1 border border-gray-600/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-gray-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-secondary text-sm px-4 py-2">Go Home</Link>
          <Link href="/audit" className="btn-primary text-sm px-4 py-2">Start Audit</Link>
        </div>
      </div>
    </div>
  );
}
