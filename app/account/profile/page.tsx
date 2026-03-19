'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { User, Mail, Phone, MapPin, Edit, Check, X, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [photoURL, setPhotoURL] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      router.push('/');
      return;
    }

    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
      setPhotoURL((user as any).photoURL || '');
      setPhotoPreview((user as any).photoURL || '');
    }

    // Check email verification status
    if (auth.currentUser) {
      setEmailVerified(auth.currentUser.emailVerified);
    }
  }, [user, isAuthenticated, router]);

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) {
      toast.error('Please login first');
      return;
    }

    if (auth.currentUser.emailVerified) {
      toast.success('Email already verified!');
      return;
    }

    setSendingVerification(true);

    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to send verification email');
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRefreshVerificationStatus = async () => {
    if (!auth.currentUser) return;

    try {
      await auth.currentUser.reload();
      setEmailVerified(auth.currentUser.emailVerified);
      if (auth.currentUser.emailVerified) {
        toast.success('Email verified successfully!');
      } else {
        toast.error('Email not verified yet');
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setPhotoURL(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { toast.error('Session expired, please login again'); setLoading(false); return; }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, photoURL }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
        // Update Redux store so header avatar updates immediately
        dispatch(setUser({ user: data.user, token }));
        setPhotoPreview(data.user.photoURL || photoPreview);
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
    setEditing(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Account', href: '/account' },
            { label: 'Profile' },
          ]}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-8 pb-8 border-b">
                <div className="relative flex-shrink-0">
                  <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: '#043927' }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      : (formData.displayName?.charAt(0)?.toUpperCase() || 'U')
                    }
                  </div>
                  {editing && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md hover:opacity-90 transition"
                        style={{ backgroundColor: '#043927' }}
                        title="Change photo"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{formData.displayName || 'User'}</h2>
                  <p className="text-gray-600">{formData.email || formData.phoneNumber}</p>
                  {user?.role === 'admin' && (
                    <span className="inline-block mt-1 px-3 py-1 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: '#043927' }}>
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" style={{ color: '#043927' }} />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {editing ? (
                      <Input
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.displayName || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        disabled={!!user?.email}
                      />
                    ) : (
                      <div>
                        <p className="text-gray-900 py-2">{formData.email || '-'}</p>
                        {formData.email && (
                          <div className="mt-2">
                            {emailVerified ? (
                              <div className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Email Verified
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center text-amber-600 text-sm">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Email Not Verified
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSendVerificationEmail}
                                    disabled={sendingVerification}
                                  >
                                    {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleRefreshVerificationStatus}
                                  >
                                    Refresh Status
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+91 1234567890"
                        disabled={!!user?.phoneNumber}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.phoneNumber || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6 mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" style={{ color: '#043927' }} />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    {editing ? (
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.address || '-'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {editing ? (
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formData.city || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {editing ? (
                        <Input
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="State"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formData.state || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      {editing ? (
                        <Input
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="123456"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{formData.pincode || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex space-x-4 mt-8 pt-8 border-t">
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Account Type:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Member Since:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Firebase UID:</span>
                  <span className="ml-2 font-mono text-xs text-gray-900">
                    {user?.firebaseUid?.substring(0, 20)}...
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
