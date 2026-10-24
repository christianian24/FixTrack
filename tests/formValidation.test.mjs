import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from '../src/services/api/apiError.ts';
import {
  clearResolvedFieldError,
  emailField,
  fileTypeField,
  isImageFile,
  mapApiError,
  matchingField,
  numberField,
  requiredField,
  validateFields,
} from '../src/lib/formValidation.ts';

test('required, email, number, and confirmation validators return field messages', () => {
  assert.equal(requiredField('Name')('  ', {}), 'Name is required.');
  assert.equal(emailField('person@a'), 'Please enter a valid email address.');
  assert.equal(numberField('not-a-number', 'Floor'), 'Enter a valid floor.');
  assert.equal(matchingField('different', { password: 'secret' }, 'password', 'Passwords'), 'Passwords do not match.');
});

test('file type validators share supported image-format rules', () => {
  assert.equal(fileTypeField(null, ['image/png'], 'Profile photo'), null);
  assert.equal(fileTypeField({ type: 'image/png' }, ['image/png'], 'Profile photo'), null);
  assert.equal(fileTypeField({ type: 'text/plain' }, ['image/png'], 'Profile photo'), 'Choose a supported profile photo format.');
  assert.equal(isImageFile({ type: 'image/webp' }), true);
  assert.equal(isImageFile({ type: 'application/pdf' }), false);
});

test('valid form values produce no errors and invalid values identify fields', () => {
  const validators = {
    email: (value) => emailField(value),
    name: requiredField('Name'),
  };

  assert.deepEqual(validateFields({ email: 'person@school.edu', name: 'Sam' }, validators), {});
  assert.deepEqual(validateFields({ email: 'person@a', name: '' }, validators), {
    email: 'Please enter a valid email address.',
    name: 'Name is required.',
  });
});

test('resolved field errors clear but invalid values keep their error', () => {
  const validator = (value) => emailField(value);
  const errors = { email: 'Please enter a valid email address.' };
  assert.deepEqual(clearResolvedFieldError(errors, 'email', 'person@a', validator), errors);
  assert.deepEqual(clearResolvedFieldError(errors, 'email', 'person@school.edu', validator), {});
});

test('FastAPI validation errors are mapped to safe camel-case field messages', () => {
  const feedback = mapApiError(new ApiError(422, [
    { loc: ['body', 'email'], type: 'value_error', msg: 'Invalid email', input: 'person@a' },
    { loc: ['body', 'floor_number'], type: 'int_parsing', msg: 'Input should be a valid integer' },
  ]));

  assert.deepEqual(feedback, {
    fieldErrors: {
      email: 'Please enter a valid email address.',
      floorNumber: 'Enter a valid number.',
    },
    generalMessage: null,
  });
  assert.equal(JSON.stringify(feedback).includes('person@a'), false);
});

test('HTTP and network failures map to readable messages without exposing backend details', () => {
  const backendError = new ApiError(500, { detail: 'database credentials are unavailable' });
  const serverFeedback = mapApiError(backendError);
  const networkFeedback = mapApiError(new TypeError('Failed to fetch'));

  assert.equal(serverFeedback.generalMessage, 'The request could not be completed. Please try again.');
  assert.equal(JSON.stringify(serverFeedback).includes('database credentials'), false);
  assert.equal(networkFeedback.generalMessage, 'Unable to connect. Check your connection and try again.');
});
