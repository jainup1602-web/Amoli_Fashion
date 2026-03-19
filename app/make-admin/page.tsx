'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { Check } from 'lucide-react';

export default function MakeAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMakeAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError(''); 

    try {
      const user = auth?.currentUser;
      
      if (!user) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/make-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Successfully made admin! Please refresh the page.');
      } else {
        setError(data.message || 'Failed to make admin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Make Admin</h1>
          <p className="text-gray-600">
            Click the button below to grant admin privileges to your account
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleMakeAdmin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </Button>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-xs">
            <strong>Note:</strong> This is a development utility. In production, 
            admin roles should be assigned through a secure process.
          </p>
        </div>
      </Card>
    </div>
  );
}
