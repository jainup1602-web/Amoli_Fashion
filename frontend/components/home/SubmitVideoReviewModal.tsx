'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubmitVideoReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitVideoReviewModal({ isOpen, onClose }: SubmitVideoReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerLocation: '',
    rating: 5,
  });
  
  const videoFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Max 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      setError('Video file is too large. Maximum allowed size is 20MB.');
      if (videoFileRef.current) videoFileRef.current.value = '';
      return;
    }
    
    setVideoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please upload a video to submit your review.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('customerName', formData.customerName);
      data.append('customerLocation', formData.customerLocation);
      data.append('rating', formData.rating.toString());
      data.append('videoFile', videoFile);

      let headers: any = {};
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/video-reviews/submit', {
        method: 'POST',
        headers,
        body: data,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccess(true);
      } else {
        setError(resData.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form after close animation
      setTimeout(() => {
        setSuccess(false);
        setError('');
        setFormData({ customerName: '', customerLocation: '', rating: 5 });
        setVideoFile(null);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[#FDFCF0]">
          <h2 className="text-xl font-playfair text-[#1A1A1A]">Share Your Experience</h2>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 fill-current" />
              </div>
              <h3 className="text-2xl font-playfair text-[#1A1A1A]">Thank You!</h3>
              <p className="text-gray-500">Your video review has been submitted successfully. It will appear on our website once approved.</p>
              <Button onClick={handleClose} className="mt-6 w-full bg-[#1A1A1A] hover:bg-black text-white">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <Input 
                  value={formData.customerName} 
                  onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))} 
                  required 
                  placeholder="e.g. Priya Sharma"
                  className="bg-gray-50 border-gray-200 focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <Input 
                  value={formData.customerLocation} 
                  onChange={e => setFormData(f => ({ ...f, customerLocation: e.target.value }))} 
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="bg-gray-50 border-gray-200 focus:border-[#B76E79]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData(f => ({ ...f, rating: star }))}
                      className={`p-1 transition-all ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                    >
                      <Star className={`h-8 w-8 ${formData.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video *</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${videoFile ? 'border-[#B76E79] bg-[#B76E79]/5' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                  {videoFile ? (
                    <div className="space-y-3">
                      <video src={URL.createObjectURL(videoFile)} className="w-full h-32 object-cover rounded-lg" controls />
                      <button type="button" onClick={() => { setVideoFile(null); if(videoFileRef.current) videoFileRef.current.value = ''; }} className="text-xs text-red-500 hover:text-red-700 font-medium uppercase tracking-wider">
                        Remove Video
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-sm font-medium text-[#1A1A1A]">Click to upload video</span>
                      <span className="text-xs text-gray-500">MP4, WebM or MOV (Max 20MB)</span>
                      <input 
                        ref={videoFileRef} 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideoFileChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !videoFile} 
                className="w-full h-12 text-[13px] uppercase tracking-widest bg-[#1A1A1A] hover:bg-black text-white rounded-none border-none mt-2 transition-luxury"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
