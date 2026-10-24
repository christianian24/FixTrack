import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArchiveRestore, Eye, Search, Trash2 } from 'lucide-react';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/Badge';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { ArchivedConcernRead, ConcernApiStatus } from '../../services/api/concernsApi';
import { resolveApiUrl } from '../../services/api/client';
import { ConcernStatus } from '../../types/concern';
import { mapApiError } from '../../lib/formValidation';

type PendingAction = {
  type: 'restore' | 'delete';
  concern: ArchivedConcernRead;
};

const DISPLAY_STATUS: Record<ConcernApiStatus, ConcernStatus> = {
  SUBMITTED: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_MATERIALS: 'WAITING_FOR_MATERIALS',
  COMPLETED: 'COMPLETED',
  VERIFIED: 'VERIFIED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
};

export const ArchivedConcernsPage: React.FC = () => {
  const {
    getArchivedConcerns,
    restoreConcern,
    permanentlyDeleteConcern,
  } = useFacilityCare();
  const [concerns, setConcerns] = useState<ArchivedConcernRead[]>([]);
  const [selectedConcern, setSelectedConcern] = useState<ArchivedConcernRead | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getArchivedConcerns()
      .then((records) => {
        if (!cancelled) setConcerns(records);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            mapApiError(loadError, 'Unable to load archived concerns. Please try again.', {
              knownFields: [],
            }).generalMessage,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getArchivedConcerns]);

  const filteredConcerns = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return concerns;
    return concerns.filter((concern) =>
      [
        concern.tracking_number,
        concern.title,
        concern.description,
        concern.reporter_name,
        concern.category_name,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [concerns, search]);

  const handleAction = async () => {
    if (!pendingAction) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      if (pendingAction.type === 'restore') {
        await restoreConcern(pendingAction.concern.id);
        setSuccess(`${pendingAction.concern.tracking_number} was restored to active concerns.`);
      } else {
        await permanentlyDeleteConcern(pendingAction.concern.id);
        setSuccess(`${pendingAction.concern.tracking_number} was permanently deleted.`);
      }
      setConcerns((previous) =>
        previous.filter((concern) => concern.id !== pendingAction.concern.id),
      );
      if (selectedConcern?.id === pendingAction.concern.id) setSelectedConcern(null);
      setPendingAction(null);
    } catch (actionError) {
      setError(
        mapApiError(actionError, 'The requested action failed. Please try again.', {
          knownFields: [],
        }).generalMessage,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <Link to="/concerns" className="text-sm text-slate-500 hover:text-slate-700">
            Back to Active Concerns
          </Link>
          <h1 className="text-xl font-bold text-slate-800 mt-1">Archived Concerns</h1>
          <p className="text-sm text-slate-500 mt-1">
            Archived records are retained until restored or permanently deleted.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, concern, or reporter"
            className="search-input w-full pl-9"
            aria-label="Search archived concerns"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          {success}
        </p>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading archived concerns…</div>
      ) : filteredConcerns.length === 0 ? (
        <EmptyState
          icon={ArchiveRestore}
          title={concerns.length ? 'No archived concerns match your search' : 'No archived concerns'}
          description={concerns.length ? 'Try a different search term.' : 'Archived concerns will appear here.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[1050px] table-fixed text-left border-collapse text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[24%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Concern</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Reported</th>
                  <th className="py-3 px-4">Archived Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConcerns.map((concern) => (
                  <tr key={concern.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap overflow-hidden">
                      {concern.tracking_number}
                    </td>
                    <td className="py-3 px-4 min-w-0 overflow-hidden">
                      <p
                        className="truncate font-semibold text-slate-800"
                        title={concern.title}
                      >
                        {concern.title}
                      </p>
                      <p className="truncate text-xs text-slate-500" title={concern.building_name ?? 'Unknown building'}>
                        {concern.building_name ?? 'Unknown building'}
                      </p>
                    </td>
                    <td className="py-3 px-3 truncate" title={concern.reporter_name ?? 'Unknown reporter'}>
                      {concern.reporter_name ?? 'Unknown reporter'}
                    </td>
                    <td className="py-3 px-2 truncate" title={concern.category_name ?? 'Uncategorized'}>
                      {concern.category_name ?? 'Uncategorized'}
                    </td>
                    <td
                      className="py-3 px-2 whitespace-nowrap overflow-hidden"
                      title={DISPLAY_STATUS[concern.status].replaceAll('_', ' ')}
                    >
                      <StatusBadge status={DISPLAY_STATUS[concern.status]} size="sm" showDot={false} />
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap overflow-hidden text-slate-600">
                      {new Date(concern.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap overflow-hidden text-slate-600">
                      {new Date(concern.deleted_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 overflow-hidden">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedConcern(concern)}
                          className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50"
                          title="View archived concern"
                          aria-label={`View ${concern.tracking_number}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPendingAction({ type: 'restore', concern })}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                          title="Restore concern"
                          aria-label={`Restore ${concern.tracking_number}`}
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPendingAction({ type: 'delete', concern })}
                          className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50"
                          title="Permanently delete concern"
                          aria-label={`Permanently delete ${concern.tracking_number}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedConcern}
        onClose={() => setSelectedConcern(null)}
        title={selectedConcern ? `Archived Concern · ${selectedConcern.tracking_number}` : 'Archived Concern'}
        size="xl"
      >
        {selectedConcern && (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-slate-800">{selectedConcern.title}</h2>
                <StatusBadge status={DISPLAY_STATUS[selectedConcern.status]} />
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line [overflow-wrap:anywhere]">
                {selectedConcern.description}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p><span className="text-slate-500">Reporter:</span> {selectedConcern.reporter_name ?? 'Unknown reporter'}</p>
              <p><span className="text-slate-500">Assigned personnel:</span> {selectedConcern.assigned_to_name ?? 'Unassigned'}</p>
              <p><span className="text-slate-500">Category:</span> {selectedConcern.category_name ?? 'Uncategorized'}</p>
              <p><span className="text-slate-500">Location:</span> {[selectedConcern.building_name, selectedConcern.room_name].filter(Boolean).join(' · ') || selectedConcern.other_location || 'Unknown'}</p>
              <p><span className="text-slate-500">Reported:</span> {new Date(selectedConcern.submitted_at).toLocaleString()}</p>
              <p><span className="text-slate-500">Archived:</span> {new Date(selectedConcern.deleted_at).toLocaleString()}</p>
            </div>
            {selectedConcern.resolution_notes && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Resolution notes</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{selectedConcern.resolution_notes}</p>
              </div>
            )}
            {selectedConcern.rejection_reason && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Rejection reason</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">{selectedConcern.rejection_reason}</p>
              </div>
            )}
            {!!selectedConcern.photos?.length && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Photo evidence</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedConcern.photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={resolveApiUrl(photo.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-sky-700 underline"
                    >
                      {photo.filename || 'View evidence'}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {!!selectedConcern.timeline_events?.length && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">History</h3>
                <ol className="space-y-2 border-l border-slate-200 pl-4">
                  {selectedConcern.timeline_events.map((event) => (
                    <li key={event.id} className="text-sm">
                      <p className="font-medium text-slate-700">{event.event_type.replaceAll('_', ' ')}</p>
                      {event.note && <p className="text-slate-500">{event.note}</p>}
                      <p className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void handleAction()}
        title={pendingAction?.type === 'restore' ? 'Restore Concern?' : 'Permanently Delete Concern?'}
        message={
          pendingAction?.type === 'restore'
            ? 'This concern will be returned to the active concerns list.'
            : 'This will permanently delete this concern and its associated records. This action cannot be undone.'
        }
        confirmLabel={
          pendingAction?.type === 'restore'
            ? 'Restore'
            : submitting
              ? 'Deleting…'
              : 'Permanently Delete'
        }
        variant={pendingAction?.type === 'restore' ? 'primary' : 'danger'}
      />
    </div>
  );
};
