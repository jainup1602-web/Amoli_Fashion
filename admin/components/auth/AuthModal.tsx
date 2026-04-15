'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  updateProfile,
  ConfirmationResult 
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('input');
      setName('');
      setPhone('');
      setOtp('');
      setConfirmationResult(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!auth) {
      toast.error('Firebase not configured');
      return null;
    }

    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-modal', {
          size: 'invisible',
          callback: () => {},
        });
      }
      return (window as any).recaptchaVerifier;
    } catch (error) {
      console.error('Recaptcha setup error:', error);
      return null;
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    if (!phone.startsWith('+')) {
      toast.error('Phone must start with country code (e.g., +91)');
      return;
    }

    setLoading(true);

    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      const recaptchaVerifier = setupRecaptcha();
      if (!recaptchaVerifier) {
        throw new Error('Recaptcha setup failed');
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      console.error('OTP send error:', error);
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Try again later.');
      } else {
        toast.error(error.message || 'Failed to send OTP');
      }
      
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      toast.error('Please request OTP first');
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const token = await user.getIdToken();

      if (mode === 'register') {
        await updateProfile(user, { displayName: name });
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            firebaseUid: user.uid,
            phoneNumber: phone,
            displayName: name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('MongoDB save failed:', data.error);
          toast.error('Registration failed');
          return;
        }
        
        // Clear manual logout flag on successful registration
        localStorage.removeItem('manualLogout');
        localStorage.setItem('token', token);
        
        dispatch(setUser({ user: data.user, token }));
        toast.success('Registration successful!');
      } else {
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          toast.error('User not found. Please register first.');
          setMode('register');
          setStep('input');
          return;
        }

        const data = await response.json();
        
        // Clear manual logout flag on successful login
        localStorage.removeItem('manualLogout');
        localStorage.setItem('token', token);
        
        dispatch(setUser({ user: data.user, token }));
        toast.success('Login successful!');
      }
      
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Verification error:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP');
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP expired. Request new one.');
      } else {
        toast.error(error.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto min-h-screen">
        <div className="rounded-2xl shadow-2xl max-w-md w-full relative animate-fade-in mx-auto" style={{ backgroundColor: '#F8F6F2' }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-[#B76E79]/10 rounded-full transition z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="p-5 sm:p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-12 h-px mx-auto mb-4" style={{ backgroundColor: '#B76E79' }} />
              <h2 className="text-xl sm:text-2xl font-fairplay text-[#1C1C1C] mb-1.5">Amoli Fashion Jewellery</h2>
              <p className="text-xs text-gray-500 font-light tracking-wide">
                {mode === 'login' ? 'Welcome back — discover exclusive collections' : 'Join us for premium jewellery & exclusive offers'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-0 mb-6 border border-gray-200 rounded-none overflow-hidden">
              <button
                onClick={() => { setMode('login'); setStep('input'); setName(''); setOtp(''); }}
                className="flex-1 py-2.5 text-xs font-medium tracking-widest uppercase transition-all"
                style={mode === 'login' ? { backgroundColor: '#B76E79', color: 'white' } : { backgroundColor: 'white', color: '#B76E79' }}
              >
                Login
              </button>
              <button
                onClick={() => { setMode('register'); setStep('input'); setOtp(''); }}
                className="flex-1 py-2.5 text-xs font-medium tracking-widest uppercase transition-all"
                style={mode === 'register' ? { backgroundColor: '#B76E79', color: 'white' } : { backgroundColor: 'white', color: '#B76E79' }}
              >
                Register
              </button>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleSendOTP} className="space-y-3">
                {mode === 'register' && (
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-none border-gray-200 bg-white focus:border-[#B76E79] focus:ring-0 text-sm"
                  />
                )}

                <div className="flex items-center border border-gray-200 bg-white focus-within:border-[#B76E79] transition-colors">
                  <span className="px-3 text-xs font-medium text-gray-500 border-r border-gray-200 h-10 flex items-center bg-gray-50 flex-shrink-0">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={phone.replace('+91', '')}
                    onChange={(e) => setPhone('+91' + e.target.value.replace(/\D/g, ''))}
                    required
                    className="flex-1 px-3 h-10 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>

                {mode === 'register' && (
                  <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-[#B76E79]" />
                    <span>I accept the Privacy Policy and Terms & Conditions</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#B76E79' }}
                >
                  {loading ? 'Sending OTP...' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="w-full border border-gray-200 bg-white px-4 h-12 text-center text-xl tracking-[0.5em] outline-none focus:border-[#B76E79] transition-colors"
                />
                <p className="text-xs text-gray-400 text-center">OTP sent to {phone}</p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#B76E79' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('input'); setOtp(''); setConfirmationResult(null); }}
                  className="w-full text-xs text-gray-400 hover:text-[#B76E79] transition-colors"
                >
                  Change phone number
                </button>
              </form>
            )}

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '✦', label: 'Premium Quality', sub: 'Handcrafted' },
                { icon: '◇', label: 'Authentic', sub: '100% genuine' },
                { icon: '◈', label: 'Exclusive', sub: 'Unique designs' },
              ].map((item) => (
                <div key={item.label} className="border border-gray-200 bg-white p-2.5 rounded-sm">
                  <div className="text-base mb-1" style={{ color: '#B76E79' }}>{item.icon}</div>
                  <p className="text-[10px] font-semibold text-gray-800">{item.label}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="recaptcha-container-modal"></div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
