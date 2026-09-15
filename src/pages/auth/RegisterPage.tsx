import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { useAuth } from '../../store/AuthContext';
import { UserCheck, ArrowLeft, Shield, School } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { addUser } = useFacilityCare();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    userType: 'STUDENT' as 'STUDENT' | 'FACULTY',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    addUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: 'REPORTER',
      userType: formData.userType,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    });

    await login(formData.email, formData.password);
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-100/80">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <Link
          to="/login"
          className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
          <School className="w-4 h-4 text-sky-600" /> FixTrack
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Create Reporter Account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Register to report facility concerns, track repair statuses, and verify completed fixes
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="input-base text-sm"
              placeholder="e.g. Jordan"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="input-base text-sm"
              placeholder="e.g. Miller"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Institutional Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="username@school.edu"
            className="input-base text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Campus Affiliation
            </label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
              className="select-base text-sm"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty Member</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-base text-sm"
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Mobile Number (SMS Notifications)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="input-base text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-base text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-4"
        >
          <UserCheck className="w-4 h-4" /> Create Account & Continue
        </button>
      </form>
    </div>
  );
};
