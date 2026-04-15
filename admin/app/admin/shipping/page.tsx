'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, MapPin, Truck } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

interface ShippingZone {
  id: string;
  name: string;
  pincodes: string;
  charges: number;
  freeAbove: number | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = { name: '', pincodes: '', charges: '', freeAbove: '', isActive: true };

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editZone, setEditZone] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getToken = async () => {
    const { getAuthToken } = await import('@/lib/firebase-client');
    return await getAuthToken();
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/admin/shipping', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setZones(data.zones || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); }, []);

  const openAdd = () => { setEditZone(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (z: ShippingZone) => {
    setEditZone(z);
    setForm({ name: z.name, pincodes: z.pincodes, charges: String(z.charges), freeAbove: z.freeAbove != null ? String(z.freeAbove) : '', isActive: z.isActive });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.pincodes.trim() || !form.charges) return;
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        ...(editZone ? { id: editZone.id } : {}),
        name: form.name.trim(),
        pincodes: form.pincodes.trim(),
        charges: parseFloat(form.charges),
        freeAbove: form.freeAbove ? parseFloat(form.freeAbove) : null,
        isActive: form.isActive,
      };
      const res = await fetch('/api/admin/shipping', {
        method: editZone ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) { setModalOpen(false); fetchZones(); }
      else alertError(data.message || 'Failed to save');
    } catch { alertError('Error saving zone'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this shipping zone');
    if (!ok) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/shipping?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) fetchZones();
      else alertError(data.message || 'Failed to delete');
    } catch { alertError('Error deleting zone'); }
  };

  const handleToggle = async (z: ShippingZone) => {
    try {
      const token = await getToken();
      await fetch('/api/admin/shipping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: z.id, isActive: !z.isActive }),
      });
      fetchZones();
    } catch {}
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6" style={{ color: '#B76E79' }} />
            Shipping Zones
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage delivery zones, pincodes and charges</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
          style={{ backgroundColor: '#B76E79' }}
        >
          <Plus className="h-4 w-4" /> Add Zone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Zones', value: zones.length },
          { label: 'Active Zones', value: zones.filter(z => z.isActive).length },
          { label: 'Avg. Charge', value: zones.length ? `₹${Math.round(zones.reduce((s, z) => s + z.charges, 0) / zones.length)}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#B76E79' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#B76E79' }}>
            <tr>
              {['Zone Name', 'Pincodes', 'Charge (₹)', 'Free Above (₹)', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  No shipping zones yet. Add one to get started.
                </td>
              </tr>
            ) : zones.map(z => (
              <tr key={z.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{z.name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                  <span className="truncate block text-xs font-mono">{z.pincodes}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">₹{z.charges}</td>
                <td className="px-4 py-3 text-gray-600">{z.freeAbove != null ? `₹${z.freeAbove}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(z)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${z.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {z.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(z)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(z.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pincode format hint */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
        <strong>Pincode format:</strong> Enter comma-separated pincodes or ranges. Example: <code>400001,400002,110001-110100,500001</code>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editZone ? 'Edit Zone' : 'Add Shipping Zone'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#B76E79' } as any}
                  placeholder="e.g. Metro Cities, North India"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincodes <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none font-mono"
                  rows={3}
                  placeholder="400001,400002,110001-110100"
                  value={form.pincodes}
                  onChange={e => setForm(f => ({ ...f, pincodes: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated pincodes or ranges (e.g. 110001-110100)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Charge (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="0" step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    placeholder="50"
                    value={form.charges}
                    onChange={e => setForm(f => ({ ...f, charges: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Above (₹)</label>
                  <input
                    type="number" min="0" step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    placeholder="999 (optional)"
                    value={form.freeAbove}
                    onChange={e => setForm(f => ({ ...f, freeAbove: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? '' : 'bg-gray-200'}`}
                  style={form.isActive ? { backgroundColor: '#B76E79' } : {}}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-700">{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.pincodes.trim() || !form.charges}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#B76E79' }}
              >
                {saving ? 'Saving...' : <><Check className="h-4 w-4" />{editZone ? 'Update Zone' : 'Add Zone'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
