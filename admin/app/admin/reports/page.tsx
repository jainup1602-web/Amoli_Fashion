'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/reports/top-selling');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-400 text-sm">Redirecting to reports...</p>
    </div>
  );
}
