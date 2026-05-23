'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, Trash2 } from 'lucide-react';
import { alertSuccess, alertError } from '@/lib/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface Stat {
  number: string;
  label: string;
}

export default function BirthstoneSectionAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    subtitle: "Born To Shine, Crafted To Last",
    title: "A Gem For Every Birthday, A Story For Every Stone",
    description: "Vestibulum Vehicula Nunc Ad Fringilla Pretium Ex Ac Praesent Vitae...",
    quote: "\"Maecenas Porta Id Nibh Quis Imperdiet...\"",
    buttonText: "Shop Now",
    buttonLink: "/products",
    mainImage: "/image/Amoli_1.png",
    smallImage: "/image/Amoli_2.png",
    stats: [
      { number: '100', label: 'Worldwide Branch' },
      { number: '250+', label: 'Products Designs' },
      { number: '2K', label: 'Products Reviews' },
      { number: '100K', label: 'Happy Customers' }
    ] as Stat[]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings?.birthstone_section) {
        setFormData(data.settings.birthstone_section);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ birthstone_section: formData }),
      });

      const data = await res.json();
      
      if (data.success) {
        alertSuccess('Birthstone section updated successfully');
      } else {
        alertError('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alertError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, stats: newStats });
  };

  const addStat = () => {
    if (formData.stats.length >= 4) {
      alertError('Maximum 4 stats allowed for best layout');
      return;
    }
    setFormData({
      ...formData,
      stats: [...formData.stats, { number: '', label: '' }]
    });
  };

  const removeStat = (index: number) => {
    const newStats = [...formData.stats];
    newStats.splice(index, 1);
    setFormData({ ...formData, stats: newStats });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Birthstone Section</h1>
          <p className="text-gray-600 mt-1">Update the content, images, and stats for the homepage Birthstone section.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Images</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ImageUploadField
                  label="Main Arch Image"
                  value={formData.mainImage}
                  onChange={(val) => setFormData({ ...formData, mainImage: val })}
                  required
                />
              </div>
              <div>
                <ImageUploadField
                  label="Small Top-Right Image"
                  value={formData.smallImage}
                  onChange={(val) => setFormData({ ...formData, smallImage: val })}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Text Content</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle (Small Uppercase)</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Born To Shine, Crafted To Last"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Main Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="A Gem For Every Birthday..."
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Paragraph Description</label>
                <textarea
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Vestibulum Vehicula Nunc Ad..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Italic Quote</label>
                <Input
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder='"Maecenas Porta Id..."'
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/products"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Stats (Max 4)</h2>
              <Button type="button" variant="outline" size="sm" onClick={addStat} disabled={formData.stats.length >= 4}>
                <Plus className="h-4 w-4 mr-1" /> Add Stat
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.stats.map((stat, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Number (e.g. 100K)"
                      value={stat.number}
                      onChange={(e) => updateStat(index, 'number', e.target.value)}
                      className="bg-white"
                      required
                    />
                    <Input
                      placeholder="Label (e.g. Happy Customers)"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => removeStat(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.stats.length === 0 && (
                <p className="text-gray-500 text-sm">No stats added yet.</p>
              )}
            </div>
          </Card>

          <div className="flex justify-end pt-4 pb-12">
            <Button type="submit" disabled={saving} size="lg" style={{ backgroundColor: '#B76E79', color: '#fff' }}>
              {saving ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
