import React from 'react';

interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  required = false,
  children,
  className = '',
  labelClassName = 'form-field-label',
}) => (
  <div className={className}>
    <label id={`${id}-label`} htmlFor={id} className={labelClassName}>
      {label}
      {required && <span aria-hidden="true" className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="form-field-error" role="alert">
        {error}
      </p>
    )}
  </div>
);
