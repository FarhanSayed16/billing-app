/**
 * Smoke check for API base URL normalization (no test runner required).
 * Mirrors web/src/lib/api.ts getApiBaseUrl().
 */
function getApiBaseUrl(raw) {
  const DEFAULT_API_BASE = 'http://localhost:3000/api';
  const value = raw || DEFAULT_API_BASE;
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

assert(
  getApiBaseUrl('https://billpush-backend.onrender.com') ===
    'https://billpush-backend.onrender.com/api',
  'should append /api',
);
assert(
  getApiBaseUrl('https://billpush-backend.onrender.com/api') ===
    'https://billpush-backend.onrender.com/api',
  'should not double-append /api',
);
assert(
  getApiBaseUrl('http://localhost:3000/') === 'http://localhost:3000/api',
  'should strip trailing slash then append /api',
);

console.log('api base URL checks passed');
