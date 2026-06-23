'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F5F2]">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center rounded">
        <div className="mb-6">
          <svg
            className="mx-auto h-12 w-12 text-[#1A1A1A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-playfair text-[#1C1C1C] mb-3">
          Something went wrong!
        </h2>
        <p className="text-gray-500 font-light text-sm mb-8 leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full text-white rounded-none border-none tracking-widest uppercase text-xs h-12"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full rounded-none border-gray-300 tracking-widest uppercase text-xs h-12 text-gray-700 hover:bg-gray-50"
          >
            Go to homepage
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left border-t border-gray-100 pt-4">
            <summary className="cursor-pointer text-xs uppercase tracking-wider font-medium text-gray-400 hover:text-gray-600">
              Error details (Dev Only)
            </summary>
            <pre className="mt-4 text-[10px] bg-gray-50 text-gray-600 p-4 rounded overflow-auto max-h-40 border border-gray-100 font-mono">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
