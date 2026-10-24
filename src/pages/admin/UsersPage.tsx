import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ROLE_NAMES } from '../../lib/permissions';
import { ApiError, resolveApiUrl } from '../../services/api/client';
import { UserRead, usersApi } from '../../services/api/adminApi';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { getPersonnelAvailability, PersonnelAvailability } from '../../lib/personnelAvailability';
import { FormField } from '../../components/forms/FormField';
import {
  clearResolvedFieldError,
  fileTypeField,
  mapApiError,
  requiredField,
  validateFields,
  type FieldErrors,
} from '../../lib/formValidation';
import { CheckCircle2, Edit2, ImagePlus, Loader2, Search, Trash2, UserCheck, UserX, Users as UsersIcon } from 'lucide-react';

type UserRole = 'REPORTER' | 'MAINTENANCE_PERSONNEL' | 'MAINTENANCE_SUPERVISOR' | 'ADMINISTRATOR';
type UserType = 'STUDENT' | 'FACULTY' | 'MAINTENANCE' | 'SUPERVISOR' | 'ADMINISTRATOR';
type FormData = { first_name: string; last_name: string; email: string; role: UserRole; user_type: UserType; department: string; phone: string; is_active: boolean; avatar: File | null };
const initialForm: FormData = { first_name: '', last_name: '', email: '', role: 'REPORTER', user_type: 'STUDENT', department: '', phone: '', is_active: true, avatar: null };
const roleStyles: Record<string, string> = { REPORTER: 'bg-sky-50 text-sky-700 border-sky-200', MAINTENANCE_PERSONNEL: 'bg-emerald-50 text-emerald-700 border-emerald-200', MAINTENANCE_SUPERVISOR: 'bg-indigo-50 text-indigo-700 border-indigo-200', ADMINISTRATOR: 'bg-rose-50 text-rose-700 border-rose-200' };
const availabilityStyles: Record<PersonnelAvailability, string> = {
  'NOT AVAILABLE': 'bg-slate-50 text-slate-600 border-slate-200',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BUSY: 'bg-amber-50 text-amber-700 border-amber-200',
};
const onlineStyles = {
  ONLINE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OFFLINE: 'bg-slate-50 text-slate-600 border-slate-200',
};
const defaultUserType = (role: string): UserType => role === 'MAINTENANCE_PERSONNEL' ? 'MAINTENANCE' : role === 'MAINTENANCE_SUPERVISOR' ? 'SUPERVISOR' : role === 'ADMINISTRATOR' ? 'ADMINISTRATOR' : 'STUDENT';
const ADMIN_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const errorMessage = (error: unknown) =>
  mapApiError(error, 'Unable to load user information. Please try again.').generalMessage ??
  'Unable to load user information. Please try again.';
const UserAvatar: React.FC<{ user: UserRead }> = ({ user }) => {
  const [failed, setFailed] = useState(false);
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  if (!user.avatar_url || failed) return <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold border border-sky-200">{initials}</div>;
  return <img src={resolveApiUrl(user.avatar_url)} alt={user.first_name} onError={() => setFailed(true)} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" />;
};

export const UsersPage: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const { concerns, updateUser } = useFacilityCare();
  const [users, setUsers] = useState<UserRead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRead | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await usersApi.list());
    } catch (error) {
      setFeedback({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    const refreshUsers = () => {
      void usersApi.list().then((nextUsers) => {
        if (active) setUsers(nextUsers);
      }).catch((error: unknown) => {
        if (active) setFeedback({ type: 'error', text: errorMessage(error) });
      }).finally(() => {
        if (active) setLoading(false);
      });
    };
    refreshUsers();
    const interval = window.setInterval(refreshUsers, 15_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const openEdit = (user: UserRead) => { setEditingUser(user); setFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role as UserRole, user_type: user.user_type as UserType, department: user.department ?? '', phone: user.phone ?? '', is_active: user.is_active, avatar: null }); setFieldErrors({}); setFeedback(null); setModalOpen(true); };
  const changeRole = (role: UserRole) => {
    setFormData((current) => ({ ...current, role, user_type: role === 'REPORTER' ? 'STUDENT' : defaultUserType(role) }));
    setFieldErrors((errors) => {
      const next = { ...errors };
      delete next.userType;
      return next;
    });
  };
  const showSuccessToast = (message = 'User changes saved.') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setFeedback({ type: 'success', text: message });
    toastTimer.current = setTimeout(() => {
      setFeedback(null);
      toastTimer.current = null;
    }, 3000);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    const validators = {
      firstName: requiredField('First name'),
      lastName: requiredField('Last name'),
      ...(formData.role === 'REPORTER' ? { userType: requiredField('Affiliation') } : {}),
    };
    const errors = validateFields({
      firstName: formData.first_name,
      lastName: formData.last_name,
      userType: reporterAffiliation,
    }, validators);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || fieldErrors.avatar) return;
    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          firstName: formData.first_name.trim(),
          lastName: formData.last_name.trim(),
          phone: formData.phone.trim() || undefined,
          department: formData.department.trim() || undefined,
          role: formData.role,
          userType: formData.user_type,
          status: formData.is_active ? 'ACTIVE' : 'INACTIVE',
        });
        if (formData.avatar) await usersApi.uploadManagedAvatar(editingUser.id, formData.avatar);
      }
      if (editingUser?.id === currentUser.id) await refreshCurrentUser();
      setModalOpen(false); showSuccessToast();
      await loadUsers();
    } catch (error) {
      const feedback = mapApiError(
        error,
        'Unable to save user changes. Please try again.',
        {
          knownFields: ['firstName', 'lastName', 'userType', 'department', 'phone', 'avatar'],
          aliases: { file: 'avatar', avatar_file: 'avatar' },
        },
      );
      setFieldErrors(feedback.fieldErrors);
      if (feedback.generalMessage) setFeedback({ type: 'error', text: feedback.generalMessage });
    } finally { setSaving(false); }
  };

  const toggleStatus = async (user: UserRead) => {
    setFeedback(null);
    try { await updateUser(user.id, { status: user.is_active ? 'INACTIVE' : 'ACTIVE' }); setFeedback({ type: 'success', text: `${user.first_name} ${user.last_name} is now ${user.is_active ? 'inactive' : 'active'}.` }); await loadUsers(); } catch (error) { setFeedback({ type: 'error', text: errorMessage(error) }); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const target = deleteTarget;
    setDeleting(true);
    setDeleteError(null);
    try {
      await usersApi.permanentlyDelete(target.id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== target.id));
      setDeleteTarget(null);
      showSuccessToast(`Account for ${target.first_name} ${target.last_name} was permanently deleted.`);
    } catch (error) {
      const mappedError = mapApiError(
        error,
        'Unable to permanently delete this account. Please try again.',
      );
      const message = error instanceof ApiError && error.status >= 400 && error.status < 500 &&
        typeof error.detail === 'string'
        ? error.detail
        : mappedError.generalMessage ??
          'Unable to permanently delete this account. Please try again.';
      setDeleteError(message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return `${user.first_name} ${user.last_name} ${user.email} ${user.department ?? ''}`.toLowerCase().includes(query) && (roleFilter === 'ALL' || user.role === roleFilter) && (statusFilter === 'ALL' || (user.is_active ? 'ACTIVE' : 'INACTIVE') === statusFilter);
  });
  const reporterAffiliation = formData.user_type === 'FACULTY' ? 'FACULTY' : formData.user_type === 'STUDENT' ? 'STUDENT' : '';

  return <div className="space-y-3">
    <div className="flex flex-col sm:items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><UsersIcon className="w-6 h-6 text-sky-600" /> User & Role Directory</h1><p className="text-sm text-slate-500 mt-0.5">Manage campus accounts, access tiers, and institutional details</p></div></div>
    {feedback?.type === 'error' && <div className="p-3 rounded-xl border text-sm flex items-center gap-2 bg-rose-50 border-rose-200 text-rose-700">{feedback.text}</div>}
    {feedback?.type === 'success' && <div className="fixed top-5 right-5 z-50 max-w-[calc(100vw-2.5rem)] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg" role="status"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" />{feedback.text}</span></div>}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row items-center gap-3"><div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, department..." className="search-input text-sm" /></div><div className="grid grid-cols-2 gap-2 w-full sm:w-auto"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select-base text-sm"><option value="ALL">All Roles</option><option value="REPORTER">Reporter</option><option value="MAINTENANCE_PERSONNEL">Technician</option><option value="MAINTENANCE_SUPERVISOR">Supervisor</option><option value="ADMINISTRATOR">Administrator</option></select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-base text-sm"><option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div></div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">User Profile</th>
              <th className="py-2.5 px-3">Assigned Role</th>
              <th className="py-2.5 px-3">Affiliation</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Account Status</th>
              <th className="py-2.5 px-3">Online Status</th>
              <th className="py-2.5 px-3">Personnel Availability</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-slate-400">No users found matching your filters.</td></tr>
            ) : filteredUsers.map((user) => {
              const isMaintenancePersonnel = user.role === 'MAINTENANCE_PERSONNEL';
              const availability = isMaintenancePersonnel
                ? getPersonnelAvailability(user.id, user.is_online, concerns)
                : null;
              const onlineStatus = user.is_online && user.is_active ? 'ONLINE' : 'OFFLINE';

              return (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <div className="font-semibold text-slate-800">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleStyles[user.role] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {ROLE_NAMES[user.role as keyof typeof ROLE_NAMES] ?? user.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">{user.user_type}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{user.department || '—'}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${onlineStyles[onlineStatus]}`}>
                      {onlineStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {availability ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${availabilityStyles[availability]}`}>
                        {availability}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50" title="Edit User">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => void toggleStatus(user)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${user.is_active ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`} title={user.is_active ? 'Deactivate User' : 'Activate User'}>
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      {currentUser.role === 'ADMINISTRATOR' && user.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => { setFeedback(null); setDeleteError(null); setDeleteTarget(user); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Permanently delete account"
                          aria-label={`Permanently delete account for ${user.first_name} ${user.last_name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit User Profile">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="user-first-name" label="First Name" error={fieldErrors.firstName} required>
            <input
              id="user-first-name"
              maxLength={80}
              value={formData.first_name}
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'user-first-name-error' : undefined}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, first_name: value });
                setFieldErrors((errors) => clearResolvedFieldError(errors, 'firstName', value, requiredField('First name')));
              }}
              className="input-base text-sm"
            />
          </FormField>
          <FormField id="user-last-name" label="Last Name" error={fieldErrors.lastName} required>
            <input
              id="user-last-name"
              maxLength={80}
              value={formData.last_name}
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'user-last-name-error' : undefined}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, last_name: value });
                setFieldErrors((errors) => clearResolvedFieldError(errors, 'lastName', value, requiredField('Last name')));
              }}
              className="input-base text-sm"
            />
          </FormField>
        </div>
        <FormField id="user-email" label="Institutional Email">
          <input id="user-email" type="email" disabled value={formData.email} className="input-base text-sm disabled:bg-slate-50" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="user-role" label="Assigned Role">
            <select id="user-role" value={formData.role} onChange={(e) => changeRole(e.target.value as UserRole)} className="select-base text-sm">
              <option value="REPORTER">Reporter</option>
              <option value="MAINTENANCE_PERSONNEL">Maintenance Personnel</option>
              <option value="MAINTENANCE_SUPERVISOR">Maintenance Supervisor</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </FormField>
          <FormField id="user-affiliation" label="Affiliation / User Type" error={fieldErrors.userType} required={formData.role === 'REPORTER'}>
            {formData.role === 'REPORTER' ? (
              <select
                id="user-affiliation"
                value={reporterAffiliation}
                aria-invalid={Boolean(fieldErrors.userType)}
                aria-describedby={fieldErrors.userType ? 'user-affiliation-error' : undefined}
                onChange={(e) => {
                  const userType = e.target.value as UserType;
                  setFormData({ ...formData, user_type: userType });
                  setFieldErrors((errors) => clearResolvedFieldError(errors, 'userType', userType, requiredField('Affiliation')));
                }}
                className="select-base text-sm"
              >
                <option value="">Select affiliation</option>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            ) : (
              <input id="user-affiliation" value={defaultUserType(formData.role)} disabled readOnly className="input-base text-sm bg-slate-50 text-slate-600" />
            )}
            <p className="text-[11px] text-slate-400 mt-1">Derived from the assigned role.</p>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="user-department" label="Department / Division" error={fieldErrors.department}>
            <input id="user-department" value={formData.department} onChange={(e) => { setFormData({ ...formData, department: e.target.value }); setFieldErrors((errors) => { const next = { ...errors }; delete next.department; return next; }); }} aria-invalid={Boolean(fieldErrors.department)} aria-describedby={fieldErrors.department ? 'user-department-error' : undefined} className="input-base text-sm" />
          </FormField>
          <FormField id="user-phone" label="Phone" error={fieldErrors.phone}>
            <input id="user-phone" type="tel" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFieldErrors((errors) => { const next = { ...errors }; delete next.phone; return next; }); }} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'user-phone-error' : undefined} className="input-base text-sm" />
          </FormField>
        </div>
        <FormField id="user-avatar" label="Profile Photo" error={fieldErrors.avatar}>
          <label htmlFor="user-avatar" className="flex items-center gap-2 input-base text-sm cursor-pointer">
            <ImagePlus className="w-4 h-4 text-slate-400" />{formData.avatar?.name ?? 'Choose an image'}
          </label>
          <input
            id="user-avatar"
            type="file"
            accept={ADMIN_IMAGE_TYPES.join(',')}
            className="hidden"
            aria-invalid={Boolean(fieldErrors.avatar)}
            aria-describedby={fieldErrors.avatar ? 'user-avatar-error' : undefined}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                const fileError = fileTypeField(file, ADMIN_IMAGE_TYPES, 'Profile photo');
                if (fileError) {
                  setFormData({ ...formData, avatar: null });
                  setFieldErrors((errors) => ({ ...errors, avatar: fileError }));
                  e.target.value = '';
                  return;
                }
              }
              setFormData({ ...formData, avatar: file });
              setFieldErrors((errors) => {
                const next = { ...errors };
                delete next.avatar;
                return next;
              });
            }}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /> Account active
        </label>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-medium">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
    <Modal
      isOpen={deleteTarget !== null}
      onClose={() => {
        if (!deleting) setDeleteTarget(null);
      }}
      title="Permanently Delete Account"
      size="md"
      footer={
        <>
          <button
            type="button"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void confirmDelete()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" />Deleting...</> : 'Permanently Delete'}
          </button>
        </>
      }
    >
      {deleteTarget && (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Permanently delete <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong> ({deleteTarget.email})?
          </p>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 space-y-1">
            <p className="font-semibold">This is irreversible and different from deactivation.</p>
            <p>
              Related concerns, assignments, reports, evidence, and timeline history will be retained;
              links to this account may be cleared. Accounts with notifications or other protected
              references cannot be deleted. No related business records will be cascade-deleted.
            </p>
          </div>
          {deleteError && (
            <p role="alert" className="text-sm text-rose-700">{deleteError}</p>
          )}
        </div>
      )}
    </Modal>
  </div>;
};
