'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';
import ImageUploadField from '@/components/admin/ImageUploadField';

const SWATCHES = ['#ffffff', '#000000', '#B76E79', '#1C1C1C', '#F8F6F2', '#fbbf24', '#3b82f6'];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1.5 border rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
          maxLength={7} placeholder="#ffffff" />
        <div className="flex gap-1 flex-wrap">
          {SWATCHES.map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform flex-shrink-0"
              style={{ backgroundColor: c, borderColor: value === c ? '#B76E79' : '#e5e7eb' }}
              title={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

const BANNER_TEMPLATES = [
  {
    id: 'classic-center',
    name: 'Classic Center',
    preview: 'Text centered with button',
    fields: ['title', 'subtitle', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        {d.image && <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative z-10 text-center px-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: d.titleColor || '#ffffff' }}>{d.title || 'Banner Title'}</h2>
          {d.subtitle && <p className="text-lg mb-4" style={{ color: d.subtitleColor || 'rgba(255,255,255,0.85)' }}>{d.subtitle}</p>}
          {d.buttonText && <button className="px-5 py-2.5 text-white rounded-lg font-medium text-sm" style={{ backgroundColor: '#B76E79' }}>{d.buttonText}</button>}
        </div>
      </div>
    ),
  },
  {
    id: 'left-aligned',
    name: 'Left Aligned',
    preview: 'Content left, image right',
    fields: ['title', 'subtitle', 'description', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 bg-gradient-to-r from-rose-50 to-pink-50 flex items-center overflow-hidden">
        <div className="w-1/2 px-10 z-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: d.titleColor || '#1C1C1C' }}>{d.title || 'Banner Title'}</h2>
          {d.subtitle && <p className="text-base mb-2" style={{ color: d.subtitleColor || '#B76E79' }}>{d.subtitle}</p>}
          {d.description && <p className="text-sm text-gray-600 mb-3">{d.description}</p>}
          {d.buttonText && <button className="px-4 py-2 text-white rounded-md text-sm font-medium" style={{ backgroundColor: '#B76E79' }}>{d.buttonText}</button>}
        </div>
        {d.image && <div className="w-1/2 h-full absolute right-0 top-0"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>}
      </div>
    ),
  },
  {
    id: 'overlay-bottom',
    name: 'Overlay Bottom',
    preview: 'Full image, text at bottom',
    fields: ['title', 'subtitle', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 bg-gray-900 overflow-hidden">
        {d.image && <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: d.titleColor || '#ffffff' }}>{d.title || 'Banner Title'}</h2>
          {d.subtitle && <p className="text-base mb-2" style={{ color: d.subtitleColor || 'rgba(255,255,255,0.85)' }}>{d.subtitle}</p>}
          {d.buttonText && <button className="px-4 py-1.5 bg-white rounded-md text-sm font-medium" style={{ color: '#B76E79' }}>{d.buttonText}</button>}
        </div>
      </div>
    ),
  },
  {
    id: 'split-diagonal',
    name: 'Split Diagonal',
    preview: 'Half color block, half image',
    fields: ['title', 'subtitle', 'offerText', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 overflow-hidden flex">
        <div className="w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#B76E79' }}>
          <div className="text-center">
            {d.offerText && <div className="text-4xl font-black mb-1 text-white">{d.offerText}</div>}
            <h2 className="text-xl font-semibold" style={{ color: d.titleColor || '#ffffff' }}>{d.title || 'Banner Title'}</h2>
          </div>
        </div>
        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-6 relative">
          {d.image
            ? <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            : <div className="text-center z-10">
                {d.subtitle && <p className="text-lg mb-3" style={{ color: d.subtitleColor || '#374151' }}>{d.subtitle}</p>}
                {d.buttonText && <button className="px-5 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: '#B76E79' }}>{d.buttonText}</button>}
              </div>
          }
        </div>
      </div>
    ),
  },
  {
    id: 'minimal-badge',
    name: 'Minimal Badge',
    preview: 'Clean white with badge pill',
    fields: ['title', 'subtitle', 'badgeText', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
        {d.image && <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />}
        <div className="relative z-10 text-center px-8">
          {d.badgeText && <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-3" style={{ backgroundColor: '#B76E79' }}>{d.badgeText}</span>}
          <h2 className="text-3xl font-bold mb-2" style={{ color: d.titleColor || '#111827' }}>{d.title || 'Banner Title'}</h2>
          {d.subtitle && <p className="text-base mb-4" style={{ color: d.subtitleColor || '#4B5563' }}>{d.subtitle}</p>}
          {d.buttonText && <button className="px-5 py-2 border-2 rounded-lg font-medium text-sm" style={{ borderColor: '#B76E79', color: '#B76E79' }}>{d.buttonText}</button>}
        </div>
      </div>
    ),
  },
  {
    id: 'gradient-modern',
    name: 'Gradient Modern',
    preview: 'Vibrant gradient with highlight',
    fields: ['title', 'subtitle', 'highlightText', 'buttonText', 'buttonLink'],
    render: (d: any) => (
      <div className="relative w-full h-56 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 flex items-center justify-center overflow-hidden">
        {d.image && <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />}
        <div className="relative z-10 text-center px-8">
          {d.highlightText && <div className="text-5xl font-black mb-1" style={{ color: d.titleColor || '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>{d.highlightText}</div>}
          <h2 className="text-2xl font-bold mb-2" style={{ color: d.titleColor || '#ffffff' }}>{d.title || 'Banner Title'}</h2>
          {d.subtitle && <p className="text-base mb-4" style={{ color: d.subtitleColor || 'rgba(255,255,255,0.9)' }}>{d.subtitle}</p>}
          {d.buttonText && <button className="px-5 py-2.5 bg-white rounded-full font-semibold text-sm shadow-lg" style={{ color: '#B76E79' }}>{d.buttonText}</button>}
        </div>
      </div>
    ),
  },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(BANNER_TEMPLATES[0].id);

  const emptyForm = {
    title: '', subtitle: '', description: '', image: '', link: '', order: '',
    isActive: true, template: BANNER_TEMPLATES[0].id,
    buttonText: 'Explore Now', buttonLink: '/products',
    offerText: '', badgeText: '', highlightText: '',
    titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.85)',
  };

  const [formData, setFormData] = useState(emptyForm);
  const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { alertError('Please login as admin'); setLoading(false); return; }
      const res = await fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBanners(data.banners);
      else alertError(data.message === 'Unauthorized' ? 'Admin access required.' : 'Error loading banners.');
    } catch { alertError('Error loading banners.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      if (!token) { alertError('Please login first'); return; }
      const imageToSend = formData.image || (editingBanner ? editingBanner.image : '');
      if (!imageToSend) { alertError('Please provide a banner image'); return; }
      const body = editingBanner ? { ...formData, image: imageToSend, id: editingBanner.id } : { ...formData, image: imageToSend };
      const res = await fetch('/api/admin/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) { alertSuccess(editingBanner ? 'Banner updated!' : 'Banner created!'); setShowModal(false); fetchBanners(); }
      else alertError(data.message || 'Failed to save banner');
    } catch { alertError('Error saving banner'); }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('Delete this banner?');
    if (!ok) return;
    try {
      const { getAuthToken } = await import('@/lib/firebase-client');
      const token = await getAuthToken();
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) { alertSuccess('Banner deleted'); fetchBanners(); }
      else alertError('Failed to delete');
    } catch { alertError('Error deleting banner'); }
  };

  const openEdit = (banner: any) => {
    const tpl = banner.template || BANNER_TEMPLATES[0].id;
    setSelectedTemplate(tpl);
    setFormData({
      title: banner.title, subtitle: banner.subtitle || '', description: banner.description || '',
      image: banner.image, link: banner.link || '', order: banner.order.toString(), isActive: banner.isActive,
      template: tpl, buttonText: banner.buttonText || 'Explore Now', buttonLink: banner.buttonLink || '/products',
      offerText: banner.offerText || '', badgeText: banner.badgeText || '', highlightText: banner.highlightText || '',
      titleColor: banner.titleColor || '#ffffff', subtitleColor: banner.subtitleColor || 'rgba(255,255,255,0.85)',
    });
    setEditingBanner(banner);
    setShowModal(true);
  };

  const openAdd = () => {
      setEditingBanner(null);
      setSelectedTemplate(BANNER_TEMPLATES[0].id);
      setFormData({ ...emptyForm });
      setShowModal(true);
    };

  const currentTemplate = BANNER_TEMPLATES.find(t => t.id === selectedTemplate)!;
  const hasField = (f: string) => currentTemplate.fields.includes(f);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners and promotional sliders</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><p className="mb-2">No banners found</p><p className="text-sm">Make sure you are logged in as admin</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Preview</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Template</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4"><img src={banner.image} alt={banner.title} className="w-32 h-16 object-cover rounded" /></td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{banner.title}</p>
                      {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {BANNER_TEMPLATES.find(t => t.id === banner.template)?.name || 'Classic Center'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{banner.order}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(banner)} className="text-blue-600 hover:text-blue-800"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-bold">{editingBanner ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">1. Choose Template</p>
                <div className="grid grid-cols-3 gap-3">
                  {BANNER_TEMPLATES.map(tpl => (
                    <button key={tpl.id} type="button"
                      onClick={() => { setSelectedTemplate(tpl.id); set('template', tpl.id); }}
                      className={`border-2 rounded-lg p-3 text-left transition-all ${selectedTemplate === tpl.id ? 'border-[#B76E79] bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="text-sm font-semibold text-gray-800">{tpl.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{tpl.preview}</div>
                      {selectedTemplate === tpl.id && <div className="mt-1 text-xs font-medium" style={{ color: '#B76E79' }}>Selected</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">2. Live Preview</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  {currentTemplate.render(formData)}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">3. Fill Content</p>
                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input type="text" value={formData.title} onChange={e => set('title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                      placeholder="Main banner heading" required />
                  </div>

                  <ColorPicker label="Title Color" value={formData.titleColor} onChange={v => set('titleColor', v)} />
                  <ColorPicker label="Subtitle Color" value={formData.subtitleColor} onChange={v => set('subtitleColor', v)} />

                  {hasField('subtitle') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Subtitle</label>
                      <input type="text" value={formData.subtitle} onChange={e => set('subtitle', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="e.g. Up to 50% Off" />
                    </div>
                  )}

                  {hasField('description') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input type="text" value={formData.description} onChange={e => set('description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="Short description" />
                    </div>
                  )}

                  {hasField('offerText') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Offer Text</label>
                      <input type="text" value={formData.offerText} onChange={e => set('offerText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="e.g. 50% OFF" />
                    </div>
                  )}

                  {hasField('badgeText') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Badge Text</label>
                      <input type="text" value={formData.badgeText} onChange={e => set('badgeText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="e.g. NEW ARRIVAL" />
                    </div>
                  )}

                  {hasField('highlightText') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Highlight Text</label>
                      <input type="text" value={formData.highlightText} onChange={e => set('highlightText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="e.g. SALE" />
                    </div>
                  )}

                  {hasField('buttonText') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Button Text</label>
                      <input type="text" value={formData.buttonText} onChange={e => set('buttonText', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="e.g. Explore Now" />
                    </div>
                  )}

                  {hasField('buttonLink') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Button Link</label>
                      <input type="text" value={formData.buttonLink} onChange={e => set('buttonLink', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                        placeholder="/products" />
                    </div>
                  )}

                  <div className="col-span-2">
                    <ImageUploadField label="Banner Image" value={formData.image} onChange={v => set('image', v)}
                      required={!editingBanner} editingHint={editingBanner ? 'leave blank to keep current' : undefined} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Banner Link (optional)</label>
                    <input type="text" value={formData.link} onChange={e => set('link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                      placeholder="/products" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input type="number" value={formData.order} onChange={e => set('order', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                      min="0" placeholder="1" />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-[#B76E79]" />
                      <span className="text-sm font-medium">Active (visible on site)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t mt-6">
                  <button type="submit" className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#B76E79' }}>
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
