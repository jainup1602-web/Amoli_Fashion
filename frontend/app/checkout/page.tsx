'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { ShoppingCart, Truck, Shield, RefreshCw, ChevronDown, ChevronUp, Phone, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window { Razorpay: any; recaptchaVerifier: any; }
}

// Steps: 'phone' | 'otp' | 'address'
type Step = 'phone' | 'otp' | 'address';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { settings } = useAppSelector((state) => state.settings);

  // Step state
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Address + payment
  const [formData, setFormData] = useState({
    fullName: '', email: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold || 999;
  const shippingCharge = settings?.shippingCharge || 50;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCharge;
  const discount = appliedCoupon?.discount || 0;
  const taxEnabled = (settings as any)?.taxEnabled ?? false;
  const taxRate = (settings as any)?.taxRate ?? 0;
  const taxLabel = (settings as any)?.taxLabel || 'GST';
  const tax = taxEnabled ? Math.round(((subtotal - discount) * taxRate) / 100 * 100) / 100 : 0;
  const finalTotal = subtotal - discount + shipping + tax;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && items.length === 0) router.push('/cart'); }, [mounted, items, router]);

  // If already logged in, skip phone/otp steps
  useEffect(() => {
    if (isAuthenticated && user) {
      setStep('address');
      setPhone((user as any).phone || (user as any).phoneNumber || '');
      setFormData((prev) => ({
        ...prev,
        fullName: (user as any).displayName || '',
        email: (user as any).email || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Setup invisible reCAPTCHA
  const setupRecaptcha = async () => {
    const { RecaptchaVerifier } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    if (!auth) throw new Error('Firebase not configured');
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
    });
    return window.recaptchaVerifier;
  };

  // Send OTP — called automatically when phone hits 10 digits
  const sendOtp = async (phoneNumber: string) => {
    setOtpSending(true);
    try {
      const { signInWithPhoneNumber } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      if (!auth) throw new Error('Firebase not configured');
      const appVerifier = await setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30);
      toast.success('OTP sent to +91 ' + phoneNumber);
    } catch (err: any) {
      toast.error(err.message?.includes('invalid-phone') ? 'Invalid phone number' : 'Failed to send OTP. Try again.');
      console.error(err);
    } finally {
      setOtpSending(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (digits.length === 10) sendOtp(digits);
  };

  // OTP input handlers
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    // Auto-submit when all 6 filled
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      verifyOtp(pasted);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) return;
    setOtpVerifying(true);
    try {
      const result = await confirmationResult.confirm(code);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // Register/login user in our DB
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        }),
      });

      // Store token
      localStorage.setItem('token', idToken);

      // Update Redux auth state
      const { setUser } = await import('@/store/slices/authSlice');
      const { store } = await import('@/store/store');
      store.dispatch(setUser({
        user: {
          _id: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'customer',
          addresses: [],
        },
        token: idToken,
      }));

      toast.success('Verified! Please fill your delivery details.');
      setStep('address');
    } catch (err: any) {
      toast.error('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
    if (!formData.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.state.trim()) e.state = 'State is required';
    if (!formData.pincode.trim() || !/^[1-9][0-9]{5}$/.test(formData.pincode)) e.pincode = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: data.discountAmount });
        toast.success(`Coupon applied! You saved ${formatPrice(data.discountAmount)}`);
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    } catch { toast.error('Failed to apply coupon'); }
    finally { setCouponLoading(false); }
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePlaceOrder = async () => {
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    const token = localStorage.getItem('token');
    if (!token) { setStep('phone'); toast.error('Please verify your phone first'); return; }
    setLoading(true);
    try {
      const shippingAddress = {
        name: formData.fullName, phone, email: formData.email,
        addressLine1: formData.addressLine1, addressLine2: formData.addressLine2,
        city: formData.city, state: formData.state, pincode: formData.pincode, country: formData.country,
      };
      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shippingAddress, couponCode: appliedCoupon?.code, paymentMethod: 'cod' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create order');
        dispatch(clearCart());
        toast.success('Order placed successfully!');
        router.push(`/order-success?orderId=${data.order.orderNumber}`);
        return;
      }
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Payment gateway failed to load.'); setLoading(false); return; }
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shippingAddress, couponCode: appliedCoupon?.code, paymentMethod: 'razorpay' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      const options = {
        key: data.key, amount: Math.round(data.amount * 100), currency: data.currency || 'INR',
        name: settings?.siteName || 'Amoli Fashion Jewellery', description: 'Order Payment',
        order_id: data.razorpayOrderId,
        prefill: { name: formData.fullName, email: formData.email, contact: phone },
        theme: { color: '#B76E79' },
        handler: async (response: any) => {
          try {
            const vRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }),
            });
            const vData = await vRes.json();
            if (vData.success) { dispatch(clearCart()); toast.success('Payment successful!'); router.push(`/order-success?orderId=${vData.order.orderNumber}`); }
            else toast.error('Payment verification failed.');
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
      };
      new window.Razorpay(options).open();
    } catch (err: any) { toast.error(err.message || 'Something went wrong'); setLoading(false); }
  };

  if (!mounted) return (
    <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#B76E79' }} />
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center py-20 px-4">
      <div className="text-center p-16 border border-gray-200 max-w-lg w-full bg-white">
        <ShoppingCart className="h-14 w-14 mx-auto mb-6 text-gray-300" strokeWidth={1} />
        <h2 className="text-2xl font-fairplay text-[#1C1C1C] mb-3">Your bag is empty</h2>
        <Button asChild className="mt-6 text-white rounded-none border-none tracking-widest uppercase text-xs px-10 h-12" style={{ backgroundColor: '#B76E79' }}>
          <Link href="/products">Explore Collections</Link>
        </Button>
      </div>
    </div>
  );

  const inputCls = (field: string) =>
    `rounded-none border focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 font-light text-sm bg-white w-full outline-none transition-colors ${errors[field] ? 'border-red-400' : 'border-gray-200 focus:border-[#B76E79]'}`;

  // Step indicator
  const steps = [
    { id: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
    { id: 'otp', label: 'Verify', icon: <Shield className="h-4 w-4" /> },
    { id: 'address', label: 'Details', icon: <MapPin className="h-4 w-4" /> },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-[#F9F5F2]">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 text-xs font-elegant tracking-widest uppercase text-gray-400">
          <Breadcrumb items={[{ label: 'Bag', href: '/cart' }, { label: 'Checkout' }]} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-fairplay text-[#1C1C1C]">Checkout</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-elegant tracking-widest uppercase">
            <Shield className="h-3.5 w-3.5" style={{ color: '#B76E79' }} />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-elegant tracking-widest uppercase transition-all ${i <= stepIndex ? 'text-white' : 'text-gray-400 bg-gray-100'}`}
                style={i <= stepIndex ? { backgroundColor: '#B76E79' } : {}}>
                {s.icon}
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-12 h-px mx-1 transition-colors ${i < stepIndex ? '' : 'bg-gray-200'}`}
                  style={i < stepIndex ? { backgroundColor: '#B76E79' } : {}} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left — Steps */}
          <div className="lg:col-span-3">

            {/* STEP 1: Phone */}
            {step === 'phone' && (
              <div className="bg-white border border-gray-100 p-4 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#B76E79' }}>1</div>
                  <h2 className="text-lg font-fairplay text-[#1C1C1C]">Enter Mobile Number</h2>
                </div>
                <p className="text-sm text-gray-500 font-light mb-6">We'll send an OTP to verify your number</p>
                <div className="flex items-center border border-gray-200 focus-within:border-[#B76E79] transition-colors bg-white h-14">
                  <span className="px-4 text-sm font-medium text-gray-600 border-r border-gray-200 h-full flex items-center bg-gray-50">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 h-full bg-transparent outline-none text-base font-light text-gray-800 placeholder-gray-400 tracking-widest"
                    autoFocus
                  />
                  {otpSending && (
                    <div className="px-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#B76E79' }} />
                    </div>
                  )}
                </div>
                {otpSending && (
                  <p className="text-xs text-gray-400 mt-3 font-light">Sending OTP to +91 {phone}...</p>
                )}
                <div className="mt-8 flex items-center gap-6 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" style={{ color: '#B76E79' }} /> PCI DSS Certified</div>
                  <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" style={{ color: '#B76E79' }} /> 100% Secure</div>
                </div>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <div className="bg-white border border-gray-100 p-4 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#B76E79' }}>2</div>
                  <h2 className="text-lg font-fairplay text-[#1C1C1C]">Verify OTP</h2>
                </div>
                <p className="text-sm text-gray-500 font-light mb-2">OTP sent to <span className="font-medium text-gray-700">+91 {phone}</span></p>
                <button onClick={() => { setStep('phone'); setOtp(['','','','','','']); }} className="text-xs mb-8 transition-colors" style={{ color: '#B76E79' }}>
                  Change number
                </button>

                {/* OTP boxes */}
                <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-medium border-b-2 bg-transparent outline-none transition-colors ${digit ? '' : 'border-gray-200'}`}
                      style={digit ? { borderColor: '#B76E79', color: '#B76E79' } : {}}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {otpVerifying && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#B76E79' }} />
                    Verifying...
                  </div>
                )}

                <div className="text-center text-sm text-gray-500">
                  {resendTimer > 0 ? (
                    <span>Resend OTP in <span className="font-medium" style={{ color: '#B76E79' }}>{resendTimer}s</span></span>
                  ) : (
                    <button onClick={() => sendOtp(phone)} className="font-medium transition-colors" style={{ color: '#B76E79' }}>
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Address + Payment */}
            {step === 'address' && (
              <div className="space-y-6">
                {/* Verified phone badge */}
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Verified: <span className="font-medium">+91 {phone}</span></span>
                  {!isAuthenticated && (
                    <button onClick={() => setStep('phone')} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Change</button>
                  )}
                </div>

                {/* Shipping Details */}
                <div className="bg-white border border-gray-100 p-4 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#B76E79' }}>3</div>
                    <h2 className="text-lg font-fairplay text-[#1C1C1C]">Delivery Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleInputChange} className={inputCls('fullName')} />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <input name="email" type="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} className={inputCls('email')} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <input name="addressLine1" placeholder="Address Line 1 *" value={formData.addressLine1} onChange={handleInputChange} className={inputCls('addressLine1')} />
                      {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <input name="addressLine2" placeholder="Landmark / Area (optional)" value={formData.addressLine2} onChange={handleInputChange} className={inputCls('addressLine2')} />
                    </div>
                    <div>
                      <input name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} className={inputCls('city')} />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <input name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} className={inputCls('state')} />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <input name="pincode" placeholder="Pincode *" value={formData.pincode} onChange={handleInputChange} className={inputCls('pincode')} />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                    <div>
                      <select name="country" value={formData.country} onChange={handleInputChange}
                        className="w-full rounded-none border border-gray-200 focus:border-[#B76E79] px-4 h-12 font-light text-sm bg-white outline-none">
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-100 p-4 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <CreditCard className="h-5 w-5" style={{ color: '#B76E79' }} />
                    <h2 className="text-lg font-fairplay text-[#1C1C1C]">Payment Method</h2>
                  </div>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[#B76E79] bg-[#F9F5F2]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-[#B76E79]" />
                      <div>
                        <p className="text-sm font-medium text-[#1C1C1C]">Pay Online</p>
                        <p className="text-xs text-gray-400 mt-0.5">UPI, Card, Net Banking, Wallets</p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 font-medium">UPI</span>
                        <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 font-medium">CARD</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#B76E79] bg-[#F9F5F2]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#B76E79]" />
                      <div>
                        <p className="text-sm font-medium text-[#1C1C1C]">Cash on Delivery</p>
                        <p className="text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Shield className="h-5 w-5" />, text: 'Secure Payment' },
                    { icon: <Truck className="h-5 w-5" />, text: 'Fast Delivery' },
                    { icon: <RefreshCw className="h-5 w-5" />, text: 'Easy Returns' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="bg-white border border-gray-100 p-4 flex flex-col items-center gap-2 text-center">
                      <span style={{ color: '#B76E79' }}>{icon}</span>
                      <span className="text-[10px] font-elegant tracking-widest uppercase text-gray-500">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 sticky top-24">
              {/* Mobile toggle */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 lg:hidden border-b border-gray-100"
                onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
              >
                <span className="text-sm font-medium text-[#1C1C1C]">Order Summary ({items.length} items)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: '#B76E79' }}>{formatPrice(finalTotal)}</span>
                  {orderSummaryOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </button>

              <div className={`p-6 ${orderSummaryOpen ? 'block' : 'hidden lg:block'}`}>
                <h2 className="text-base font-fairplay text-[#1C1C1C] mb-5 pb-4 border-b border-gray-100 hidden lg:block">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-5 max-h-56 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 bg-[#F9F5F2] border border-gray-100">
                        <Image src={item.image || '/placeholder.svg'} alt={item.name} fill sizes="56px" className="object-cover" unoptimized={item.image?.startsWith('http')} />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-medium" style={{ backgroundColor: '#B76E79' }}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1C1C1C] font-light line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-sm font-medium text-[#1C1C1C] mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-green-700">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-600">-{formatPrice(appliedCoupon.discount)}</span>
                      </div>
                      <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ) : (
                    <div className="flex border border-gray-200">
                      <input type="text" placeholder="Coupon code" value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1 px-3 py-2.5 text-sm font-light outline-none bg-white" />
                      <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="px-4 text-xs font-elegant tracking-widest uppercase text-white disabled:opacity-50"
                        style={{ backgroundColor: '#B76E79' }}>
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">Delivery</span>
                    <span>{shipping === 0 ? <span className="text-green-600 text-xs font-medium uppercase">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400 font-light">Add {formatPrice(freeShippingThreshold - subtotal)} more for free delivery</p>
                  )}
                  {taxEnabled && tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="font-light">{taxLabel} ({taxRate}%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium text-[#1C1C1C] pt-3 border-t border-gray-100">
                    <span className="font-fairplay">Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Place Order button — only on address step */}
                {step === 'address' && (
                  <>
                    <Button onClick={handlePlaceOrder} disabled={loading}
                      className="w-full mt-6 h-14 text-white rounded-none border-none tracking-[0.2em] uppercase text-sm font-medium disabled:opacity-60"
                      style={{ backgroundColor: '#B76E79' }}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Processing...
                        </span>
                      ) : (
                        <>{paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(finalTotal)}`}</>
                      )}
                    </Button>
                    <p className="text-[10px] text-gray-400 font-light text-center mt-3 leading-relaxed">
                      By placing your order, you agree to our{' '}
                      <Link href="/terms" className="underline hover:text-[#B76E79]">Terms</Link> &{' '}
                      <Link href="/privacy" className="underline hover:text-[#B76E79]">Privacy Policy</Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
