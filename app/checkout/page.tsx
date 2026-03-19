'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { ShoppingCart, Truck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { settings } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-fill user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: (user as any).displayName || prev.fullName,
        email: (user as any).email || prev.email,
        phone: (user as any).phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (mounted && items.length === 0) router.push('/cart');
  }, [mounted, items, router]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = settings?.freeShippingThreshold || 500;
  const shippingCharge = settings?.shippingCharge || 50;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCharge;
  const discount = appliedCoupon?.discount || 0;
  const taxEnabled = (settings as any)?.taxEnabled ?? false;
  const taxRate = (settings as any)?.taxRate ?? 0;
  const taxLabel = (settings as any)?.taxLabel || 'GST';
  const tax = taxEnabled ? Math.round(((subtotal - discount) * taxRate) / 100 * 100) / 100 : 0;
  const finalTotal = subtotal - discount + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim() || !/^[1-9][0-9]{5}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to place order');
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = {
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      };

      if (paymentMethod === 'cod') {
        // COD — direct order create
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            shippingAddress,
            couponCode: appliedCoupon?.code,
            paymentMethod: 'cod',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create order');

        dispatch(clearCart());
        toast.success('Order placed successfully!');
        router.push(`/order-success?orderId=${data.order.orderNumber}`);
        return;
      }

      // Razorpay flow
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shippingAddress,
          couponCode: appliedCoupon?.code,
          paymentMethod: 'razorpay',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const options = {
        key: data.key,
        amount: Math.round(data.amount * 100),
        currency: data.currency || 'INR',
        name: settings?.siteName || 'Amoli Fashion Jewellery',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#043927' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/orders/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              dispatch(clearCart());
              toast.success('Payment successful! Order confirmed.');
              router.push(`/order-success?orderId=${verifyData.order.orderNumber}`);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#043927' }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center py-20 px-4">
        <div className="text-center p-16 border border-gray-200 max-w-lg w-full bg-white">
          <ShoppingCart className="h-14 w-14 mx-auto mb-6 text-gray-300" strokeWidth={1} />
          <h2 className="text-2xl font-fairplay text-[#1C1C1C] mb-3">Your bag is empty</h2>
          <Button asChild className="mt-6 text-white rounded-none border-none tracking-widest uppercase text-xs px-10 h-12" style={{ backgroundColor: '#043927' }}>
            <Link href="/products">Explore Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `rounded-none border focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-12 font-light text-sm bg-white ${
      errors[field] ? 'border-red-400' : 'border-gray-200 focus:border-[#043927]'
    }`;

  return (
    <div className="min-h-screen bg-[#F9F5F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-xs font-elegant tracking-widest uppercase text-gray-400">
          <Breadcrumb items={[{ label: 'Bag', href: '/cart' }, { label: 'Checkout' }]} />
        </div>

        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-fairplay text-[#1C1C1C]">Checkout</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-elegant tracking-widest uppercase">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white border border-gray-100 p-8">
              <h2 className="text-lg font-fairplay text-[#1C1C1C] mb-6 pb-4 border-b border-gray-100">
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleInputChange} className={inputClass('fullName')} />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <Input name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleInputChange} className={inputClass('phone')} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <Input name="email" type="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} className={inputClass('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <Input name="addressLine1" placeholder="Address Line 1 *" value={formData.addressLine1} onChange={handleInputChange} className={inputClass('addressLine1')} />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
                </div>
                <div className="md:col-span-2">
                  <Input name="addressLine2" placeholder="Address Line 2 (Landmark, Area)" value={formData.addressLine2} onChange={handleInputChange} className={inputClass('addressLine2')} />
                </div>
                <div>
                  <Input name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} className={inputClass('city')} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Input name="state" placeholder="State *" value={formData.state} onChange={handleInputChange} className={inputClass('state')} />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <Input name="pincode" placeholder="Pincode *" value={formData.pincode} onChange={handleInputChange} className={inputClass('pincode')} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                <div>
                  <select name="country" value={formData.country} onChange={handleInputChange}
                    className="w-full rounded-none border border-gray-200 focus:border-[#043927] px-4 h-12 font-light text-sm bg-white outline-none">
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-100 p-8">
              <h2 className="text-lg font-fairplay text-[#1C1C1C] mb-6 pb-4 border-b border-gray-100">
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[#043927] bg-[#F9F5F2]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-[#043927]" />
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1C]">Pay Online</p>
                    <p className="text-xs text-gray-400 mt-0.5">Credit/Debit Card, UPI, Net Banking, Wallets</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 font-medium">UPI</span>
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 font-medium">CARD</span>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-5 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#043927] bg-[#F9F5F2]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#043927]" />
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1C]">Cash on Delivery</p>
                    <p className="text-xs text-gray-400 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Secure Payment' },
                { icon: <Truck className="h-5 w-5" />, text: 'Fast Delivery' },
                { icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>, text: 'Easy Returns' },
              ].map(({ icon, text }) => (
                <div key={text} className="bg-white border border-gray-100 p-4 flex flex-col items-center gap-2 text-center">
                  <span style={{ color: '#043927' }}>{icon}</span>
                  <span className="text-xs font-elegant tracking-widest uppercase text-gray-500">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 p-8 sticky top-24">
              <h2 className="text-lg font-fairplay text-[#1C1C1C] mb-6 pb-4 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0 bg-[#F9F5F2] border border-gray-100">
                      <Image src={item.image || '/placeholder.svg'} alt={item.name} fill sizes="56px" className="object-cover" unoptimized={item.image?.startsWith('http')} />
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-medium" style={{ backgroundColor: '#043927' }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1C1C1C] font-light line-clamp-2 leading-snug">{item.name}</p>
                      <p className="text-sm font-medium text-[#1C1C1C] mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex border border-gray-200">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 px-4 py-3 text-sm font-light outline-none bg-white"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 text-xs font-elegant tracking-widest uppercase text-white disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: '#043927' }}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span className="font-light">Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span className="font-light">Delivery</span>
                  <span>
                    {shipping === 0
                      ? <span className="text-green-600 text-xs font-medium uppercase tracking-wide">Free</span>
                      : formatPrice(shipping)
                    }
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 font-light">
                    Add {formatPrice(freeShippingThreshold - subtotal)} more for free delivery
                  </p>
                )}
                {taxEnabled && tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="font-light">{taxLabel} ({taxRate}%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium text-[#1C1C1C] pt-4 border-t border-gray-100">
                  <span className="font-fairplay">Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 h-14 text-white rounded-none border-none tracking-[0.2em] uppercase text-sm font-medium transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#043927' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(finalTotal)}`}
                  </>
                )}
              </Button>

              <p className="text-[10px] text-gray-400 font-light text-center mt-4 leading-relaxed">
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#043927]">Terms</Link> &{' '}
                <Link href="/privacy" className="underline hover:text-[#043927]">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
