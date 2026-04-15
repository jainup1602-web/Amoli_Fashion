'use client';

import { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin } from 'lucide-react';
import { alertSuccess, alertError } from '@/lib/alert';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        alertSuccess('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alertError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8 sm:py-12">
        <Breadcrumb items={[{ label: 'Contact Us' }]} />

        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6">Contact Us</h1>
          <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12">
            Have a question? We&apos;d love to hear from you
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Contact Info */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
              {settings?.contactEmail && (
                <Card className="p-4 sm:p-6">
                  <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Email Us</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-all">{settings.contactEmail}</p>
                </Card>
              )}

              {settings?.contactPhone && (
                <Card className="p-4 sm:p-6">
                  <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Call Us</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{settings.contactPhone}</p>
                </Card>
              )}

              {settings?.address && (
                <Card className="p-4 sm:p-6">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Visit Us</h3>
                  <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{settings.address}</p>
                </Card>
              )}

              {settings?.whatsappNumber && (
                <Card className="p-4 sm:p-6">
                  <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">WhatsApp</h3>
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-gray-900 hover:underline"
                  >
                    {settings.whatsappNumber}
                  </a>
                </Card>
              )}

              <Card className="p-4 sm:p-6">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Business Hours</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Mon - Sat: 9:00 AM - 6:00 PM<br />
                  Sunday: Closed
                </p>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2 p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    className="w-full border rounded-lg p-3 min-h-[120px] sm:min-h-[150px] text-sm"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your message..."
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
