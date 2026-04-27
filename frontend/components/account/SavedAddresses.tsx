'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

interface SavedAddressesProps {
  onSelect?: (address: Address) => void;
  selectable?: boolean;
}

export function SavedAddresses({ onSelect, selectable = false }: SavedAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.user?.savedAddresses) {
        setAddresses(JSON.parse(data.user.savedAddresses));
      }
    } catch {}
  };

  const saveAddresses = async (updated: Address[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ savedAddresses: JSON.stringify(updated) }),
      });
      setAddresses(updated);
    } catch { toast.error('Failed to save address'); }
  };

  const handleAdd = async () => {
    if (!form.fullName || !form.addressLine1 || !form.city || !form.pincode) {
      toast.error('Please fill required fields'); return;
    }
    const newAddr: Address = { ...form, id: Date.now().toString() };
    await saveAddresses([...addresses, newAddr]);
    setAdding(false);
    setForm({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India' });
    toast.success('Address saved!');
  };

  const handleDelete = async (id: string) => {
    await saveAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address removed');
  };

  const handleSelect = (addr: Address) => {
    setSelected(addr.id);
    onSelect?.(addr);
  };

  return (
    <div className="space-y-3">
      {addresses.map(addr => (
        <div
          key={addr.id}
          className={`border p-4 cursor-pointer transition-colors ${selectable && selected === addr.id ? 'border-[#B76E79] bg-[#F9F5F2]' : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => selectable && handleSelect(addr)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              {selectable && (
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${selected === addr.id ? 'border-[#B76E79]' : 'border-gray-300'}`}>
                  {selected === addr.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B76E79' }} />}
                </div>
              )}
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 mr-2" style={{ backgroundColor: '#F9F5F2', color: '#B76E79' }}>{addr.label}</span>
                <span className="text-sm font-medium text-gray-800">{addr.fullName}</span>
                <p className="text-xs text-gray-500 mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                {addr.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>}
              </div>
            </div>
            {!selectable && (
              <button onClick={() => handleDelete(addr.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add New */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="w-full border border-dashed border-gray-300 p-3 text-xs font-elegant tracking-widest uppercase text-gray-400 hover:border-[#B76E79] hover:text-[#B76E79] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Address
        </button>
      ) : (
        <div className="border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map(l => (
              <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                className="px-3 py-1 text-xs border transition-colors"
                style={{ borderColor: form.label === l ? '#B76E79' : '#e5e7eb', color: form.label === l ? '#fff' : '#6b7280', backgroundColor: form.label === l ? '#B76E79' : 'transparent' }}>
                {l}
              </button>
            ))}
          </div>
          {[
            { name: 'fullName', placeholder: 'Full Name *' },
            { name: 'phone', placeholder: 'Phone' },
            { name: 'addressLine1', placeholder: 'Address Line 1 *' },
            { name: 'addressLine2', placeholder: 'Landmark / Area' },
          ].map(f => (
            <input key={f.name} placeholder={f.placeholder} value={(form as any)[f.name]}
              onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
              className="w-full border border-gray-200 focus:border-[#B76E79] px-3 h-10 text-sm outline-none" />
          ))}
          <div className="grid grid-cols-3 gap-2">
            {[{ name: 'city', placeholder: 'City *' }, { name: 'state', placeholder: 'State' }, { name: 'pincode', placeholder: 'Pincode *' }].map(f => (
              <input key={f.name} placeholder={f.placeholder} value={(form as any)[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className="border border-gray-200 focus:border-[#B76E79] px-3 h-10 text-sm outline-none" />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 h-9 text-white text-xs tracking-widest uppercase" style={{ backgroundColor: '#B76E79' }}>Save</button>
            <button onClick={() => setAdding(false)} className="flex-1 h-9 border border-gray-200 text-xs text-gray-500 tracking-widest uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
