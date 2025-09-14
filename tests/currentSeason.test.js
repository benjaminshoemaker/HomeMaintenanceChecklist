// Node's built-in test runner
const test = require('node:test');
const assert = require('node:assert/strict');

const { currentSeason } = require('../utils/currentSeason.cjs');

test('currentSeason maps months to seasons correctly', () => {
  // Use local-time constructor (year, monthIndex, day) to avoid timezone parsing surprises
  const cases = [
    ['Winter', new Date(2025, 0, 15)],   // Jan
    ['Winter', new Date(2025, 11, 1)],   // Dec
    ['Spring', new Date(2025, 2, 10)],   // Mar
    ['Spring', new Date(2025, 4, 31)],   // May
    ['Summer', new Date(2025, 5, 1)],    // Jun
    ['Summer', new Date(2025, 7, 20)],   // Aug
    ['Fall', new Date(2025, 8, 1)],      // Sep
    ['Fall', new Date(2025, 10, 30)],    // Nov
  ];
  for (const [expect, d] of cases) {
    assert.equal(currentSeason(d), expect);
  }
});
