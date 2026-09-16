import React, { useState } from 'react';
import { AlertTriangle, ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import { ConcernPhotoEvidence } from '../../types/concern';
import { Modal } from './Modal';

interface PhotoGalleryProps {
  beforePhotos: string[];
  afterPhotos?: string[];
  photoRecords?: ConcernPhotoEvidence[];
  canDelete?: boolean;
  onDelete?: (photoId: string) => Promise<void>;
  title?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  beforePhotos,
  afterPhotos = [],
  photoRecords = [],
  canDelete = false,
  onDelete,
  title = 'Photo Evidence',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'before' | 'after'>('all');
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [photoPendingDeletion, setPhotoPendingDeletion] = useState<ConcernPhotoEvidence | null>(null);

  const hasBefore = beforePhotos?.length > 0;
  const hasAfter  = afterPhotos?.length > 0;

  const recordForUrl = (url: string) => photoRecords.find((photo) => photo.url === url);

  const handleDelete = (url: string) => {
    const photo = recordForUrl(url);
    if (!photo || !onDelete) return;
    setDeleteError(null);
    setPhotoPendingDeletion(photo);
  };

  const confirmDelete = async () => {
    if (!photoPendingDeletion || !onDelete) return;
    setDeletingPhotoId(photoPendingDeletion.id);
    try {
      await onDelete(photoPendingDeletion.id);
      setPhotoPendingDeletion(null);
    } catch {
      setDeleteError('Photo could not be deleted. Please try again.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

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
      {deleteError && <p className="text-xs text-rose-600">{deleteError}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(activeTab === 'all' || activeTab === 'before') &&
          beforePhotos.map((url, idx) => (
            <div
              key={`before-${idx}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPhoto(url)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedPhoto(url); }}
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
              {canDelete && recordForUrl(url) && (
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleDelete(url); }}
                  disabled={deletingPhotoId === recordForUrl(url)?.id}
                  className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[10px] font-semibold bg-white/90 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  {deletingPhotoId === recordForUrl(url)?.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-900/30 rounded-xl">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
          ))}

        {(activeTab === 'all' || activeTab === 'after') &&
          afterPhotos.map((url, idx) => (
            <div
              key={`after-${idx}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPhoto(url)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedPhoto(url); }}
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
              {canDelete && recordForUrl(url) && (
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); handleDelete(url); }}
                  disabled={deletingPhotoId === recordForUrl(url)?.id}
                  className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[10px] font-semibold bg-white/90 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  {deletingPhotoId === recordForUrl(url)?.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-900/30 rounded-xl">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
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

      <Modal
        isOpen={photoPendingDeletion !== null}
        onClose={() => { if (!deletingPhotoId) setPhotoPendingDeletion(null); }}
        title="Delete Photo"
        size="sm"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setPhotoPendingDeletion(null)}
              disabled={deletingPhotoId !== null}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deletingPhotoId !== null}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {deletingPhotoId !== null ? 'Deleting...' : 'Delete Photo'}
            </button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Are you sure you want to delete this photo?</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">This evidence will be permanently removed from this concern and cannot be recovered.</p>
            </div>
          </div>
          {photoPendingDeletion && (
            <img
              src={photoPendingDeletion.url}
              alt="Photo selected for deletion"
              className="w-full aspect-video object-cover rounded-xl border border-slate-200 bg-slate-100"
            />
          )}
          {deleteError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">{deleteError}</p>}
        </div>
      </Modal>
    </div>
  );
};
