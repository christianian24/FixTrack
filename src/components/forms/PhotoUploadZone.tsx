import React, { useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';

interface PhotoUploadZoneProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  photos,
  onChange,
  maxPhotos = 4,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxPhotos - photos.length;
    const toAdd = Math.min(files.length, remaining);

    Array.from(files).slice(0, toAdd).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...photos, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const canAdd = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-100">
            <ImagePlus className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Click or drag photos here</p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WEBP — {photos.length} of {maxPhotos} uploaded
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-video rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-slate-400 hover:text-sky-500"
            >
              <Upload className="w-4 h-4" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
