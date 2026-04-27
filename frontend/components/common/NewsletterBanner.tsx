'use client';

import { useState } from 'react';
import { Mail, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        toast.success('Welcome! Check your email for your discount code 🎁');
      } else {
        toast.error(data.message || 'Already subscribed');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="py-10 px-4" style={{ backgroundColor: '#B76E79' }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-3">
          <Gift className="h-8 w-8 text-white/80" />
        </div>
        <h2 className="text-xl sm:text-2xl font-fairplay text-white mb-1">Get 10% Off Your First Order</h2>
        <p className="text-white/70 text-sm mb-6 font-elegant tracking-wide">
          Subscribe to our newsletter for exclusive offers, new arrivals & style inspiration
        </p>

        {subscribed ? (
          <div className="bg-white/20 rounded-none px-6 py-4 inline-block">
            <p className="text-white font-medium">🎉 You're subscribed! Use code <strong>WELCOME10</strong> for 10% off</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <div className="flex-1 flex items-center bg-white px-4">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mr-2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 py-3 text-sm text-gray-800 outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors"
              style={{ backgroundColor: '#1C1C1C', color: '#fff' }}
            >
              {loading ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
        <p className="text-white/50 text-[10px] mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
