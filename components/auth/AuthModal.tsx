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
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto min-h-screen">
        <div className="bg-gradient-to-br from-purple-50 via-lavender/30 to-purple-100 rounded-3xl shadow-2xl max-w-md w-full relative animate-fade-in mx-auto" style={{ backgroundColor: '#f3f0ff' }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-purple-100/50 rounded-full transition z-10"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <div className="p-8">
            {/* Logo/Brand */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-serif text-gray-900 mb-2">Amoli Fashion Jewellery</h2>
              <p className="text-sm text-gray-600">
                {mode === 'login' ? 'Welcome back! Discover exclusive collections' : 'Join us for premium jewelry & exclusive offers'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setMode('login');
                  setStep('input');
                  setName('');
                  setOtp('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition ${
                  mode === 'login'
                    ? 'bg-gray-50 text-gray-800 shadow-md'
                    : 'bg-gray-50/40 text-gray-600 hover:bg-gray-50/60'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setStep('input');
                  setOtp('');
                }}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition ${
                  mode === 'register'
                    ? 'bg-gray-50 text-gray-800 shadow-md'
                    : 'bg-gray-50/40 text-gray-600 hover:bg-gray-50/60'
                }`}
              >
                Register
              </button>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-gray-50 border border-gray-200 focus:bg-gray-50 focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">IN +91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={phone.replace('+91', '')}
                    onChange={(e) => setPhone('+91' + e.target.value.replace(/\D/g, ''))}
                    required
                    className="bg-gray-50 border border-gray-200 focus:bg-gray-50 focus:ring-2 focus:ring-gray-300 pl-20"
                  />
                </div>

                {mode === 'register' && (
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <input type="checkbox" required className="mt-0.5 accent-gray-700" />
                    <span>
                      I accept that I have read & understood the Privacy Policy and T&Cs
                    </span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gray-50 hover:bg-gray-50 text-gray-900 rounded-full py-6 shadow-md border border-gray-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className="bg-gray-50 border border-gray-200 focus:bg-gray-50 focus:ring-2 focus:ring-gray-300 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    OTP sent to {phone}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gray-50 hover:bg-gray-50 text-gray-900 rounded-full py-6 shadow-md border border-gray-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setOtp('');
                    setConfirmationResult(null);
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 underline font-medium"
                >
                  Change Phone Number
                </button>
              </form>
            )}

            {/* Features */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50/60 rounded-2xl p-3 border border-gray-200">
                <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">★</span>
                </div>
                <p className="text-xs text-gray-800 font-medium">Premium Quality</p>
                <p className="text-[10px] text-gray-600">Crafted with excellence</p>
              </div>
              <div className="bg-gray-50/60 rounded-2xl p-3 border border-gray-200">
                <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="text-xs text-gray-800 font-medium">Authentic</p>
                <p className="text-[10px] text-gray-600">100% genuine products</p>
              </div>
              <div className="bg-gray-50/60 rounded-2xl p-3 border border-gray-200">
                <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">♦</span>
                </div>
                <p className="text-xs text-gray-800 font-medium">Exclusive</p>
                <p className="text-[10px] text-gray-600">Unique designs for you</p>
              </div>
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
