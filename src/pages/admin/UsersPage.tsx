import React, { useState } from 'react';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { User, UserRole, UserType } from '../../types/user';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ROLE_NAMES } from '../../lib/permissions';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Edit2,
  UserCheck,
  UserX,
} from 'lucide-react';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  REPORTER: 'bg-sky-50 text-sky-700 border-sky-200',
  MAINTENANCE_PERSONNEL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MAINTENANCE_SUPERVISOR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ADMINISTRATOR: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus } = useFacilityCare();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'REPORTER' as UserRole,
    userType: 'STUDENT' as UserType,
    department: '',
    phone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // Confirm Dialog state
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'REPORTER',
      userType: 'STUDENT',
      department: 'Computer Science',
      phone: '',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      userType: user.userType,
      department: user.department || '',
      phone: user.phone || '',
      status: user.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser({
        ...formData,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-sky-600" /> User & Role Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional directory of accounts, access tiers, and operational privileges
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Campus User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="input-base pl-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-base text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="REPORTER">Reporter</option>
            <option value="MAINTENANCE_PERSONNEL">Technician</option>
            <option value="MAINTENANCE_SUPERVISOR">Supervisor</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-base text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User Profile</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Affiliation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_BADGE_STYLES[user.role]}`}>
                        {ROLE_NAMES[user.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {user.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {user.department || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmUser(user)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            user.status === 'ACTIVE'
                              ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Add Campus User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-base text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Institutional Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Assigned Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="select-base text-sm"
              >
                <option value="REPORTER">Reporter (Student/Faculty)</option>
                <option value="MAINTENANCE_PERSONNEL">Maintenance Personnel</option>
                <option value="MAINTENANCE_SUPERVISOR">Maintenance Supervisor</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Affiliation</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as UserType })}
                className="select-base text-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty Member</option>
                <option value="STAFF">Staff / Facility Personnel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      {confirmUser && (
        <ConfirmDialog
          isOpen={!!confirmUser}
          onClose={() => setConfirmUser(null)}
          onConfirm={() => {
            toggleUserStatus(confirmUser.id);
            setConfirmUser(null);
          }}
          title={confirmUser.status === 'ACTIVE' ? 'Deactivate User Account' : 'Activate User Account'}
          message={`Are you sure you want to change the status of ${confirmUser.firstName} ${confirmUser.lastName}?`}
          confirmLabel={confirmUser.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          variant={confirmUser.status === 'ACTIVE' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};
