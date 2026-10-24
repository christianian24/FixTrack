import assert from 'node:assert/strict';
import test from 'node:test';
import { getPersonnelAvailability } from '../src/lib/personnelAvailability.ts';

const personnelId = 'technician-1';
const assignedActiveConcern = {
  assignedPersonnelId: personnelId,
  status: 'IN_PROGRESS',
};

test('offline personnel without assignments are not available', () => {
  assert.equal(getPersonnelAvailability(personnelId, false, []), 'NOT AVAILABLE');
});

test('offline personnel remain not available with assigned work', () => {
  assert.equal(
    getPersonnelAvailability(personnelId, false, [assignedActiveConcern]),
    'NOT AVAILABLE',
  );
});

test('online personnel without active assignments are available', () => {
  assert.equal(getPersonnelAvailability(personnelId, true, []), 'AVAILABLE');
});

test('online personnel with assigned active work are busy', () => {
  assert.equal(
    getPersonnelAvailability(personnelId, true, [assignedActiveConcern]),
    'BUSY',
  );
});
