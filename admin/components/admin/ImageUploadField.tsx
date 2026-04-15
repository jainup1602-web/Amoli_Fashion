'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  editingHint?: string; // shown when editing, e.g. "leave blank to keep current"
}

export default function ImageUploadField({ value, onChange, label, required, editingHint }: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'url' | 'file'>(value?.startsWith('data:') ? 'file' : 'url');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
          {editingHint && <span className="text-gray-400 font-normal ml-1 text-xs">({editingHint})</span>}
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 text-xs rounded border transition-colors ${mode === 'url' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2 py-0.5 text-xs rounded border flex items-center gap-1 transition-colors ${mode === 'file' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value?.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border rounded-md text-sm"
          required={required && !value}
        />
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {value ? (
            <div className="space-y-2">
              <img src={value} alt="preview" className="h-28 mx-auto object-contain rounded" />
              <p className="text-xs text-gray-500">Click to change</p>
            </div>
          ) : (
            <div className="text-gray-400">
              <Upload className="h-8 w-8 mx-auto mb-1" />
              <p className="text-sm">Click to upload image</p>
              <p className="text-xs mt-0.5">PNG, JPG up to 10MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* Preview for URL mode */}
      {mode === 'url' && value && !value.startsWith('data:') && (
        <img src={value} alt="preview" className="mt-2 h-20 object-contain rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}
    </div>
  );
}
