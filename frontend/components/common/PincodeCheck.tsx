'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PincodeCheckProps {
  pincode: string;
}

export function PincodeCheck({ pincode }: PincodeCheckProps) {
  const [status, setStatus] = useState<'loading' | 'available' | 'unavailable' | null>(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setStatus(null);
      setCity('');
      setState('');
      return;
    }

    setStatus('loading');
    setCity('');
    setState('');

    const controller = new AbortController();

    const run = async () => {
      try {
        // Step 1: Check our shipping zones
        const shippingRes = await fetch(`/api/shipping/check?pincode=${pincode}`, {
          signal: controller.signal,
        });
        const shippingData = await shippingRes.json();

        // Step 2: Get city info via server-side proxy (avoids CORS)
        try {
          const infoRes = await fetch(`/api/shipping/pincode-info?pincode=${pincode}`, {
            signal: controller.signal,
          });
          const infoData = await infoRes.json();
          if (infoData.success) {
            setCity(infoData.city || '');
            setState(infoData.state || '');
          }
        } catch {
          // city info is optional — don't fail
        }

        setStatus(shippingData.available ? 'available' : 'unavailable');
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        // Final fallback — try pincode info only
        try {
          const infoRes = await fetch(`/api/shipping/pincode-info?pincode=${pincode}`);
          const infoData = await infoRes.json();
          if (infoData.success) {
            setCity(infoData.city || '');
            setState(infoData.state || '');
            setStatus('available');
          } else {
            setStatus('available'); // default allow even if city info unavailable
          }
        } catch {
          setStatus('available'); // default allow
        }
      }
    };

    run();
    return () => controller.abort();
  }, [pincode]);

  if (!status) return null;

  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
      {status === 'loading' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
          <span className="text-gray-400">Checking delivery...</span>
        </>
      )}
      {status === 'available' && (
        <>
          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <span className="text-green-600 font-medium">
            Delivery available{city ? ` to ${city}${state ? `, ${state}` : ''}` : ' to this pincode'}
          </span>
        </>
      )}
      {status === 'unavailable' && (
        <>
          <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          <span className="text-red-500">Delivery not available to this pincode</span>
        </>
      )}
    </div>
  );
}
