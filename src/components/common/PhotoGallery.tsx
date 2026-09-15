import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';

interface PhotoGalleryProps {
  beforePhotos: string[];
  afterPhotos?: string[];
  title?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  beforePhotos,
  afterPhotos = [],
  title = 'Photo Evidence',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'before' | 'after'>('all');

  const hasBefore = beforePhotos?.length > 0;
  const hasAfter  = afterPhotos?.length > 0;

  if (!hasBefore && !hasAfter) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 bg-slate-50 rounded-2xl border border-slate-200">
        <ImageIcon className="w-7 h-7 text-slate-300" />
        <p className="text-sm text-slate-400">No photos attached to this report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        {hasAfter && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
            {(
              [
                { id: 'all' as const, label: 'All', count: beforePhotos.length + afterPhotos.length },
                { id: 'before' as const, label: 'Before', count: beforePhotos.length },
                { id: 'after' as const, label: 'After', count: afterPhotos.length },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label} <span className="opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(activeTab === 'all' || activeTab === 'before') &&
          beforePhotos.map((url, idx) => (
            <button
              key={`before-${idx}`}
              onClick={() => setSelectedPhoto(url)}
              className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-slate-200 bg-slate-100 hover:shadow-md transition-all"
            >
              <img
                src={url}
                alt={`Before ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Before
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-900/30 rounded-xl">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </button>
          ))}

        {(activeTab === 'all' || activeTab === 'after') &&
          afterPhotos.map((url, idx) => (
            <button
              key={`after-${idx}`}
              onClick={() => setSelectedPhoto(url)}
              className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-slate-200 bg-slate-100 hover:shadow-md transition-all"
            >
              <img
                src={url}
                alt={`After ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                After
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-900/30 rounded-xl">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </button>
          ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedPhoto}
            alt="Enlarged photo"
            className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
