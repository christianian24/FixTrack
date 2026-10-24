import { ApiError } from '../services/api/apiError.ts';

export type FieldValidator = (
  value: unknown,
  values: Readonly<Record<string, unknown>>,
) => string | null;

export type FieldValidators = Record<string, FieldValidator>;
export type FieldErrors = Record<string, string>;

export interface ApiErrorFeedback {
  fieldErrors: FieldErrors;
  generalMessage: string | null;
}

export interface ApiErrorFieldOptions {
  knownFields?: readonly string[];
  aliases?: Record<string, string>;
}

export function requiredField(label: string): FieldValidator {
  return (value) =>
    value === null || value === undefined || String(value).trim() === ''
      ? `${label} is required.`
      : null;
}

export function emailField(value: unknown): string | null {
  const email = typeof value === 'string' ? value.trim() : '';
  if (!email) return 'Email address is required.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : 'Please enter a valid email address.';
}

export function numberField(
  value: unknown,
  label: string,
  minimum?: number,
  maximum?: number,
): string | null {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required.`;
  }
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return `Enter a valid ${label.toLowerCase()}.`;
  if (minimum !== undefined && number < minimum) {
    return `${label} must be at least ${minimum}.`;
  }
  if (maximum !== undefined && number > maximum) {
    return `${label} must be no more than ${maximum}.`;
  }
  return null;
}

export function fileTypeField(
  value: unknown,
  acceptedTypes: readonly string[],
  label: string,
): string | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return `Choose a supported ${label.toLowerCase()} format.`;
  }
  return acceptedTypes.includes(String(value.type))
    ? null
    : `Choose a supported ${label.toLowerCase()} format.`;
}

export function isImageFile(file: Pick<File, 'type'>): boolean {
  return file.type.startsWith('image/');
}

export function minimumLengthField(
  value: unknown,
  label: string,
  minimum: number,
): string | null {
  return typeof value === 'string' && value.trim().length >= minimum
    ? null
    : `${label} must be at least ${minimum} characters.`;
}

export function matchingField(
  value: unknown,
  values: Readonly<Record<string, unknown>>,
  otherField: string,
  label: string,
): string | null {
  return value === values[otherField] ? null : `${label} do not match.`;
}

export function validateFields(
  values: Readonly<Record<string, unknown>>,
  validators: FieldValidators,
): FieldErrors {
  const errors: FieldErrors = {};
  Object.entries(validators).forEach(([field, validator]) => {
    const error = validator(values[field], values);
    if (error) errors[field] = error;
  });
  return errors;
}

export function clearResolvedFieldError(
  errors: FieldErrors,
  field: string,
  value: unknown,
  validator: FieldValidator,
  values: Readonly<Record<string, unknown>> = { [field]: value },
): FieldErrors {
  if (!errors[field] || validator(value, values)) return errors;
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

const toFieldName = (backendField: string): string =>
  backendField.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const getValidationMessage = (field: string, type: string): string => {
  if (type === 'missing' || type.includes('required')) {
    return `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required.`;
  }
  if (field.toLowerCase().includes('email')) {
    return 'Please enter a valid email address.';
  }
  if (type.includes('parsing') || type.includes('number') || type.includes('integer')) {
    return 'Enter a valid number.';
  }
  if (type.includes('too_short')) return 'Please enter more information.';
  if (type.includes('too_long')) return 'This value is too long.';
  return 'Please check this field and try again.';
};

export function mapApiError(
  error: unknown,
  fallback = 'The request could not be completed. Please try again.',
  options: ApiErrorFieldOptions = {},
): ApiErrorFeedback {
  if (!(error instanceof ApiError)) {
    return {
      fieldErrors: {},
      generalMessage:
        error instanceof TypeError
          ? 'Unable to connect. Check your connection and try again.'
          : fallback,
    };
  }

  if (error.status !== 422 || !Array.isArray(error.detail)) {
    return {
      fieldErrors: {},
      generalMessage:
        error.status === 409
          ? 'This information conflicts with an existing record. Please review it and try again.'
          : fallback,
    };
  }

  const fieldErrors: FieldErrors = {};
  let hasUnmappedError = false;
  error.detail.forEach((detail) => {
    if (!detail || typeof detail !== 'object') {
      hasUnmappedError = true;
      return;
    }
    const item = detail as { loc?: unknown; type?: unknown; ctx?: unknown };
    const location = Array.isArray(item.loc) ? item.loc : [];
    const backendField = [...location].reverse().find((part) => typeof part === 'string');
    if (typeof backendField !== 'string' || backendField === 'body') {
      hasUnmappedError = true;
      return;
    }
    const field = options.aliases?.[backendField] ?? toFieldName(backendField);
    if (options.knownFields && !options.knownFields.includes(field)) {
      hasUnmappedError = true;
      return;
    }
    const type = typeof item.type === 'string' ? item.type : '';
    const context = item.ctx && typeof item.ctx === 'object'
      ? item.ctx as { min_length?: unknown }
      : undefined;
    fieldErrors[field] ??=
      type.includes('too_short') &&
      typeof context?.min_length === 'number' &&
      context.min_length > 0
        ? `Please enter at least ${context.min_length} characters.`
        : getValidationMessage(field, type);
  });

  return Object.keys(fieldErrors).length > 0
    ? {
        fieldErrors,
        generalMessage: hasUnmappedError
          ? 'Please review the remaining information and try again.'
          : null,
      }
    : {
        fieldErrors: {},
        generalMessage: 'Please check the highlighted fields and try again.',
      };
}
