import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ROLE_NAMES } from '../../lib/permissions';
import { resolveApiUrl } from '../../services/api/client';
import { UserRead, usersApi } from '../../services/api/adminApi';
import { useAuth } from '../../store/AuthContext';
import { CheckCircle2, Edit2, ImagePlus, Loader2, Search, UserCheck, UserX, Users as UsersIcon } from 'lucide-react';

type UserRole = 'REPORTER' | 'MAINTENANCE_PERSONNEL' | 'MAINTENANCE_SUPERVISOR' | 'ADMINISTRATOR';
type UserType = 'STUDENT' | 'FACULTY' | 'MAINTENANCE' | 'SUPERVISOR' | 'ADMINISTRATOR';
type FormData = { first_name: string; last_name: string; email: string; role: UserRole; user_type: UserType; department: string; phone: string; is_active: boolean; avatar: File | null };
const initialForm: FormData = { first_name: '', last_name: '', email: '', role: 'REPORTER', user_type: 'STUDENT', department: '', phone: '', is_active: true, avatar: null };
const roleStyles: Record<string, string> = { REPORTER: 'bg-sky-50 text-sky-700 border-sky-200', MAINTENANCE_PERSONNEL: 'bg-emerald-50 text-emerald-700 border-emerald-200', MAINTENANCE_SUPERVISOR: 'bg-indigo-50 text-indigo-700 border-indigo-200', ADMINISTRATOR: 'bg-rose-50 text-rose-700 border-rose-200' };
const defaultUserType = (role: string): UserType => role === 'MAINTENANCE_PERSONNEL' ? 'MAINTENANCE' : role === 'MAINTENANCE_SUPERVISOR' ? 'SUPERVISOR' : role === 'ADMINISTRATOR' ? 'ADMINISTRATOR' : 'STUDENT';
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unable to save user changes.';

const UserAvatar: React.FC<{ user: UserRead }> = ({ user }) => {
  const [failed, setFailed] = useState(false);
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  if (!user.avatar_url || failed) return <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold border border-sky-200">{initials}</div>;
  return <img src={resolveApiUrl(user.avatar_url)} alt={user.first_name} onError={() => setFailed(true)} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" />;
};

export const UsersPage: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [users, setUsers] = useState<UserRead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRead | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await usersApi.list()); } catch (error) { setFeedback({ type: 'error', text: errorMessage(error) }); } finally { setLoading(false); }
  };
  useEffect(() => { void loadUsers(); }, []);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const openEdit = (user: UserRead) => { setEditingUser(user); setFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role as UserRole, user_type: user.user_type as UserType, department: user.department ?? '', phone: user.phone ?? '', is_active: user.is_active, avatar: null }); setFeedback(null); setModalOpen(true); };
  const changeRole = (role: UserRole) => setFormData((current) => ({ ...current, role, user_type: role === 'REPORTER' ? 'STUDENT' : defaultUserType(role) }));
  const showSuccessToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setFeedback({ type: 'success', text: 'User changes saved.' });
    toastTimer.current = setTimeout(() => {
      setFeedback(null);
      toastTimer.current = null;
    }, 3000);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFeedback(null);
    try {
      if (editingUser) {
        const updated = await usersApi.updateManaged(editingUser.id, { first_name: formData.first_name.trim(), last_name: formData.last_name.trim(), phone: formData.phone.trim() || undefined, department: formData.department.trim() || undefined, role: formData.role, user_type: formData.user_type, is_active: formData.is_active });
        if (formData.avatar) await usersApi.uploadManagedAvatar(updated.id, formData.avatar);
      }
      if (editingUser?.id === currentUser.id) await refreshCurrentUser();
      setModalOpen(false); showSuccessToast(); await loadUsers();
    } catch (error) { setFeedback({ type: 'error', text: errorMessage(error) }); } finally { setSaving(false); }
  };

  const toggleStatus = async (user: UserRead) => {
    setFeedback(null);
    try { await usersApi.updateManaged(user.id, { is_active: !user.is_active }); setFeedback({ type: 'success', text: `${user.first_name} ${user.last_name} is now ${user.is_active ? 'inactive' : 'active'}.` }); await loadUsers(); } catch (error) { setFeedback({ type: 'error', text: errorMessage(error) }); }
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row items-center gap-3"><div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, department..." className="input-base pl-9 text-sm" /></div><div className="grid grid-cols-2 gap-2 w-full sm:w-auto"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select-base text-sm"><option value="ALL">All Roles</option><option value="REPORTER">Reporter</option><option value="MAINTENANCE_PERSONNEL">Technician</option><option value="MAINTENANCE_SUPERVISOR">Supervisor</option><option value="ADMINISTRATOR">Administrator</option></select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-base text-sm"><option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div></div>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left border-collapse text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider"><th className="py-2.5 px-3">User Profile</th><th className="py-2.5 px-3">Assigned Role</th><th className="py-2.5 px-3">Affiliation</th><th className="py-2.5 px-3">Department</th><th className="py-2.5 px-3">Account Status</th><th className="py-2.5 px-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="py-10 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-400">No users found matching your filters.</td></tr> : filteredUsers.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="py-2.5 px-3 whitespace-nowrap"><div className="flex items-center gap-3"><UserAvatar user={user} /><div><div className="font-semibold text-slate-800">{user.first_name} {user.last_name}</div><div className="text-xs text-slate-400">{user.email}</div></div></div></td><td className="py-2.5 px-3 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleStyles[user.role] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>{ROLE_NAMES[user.role as keyof typeof ROLE_NAMES] ?? user.role}</span></td><td className="py-2.5 px-3 whitespace-nowrap"><span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">{user.user_type}</span></td><td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{user.department || '—'}</td><td className="py-2.5 px-3 whitespace-nowrap"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />{user.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td><td className="py-2.5 px-3 text-right whitespace-nowrap"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50" title="Edit User"><Edit2 className="w-4 h-4" /></button><button onClick={() => void toggleStatus(user)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${user.is_active ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`} title={user.is_active ? 'Deactivate User' : 'Activate User'}>{user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}</button></div></td></tr>)}</tbody></table></div></div>
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit User Profile"><form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="form-label">First Name</label><input required maxLength={80} value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-base text-sm" /></div><div><label className="form-label">Last Name</label><input required maxLength={80} value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-base text-sm" /></div></div><div><label className="form-label">Institutional Email</label><input type="email" required disabled value={formData.email} className="input-base text-sm disabled:bg-slate-50" /></div><div className="grid grid-cols-2 gap-3"><div><label className="form-label">Assigned Role</label><select value={formData.role} onChange={(e) => changeRole(e.target.value as UserRole)} className="select-base text-sm"><option value="REPORTER">Reporter</option><option value="MAINTENANCE_PERSONNEL">Maintenance Personnel</option><option value="MAINTENANCE_SUPERVISOR">Maintenance Supervisor</option><option value="ADMINISTRATOR">Administrator</option></select></div><div><label className="form-label">Affiliation / User Type</label>{formData.role === 'REPORTER' ? <select required value={reporterAffiliation} onChange={(e) => setFormData({ ...formData, user_type: e.target.value as UserType })} className="select-base text-sm"><option value="">Select affiliation</option><option value="STUDENT">Student</option><option value="FACULTY">Faculty</option></select> : <input value={defaultUserType(formData.role)} disabled readOnly className="input-base text-sm bg-slate-50 text-slate-600" />}<p className="text-[11px] text-slate-400 mt-1">Derived from the assigned role.</p></div></div><div className="grid grid-cols-2 gap-3"><div><label className="form-label">Department / Division</label><input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-base text-sm" /></div><div><label className="form-label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-base text-sm" /></div></div><div><label className="form-label">Profile Photo</label><label className="flex items-center gap-2 input-base text-sm cursor-pointer"><ImagePlus className="w-4 h-4 text-slate-400" />{formData.avatar?.name ?? 'Choose an image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setFormData({ ...formData, avatar: e.target.files?.[0] ?? null })} /></label></div><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /> Account active</label><div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-medium">Cancel</button><button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button></div></form></Modal>
  </div>;
};
