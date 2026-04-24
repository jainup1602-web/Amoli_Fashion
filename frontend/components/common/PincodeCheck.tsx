'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface PincodeCheckProps {
  pincode: string;
}

export function PincodeCheck({ pincode }: PincodeCheckProps) {
  const [status, setStatus] = useState<'loading' | 'available' | 'unavailable' | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (pincode.length !== 6) return;
    setStatus('loading');
    setCity('');

    // Check against shipping zones in DB
    fetch(`/api/shipping/check?pincode=${pincode}`)
      .then(r => r.json())
      .then(data => {
        if (data.available) {
          setStatus('available');
          setCity(data.city || '');
        } else {
          setStatus('unavailable');
        }
      })
      .catch(() => {
        // Fallback: assume available for all India
        setStatus('available');
      });
  }, [pincode]);

  if (!status) return null;

  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
      {status === 'loading' && (
        <>
          <Loader className="h-3.5 w-3.5 animate-spin text-gray-400" />
          <span className="text-gray-400">Checking delivery...</span>
        </>
      )}
      {status === 'available' && (
        <>
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-600 font-medium">
            Delivery available{city ? ` to ${city}` : ''}
          </span>
        </>
      )}
      {status === 'unavailable' && (
        <>
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-red-500">Delivery not available to this pincode</span>
        </>
      )}
    </div>
  );
}
