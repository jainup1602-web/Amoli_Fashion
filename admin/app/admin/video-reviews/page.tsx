'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Star, X, Upload } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { alertSuccess, alertError } from '@/lib/alert';

interface VideoReview {
  id: string;
  customerName: string;
  customerLocation?: string;
  rating: number;
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  status: string;
  order: number;
  createdAt: string;
}

const emptyForm = {
  customerName: '',
  customerLocation: '',
  rating: 5,
  videoUrl: '',
  thumbnailUrl: '',
  thumbnailUrl: '',
  isActive: true,
  status: 'approved',
  order: 0,
};

export default function VideoReviewsPage() {
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<VideoReview | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  // Upload mode: 'url' or 'file'
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'file'>('url');
  const [thumbInputMode, setThumbInputMode] = useState<'url' | 'file'>('url');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchVideoReviews(); }, []);

  const getToken = async () => {
    const { getAuthToken } = await import('@/lib/firebase-client');
    return await getAuthToken();
  };

  const fetchVideoReviews = async () => {
    try {
      const token = await getToken();
      if (!token) { alertError('Please login as admin'); setLoading(false); return; }
      const res = await fetch('/api/admin/video-reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setVideoReviews(data.videoReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        return data.url;
      } else {
        alertError(data.error || 'Upload failed');
        return null;
      }
    } catch (e) {
      console.error(e);
      alertError('Upload failed');
      return null;
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alertError('Video file must be under 50MB'); return; }
    
    setSaving(true);
    const url = await uploadFile(file);
    setSaving(false);
    
    if (url) {
      setFormData(f => ({ ...f, videoUrl: url }));
    }
  };

  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSaving(true);
    const url = await uploadFile(file);
    setSaving(false);
    
    if (url) {
      setFormData(f => ({ ...f, thumbnailUrl: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl && !editingReview) { alertError('Please provide a video URL or upload a file'); return; }
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) { alertError('Please login as admin'); return; }

      const videoToSend = formData.videoUrl || (editingReview?.videoUrl ?? '');
      const payload = editingReview
        ? { ...formData, videoUrl: videoToSend, id: editingReview.id }
        : { ...formData, videoUrl: videoToSend };

      const res = await fetch('/api/admin/video-reviews', {
        method: editingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchVideoReviews();
        resetForm();
        alertSuccess(editingReview ? 'Video review updated!' : 'Video review created!');
      } else {
        alertError(data.message || 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      alertError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: VideoReview) => {
    setEditingReview(review);
    setFormData({
      customerName: review.customerName,
      customerLocation: review.customerLocation || '',
      rating: review.rating,
      videoUrl: review.videoUrl,
      thumbnailUrl: review.thumbnailUrl || '',
      isActive: review.isActive,
      status: review.status || 'approved',
      order: review.order,
    });
    setVideoInputMode(review.videoUrl?.startsWith('/uploads') || review.videoUrl?.startsWith('http') ? 'url' : 'file');
    setThumbInputMode(review.thumbnailUrl?.startsWith('/uploads') || review.thumbnailUrl?.startsWith('http') ? 'url' : 'file');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete('this video review');
    if (!ok) return;
    try {
      const token = await getToken();
      if (!token) { alertError('Please login as admin'); return; }
      const res = await fetch(`/api/admin/video-reviews?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { await fetchVideoReviews(); }
      else alertError(data.message || 'Failed to delete');
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/admin/video-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status, isActive: status === 'approved' }),
      });
      const data = await res.json();
      if (data.success) { await fetchVideoReviews(); }
      else alertError(data.message || 'Failed to update status');
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingReview(null);
    setShowForm(false);
    setVideoInputMode('url');
    setThumbInputMode('url');
    if (videoFileRef.current) videoFileRef.current.value = '';
    if (thumbFileRef.current) thumbFileRef.current.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Reviews</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Video Review
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-bold">{editingReview ? 'Edit Video Review' : 'Add Video Review'}</h2>
              <button onClick={resetForm}><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <Input value={formData.customerName} onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))} required />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <Input value={formData.customerLocation} onChange={e => setFormData(f => ({ ...f, customerLocation: e.target.value }))} placeholder="e.g. Mumbai" />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select value={formData.rating} onChange={e => setFormData(f => ({ ...f, rating: parseInt(e.target.value) }))} className="w-full p-2 border rounded-md">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {/* Video — URL or File */}
              <div>
                <label className="block text-sm font-medium mb-1">Video {!editingReview && '*'}</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setVideoInputMode('url')}
                    className={`px-3 py-1 text-xs rounded border ${videoInputMode === 'url' ? 'bg-black text-white border-black' : 'border-gray-300'}`}>
                    URL
                  </button>
                  <button type="button" onClick={() => setVideoInputMode('file')}
                    className={`px-3 py-1 text-xs rounded border flex items-center gap-1 ${videoInputMode === 'file' ? 'bg-black text-white border-black' : 'border-gray-300'}`}>
                    <Upload className="h-3 w-3" /> Upload File
                  </button>
                </div>

                {videoInputMode === 'url' ? (
                  <Input
                    value={formData.videoUrl}
                    onChange={e => setFormData(f => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="/uploads/videos/xyz.mp4 or https://..."
                    required={!editingReview}
                  />
                ) : (
                  <div>
                    <input ref={videoFileRef} type="file" accept="video/*" onChange={handleVideoFileChange} className="w-full text-sm border rounded-md p-2" />
                    <p className="text-xs text-gray-400 mt-1">Max 50MB.</p>
                  </div>
                )}

                {/* Show current video if editing */}
                {editingReview && formData.videoUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current video:</p>
                    <video src={formData.videoUrl} className="w-full h-24 object-cover rounded" muted />
                  </div>
                )}
              </div>

              {/* Thumbnail — URL or File */}
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setThumbInputMode('url')}
                    className={`px-3 py-1 text-xs rounded border ${thumbInputMode === 'url' ? 'bg-black text-white border-black' : 'border-gray-300'}`}>
                    URL
                  </button>
                  <button type="button" onClick={() => setThumbInputMode('file')}
                    className={`px-3 py-1 text-xs rounded border flex items-center gap-1 ${thumbInputMode === 'file' ? 'bg-black text-white border-black' : 'border-gray-300'}`}>
                    <Upload className="h-3 w-3" /> Upload Image
                  </button>
                </div>

                {thumbInputMode === 'url' ? (
                  <Input
                    value={formData.thumbnailUrl || ''}
                    onChange={e => setFormData(f => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="/uploads/videos/thumb.jpg or https://..."
                  />
                ) : (
                  <input ref={thumbFileRef} type="file" accept="image/*" onChange={handleThumbFileChange} className="w-full text-sm border rounded-md p-2" />
                )}

                {formData.thumbnailUrl && (
                  <img src={formData.thumbnailUrl} alt="thumb" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <Input type="number" value={formData.order} onChange={e => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} min={0} />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-sm font-medium">Active (show on homepage)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} className="p-1 border rounded text-sm">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1" style={{ backgroundColor: '#B76E79', color: '#fff' }}>
                  {saving ? 'Saving...' : editingReview ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            {['pending', 'approved', 'rejected'].map(tab => {
              const count = videoReviews.filter(r => (r.status || 'approved') === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : videoReviews.filter(r => (r.status || 'approved') === activeTab).length === 0 ? (
          <div className="p-8 text-center text-gray-400">No {activeTab} video reviews.</div>
        ) : (
          <div className="divide-y">
            {videoReviews.filter(r => (r.status || 'approved') === activeTab).map(review => (
              <div key={review.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {review.thumbnailUrl ? (
                      <img src={review.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : review.videoUrl ? (
                      <video src={review.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No media</div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">{review.customerName}</p>
                    {review.customerLocation && <p className="text-sm text-gray-500">{review.customerLocation}</p>}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Order: {review.order} · {review.isActive ? '✅ Active' : '⏸ Inactive'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {activeTab === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleStatusUpdate(review.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(review.id, 'rejected')}>Reject</Button>
                    </div>
                  )}
                  {activeTab === 'rejected' && (
                     <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(review.id, 'approved')} className="text-green-600 hover:text-green-700 border-green-200">Re-Approve</Button>
                  )}
                  <div className="flex gap-2 border-l pl-4 ml-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-600 hover:border-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
