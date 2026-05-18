'use client';

import { Suspense } from 'react';
import AuditPageContent from './AuditPageContent';

export default function AuditPage() {
  return (
    <Suspense fallback={<AuditPageSkeleton />}>
      <AuditPageContent />
    </Suspense>
  );
}

function AuditPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
      <div className="grid grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <div key={i} className="card h-24 animate-pulse" />)}
      </div>
      <div className="card h-64 animate-pulse" />
    </div>
  );
}
