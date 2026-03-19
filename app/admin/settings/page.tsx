'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  taxRate: number;
  taxEnabled: boolean;
  taxLabel: string;
  freeShippingThreshold: number;
  shippingCharge: number;
  returnPolicyDays: number;
  copyrightText: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  shiprocketEnabled: boolean;
  maintenanceMode: boolean;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    address: '',
    currency: 'INR',
    taxRate: 3,
    taxEnabled: true,
    taxLabel: 'GST',
    freeShippingThreshold: 500,
    shippingCharge: 50,
    returnPolicyDays: 7,
    copyrightText: 'All rights reserved.',
    razorpayEnabled: false,
    razorpayKeyId: '',
    shiprocketEnabled: false,
    maintenanceMode: false,
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage application configuration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => handleChange('siteDescription', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Copyright Text</label>
                <Input
                  value={settings.copyrightText}
                  onChange={(e) => handleChange('copyrightText', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                <Input
                  value={settings.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Shipping & Returns */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping & Returns</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Free Shipping Threshold (₹)</label>
                <Input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Charge (₹)</label>
                <Input
                  type="number"
                  value={settings.shippingCharge}
                  onChange={(e) => handleChange('shippingCharge', Number(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Return Policy (Days)</label>
                <Input
                  type="number"
                  value={settings.returnPolicyDays}
                  onChange={(e) => handleChange('returnPolicyDays', Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </Card>

          {/* Social Media Links */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                <Input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter URL</label>
                <Input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram URL</label>
                <Input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <Input
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="razorpayEnabled"
                  checked={settings.razorpayEnabled}
                  onChange={(e) => handleChange('razorpayEnabled', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="razorpayEnabled" className="text-sm font-medium">Enable Razorpay</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Razorpay Key ID</label>
                <Input
                  value={settings.razorpayKeyId}
                  onChange={(e) => handleChange('razorpayKeyId', e.target.value)}
                  placeholder="rzp_test_xxxxx"
                />
              </div>
            </div>
          </Card>

          {/* GST / Tax Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">GST / Tax Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="taxEnabled"
                  checked={settings.taxEnabled}
                  onChange={(e) => handleChange('taxEnabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="taxEnabled" className="text-sm font-medium">Enable GST / Tax on orders</label>
              </div>

              {settings.taxEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Label</label>
                    <Input
                      value={settings.taxLabel}
                      onChange={(e) => handleChange('taxLabel', e.target.value)}
                      placeholder="GST"
                    />
                    <p className="text-xs text-gray-400 mt-1">Shown to customers (e.g. GST, VAT)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="3"
                    />
                    <p className="text-xs text-gray-400 mt-1">Applied on subtotal after discount</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Other Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Other Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <Input
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium">Maintenance Mode</label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} style={{ backgroundColor: '#043927', color: '#fff' }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
