const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('ICS route exists and exports POST handler', () => {
  const p = path.join(__dirname, '..', 'app', 'api', 'ics', 'route.js');
  assert.ok(fs.existsSync(p), 'app/api/ics/route.js should exist');
  const src = fs.readFileSync(p, 'utf8');
  assert.match(src, /export\s+async\s+function\s+POST\s*\(/, 'POST handler should be exported');
});

test('Seasonal templates file includes all seasons by label', () => {
  const p = path.join(__dirname, '..', 'data', 'taskTemplates.seasonal.js');
  assert.ok(fs.existsSync(p), 'data/taskTemplates.seasonal.js should exist');
  const src = fs.readFileSync(p, 'utf8');
  // Look for the literal season strings at least once
  for (const s of ['"Spring"', '"Summer"', '"Fall"', '"Winter"']) {
    assert.match(src, new RegExp(s), `Should include ${s} tasks`);
  }
});

test('README has Live Demo link', () => {
  const p = path.join(__dirname, '..', 'README.md');
  assert.ok(fs.existsSync(p));
  const src = fs.readFileSync(p, 'utf8');
  assert.match(src, /https:\/\/homemaintenancechecklist\.onrender\.com/);
});

test('.env.example includes required public vars', () => {
  const p = path.join(__dirname, '..', '.env.example');
  assert.ok(fs.existsSync(p));
  const src = fs.readFileSync(p, 'utf8');
  for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SITE_URL']) {
    assert.match(src, new RegExp(`^${key}=`, 'm')); // has a line starting with KEY=
  }
});

