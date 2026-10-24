import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { FormField } from '../../components/forms/FormField';
import {
  clearResolvedFieldError,
  emailField,
  mapApiError,
  matchingField,
  requiredField,
  validateFields,
  type FieldErrors,
  type FieldValidators,
} from '../../lib/formValidation';
import { UserCheck, ArrowLeft, Shield, School } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const validators: FieldValidators = {
    firstName: requiredField('First name'),
    lastName: requiredField('Last name'),
    email: emailField,
    userType: requiredField('Campus affiliation'),
    password: requiredField('Password'),
    confirmPassword: (value, values) =>
      requiredField('Confirm password')(value, values) ??
      matchingField(value, values, 'password', 'Passwords'),
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    const nextFormData = { ...formData, [field]: value };
    setFormData(nextFormData);
    setFieldErrors((current) => {
      let nextErrors = clearResolvedFieldError(
        current,
        field,
        value,
        validators[field] ?? (() => null),
        nextFormData,
      );
      if (field === 'password') {
        nextErrors = clearResolvedFieldError(
          nextErrors,
          'confirmPassword',
          nextFormData.confirmPassword,
          validators.confirmPassword,
          nextFormData,
        );
      }
      return nextErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationErrors = validateFields(formData, validators);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'REPORTER',
        user_type: formData.userType,
        department: formData.department,
        phone: formData.phone,
      });

      navigate('/dashboard');
    } catch (registrationError) {
      const feedback = mapApiError(
        registrationError,
        "We couldn't create your account. Please try again.",
        {
          knownFields: ['firstName', 'lastName', 'email', 'userType', 'password', 'confirmPassword'],
        },
      );
      setFieldErrors(feedback.fieldErrors);
      setError(feedback.generalMessage);
    }
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
        <div role="alert" className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="registration-first-name" label="First Name" error={fieldErrors.firstName} required>
            <input
              id="registration-first-name"
              type="text"
              aria-invalid={Boolean(fieldErrors.firstName)}
              aria-describedby={fieldErrors.firstName ? 'registration-first-name-error' : undefined}
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className="input-base text-sm"
              placeholder="e.g. Jordan"
            />
          </FormField>
          <FormField id="registration-last-name" label="Last Name" error={fieldErrors.lastName} required>
            <input
              id="registration-last-name"
              type="text"
              aria-invalid={Boolean(fieldErrors.lastName)}
              aria-describedby={fieldErrors.lastName ? 'registration-last-name-error' : undefined}
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="input-base text-sm"
              placeholder="e.g. Miller"
            />
          </FormField>
        </div>

        <FormField id="registration-email" label="Institutional Email Address" error={fieldErrors.email} required>
          <input
            id="registration-email"
            type="email"
            value={formData.email}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'registration-email-error' : undefined}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="username@school.edu"
            className="input-base text-sm"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="registration-user-type" label="Campus Affiliation" error={fieldErrors.userType} required>
            <select
              id="registration-user-type"
              value={formData.userType}
              aria-invalid={Boolean(fieldErrors.userType)}
              aria-describedby={fieldErrors.userType ? 'registration-user-type-error' : undefined}
              onChange={(e) => updateField('userType', e.target.value)}
              className="select-base text-sm"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty Member</option>
            </select>
          </FormField>
          <FormField id="registration-department" label="Department">
            <input
              id="registration-department"
              type="text"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className="input-base text-sm"
              placeholder="e.g. Computer Science"
            />
          </FormField>
        </div>

        <FormField id="registration-phone" label="Mobile Number (SMS Notifications)">
          <input
            id="registration-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="input-base text-sm"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="registration-password" label="Password" error={fieldErrors.password} required>
            <input
              id="registration-password"
              type="password"
              value={formData.password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'registration-password-error' : undefined}
              onChange={(e) => updateField('password', e.target.value)}
              className="input-base text-sm"
            />
          </FormField>
          <FormField id="registration-confirm-password" label="Confirm Password" error={fieldErrors.confirmPassword} required>
            <input
              id="registration-confirm-password"
              type="password"
              value={formData.confirmPassword}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? 'registration-confirm-password-error' : undefined}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="input-base text-sm"
            />
          </FormField>
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
