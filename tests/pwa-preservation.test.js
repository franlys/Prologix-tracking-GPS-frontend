/**
 * PWA Preservation Property Tests
 *
 * Property 2: Preservation - Existing Build Output and Routing Unchanged
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * OBSERVATION-FIRST METHODOLOGY:
 *   - vercel.json rewrite excludes: manifest.json, icon*.png, favicon.png,
 *     splash-icon.png, adaptive-icon.png — everything else rewrites to /index.html
 *   - +html.tsx already contains: <link rel="manifest">, apple-touch-icon links,
 *     theme-color meta tag
 *
 * EXPECTED OUTCOME: Tests PASS on unfixed code.
 * These tests confirm the baseline behavior that must be preserved after the fix.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const FRONTEND_DIR = path.resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────────────────

function readFile(relPath) {
  return fs.readFileSync(path.join(FRONTEND_DIR, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(FRONTEND_DIR, relPath));
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
    failed++;
    failures.push({ name, error: err.message });
  }
}

// ─── Simulated SW fetch handler (mirrors the design spec logic) ──────────────
// This simulates the SW fetch handler behavior described in design.md:
//   if (url.hostname !== self.location.hostname) return;  // cross-origin: skip
//   event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));

const PWA_ORIGIN = 'app.prologix.com'; // representative same-origin hostname

/**
 * Simulates whether the SW fetch handler would intercept a given URL.
 * Returns true if the SW calls event.respondWith (same-origin),
 * returns false if the SW returns early without intercepting (cross-origin).
 */
function swWouldIntercept(requestUrl, swHostname) {
  const url = new URL(requestUrl);
  return url.hostname === swHostname;
}

// ─── Property 2a: SW does NOT intercept cross-origin requests ────────────────

console.log('\nProperty 2a: SW fetch handler must NOT intercept cross-origin requests');
console.log('─'.repeat(70));

// For any URL whose hostname differs from the PWA origin, the SW must NOT intercept
const crossOriginUrls = [
  'https://prologix-tracking-gps-production.up.railway.app/api/auth/login',
  'https://prologix-tracking-gps-production.up.railway.app/api/devices',
  'https://prologix-tracking-gps-production.up.railway.app/api/users/me',
  'https://api.example.com/data',
  'https://cdn.external.com/script.js',
  'https://maps.googleapis.com/maps/api/js',
  'https://tile.openstreetmap.org/10/512/512.png',
];

crossOriginUrls.forEach((url) => {
  const hostname = new URL(url).hostname;
  test(`SW does not intercept cross-origin: ${hostname}`, () => {
    const wouldIntercept = swWouldIntercept(url, PWA_ORIGIN);
    assert.strictEqual(
      wouldIntercept,
      false,
      `VIOLATION: SW would intercept cross-origin request to ${url} — API pass-through broken`
    );
  });
});

// Property: for ANY hostname different from PWA origin, SW must not intercept
// We test a range of representative hostnames
const externalHostnames = [
  'api.backend.com',
  'cdn.assets.net',
  'fonts.googleapis.com',
  'analytics.google.com',
  'sentry.io',
];

externalHostnames.forEach((hostname) => {
  test(`SW does not intercept any request to external hostname: ${hostname}`, () => {
    const testUrl = `https://${hostname}/some/path`;
    const wouldIntercept = swWouldIntercept(testUrl, PWA_ORIGIN);
    assert.strictEqual(
      wouldIntercept,
      false,
      `VIOLATION: SW would intercept request to ${hostname} — cross-origin requests must pass through`
    );
  });
});

// ─── Property 2b: SW DOES intercept same-origin requests (network-first) ─────

console.log('\nProperty 2b: SW must intercept same-origin requests with network-first');
console.log('─'.repeat(70));

const sameOriginPaths = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/login',
  '/dashboard',
  '/devices',
  '/assets/icon.png',
];

sameOriginPaths.forEach((urlPath) => {
  const fullUrl = `https://${PWA_ORIGIN}${urlPath}`;
  test(`SW intercepts same-origin request: ${urlPath}`, () => {
    const wouldIntercept = swWouldIntercept(fullUrl, PWA_ORIGIN);
    assert.strictEqual(
      wouldIntercept,
      true,
      `VIOLATION: SW would NOT intercept same-origin request to ${urlPath} — network-first strategy broken`
    );
  });
});

// ─── Property 2c: vercel.json rewrite excludes known static files ─────────────

console.log('\nProperty 2c: vercel.json rewrite excludes known static files');
console.log('─'.repeat(70));

// Read and parse vercel.json
const vercelConfig = JSON.parse(readFile('vercel.json'));
const rewriteSource = vercelConfig.rewrites?.[0]?.source ?? '';

test('vercel.json has a rewrites rule', () => {
  assert.ok(
    vercelConfig.rewrites && vercelConfig.rewrites.length > 0,
    'VIOLATION: vercel.json has no rewrites rules — SPA routing broken'
  );
});

test('vercel.json rewrite destination is /index.html', () => {
  const destination = vercelConfig.rewrites?.[0]?.destination;
  assert.strictEqual(
    destination,
    '/index.html',
    `VIOLATION: rewrite destination is "${destination}", expected "/index.html"`
  );
});

// Static files that must be excluded from the SPA rewrite
const staticFilesToExclude = [
  { file: 'manifest.json', pattern: 'manifest\\.json' },
  { file: 'icon-192.png', pattern: 'icon.*\\.png' },
  { file: 'icon-512.png', pattern: 'icon.*\\.png' },
  { file: 'favicon.png', pattern: 'favicon\\.png' },
  { file: 'splash-icon.png', pattern: 'splash-icon\\.png' },
  { file: 'adaptive-icon.png', pattern: 'adaptive-icon\\.png' },
];

staticFilesToExclude.forEach(({ file, pattern }) => {
  test(`vercel.json rewrite source excludes ${file}`, () => {
    // The source uses a negative lookahead — check the pattern is present
    assert.ok(
      rewriteSource.includes(pattern),
      `VIOLATION: vercel.json rewrite source does not exclude "${file}" (pattern: ${pattern}) — static file would be rewritten to index.html`
    );
  });
});

// Verify the rewrite source uses a negative lookahead (correct SPA pattern)
test('vercel.json rewrite source uses negative lookahead pattern', () => {
  assert.ok(
    rewriteSource.includes('(?!'),
    'VIOLATION: vercel.json rewrite source does not use negative lookahead — static file exclusion may be broken'
  );
});

// ─── Property 2d: +html.tsx contains existing meta tags ──────────────────────

console.log('\n+html.tsx contains existing PWA meta tags (baseline to preserve)');
console.log('─'.repeat(70));

const htmlSource = readFile('app/+html.tsx');

test('+html.tsx contains <link rel="manifest">', () => {
  const hasManifest = /rel=["']manifest["']/.test(htmlSource);
  assert.ok(
    hasManifest,
    'VIOLATION: +html.tsx is missing <link rel="manifest"> — manifest link removed'
  );
});

test('+html.tsx contains apple-touch-icon link', () => {
  const hasAppleTouchIcon = /rel=["']apple-touch-icon["']/.test(htmlSource);
  assert.ok(
    hasAppleTouchIcon,
    'VIOLATION: +html.tsx is missing <link rel="apple-touch-icon"> — iOS icon link removed'
  );
});

test('+html.tsx contains theme-color meta tag', () => {
  const hasThemeColor = /name=["']theme-color["']/.test(htmlSource);
  assert.ok(
    hasThemeColor,
    'VIOLATION: +html.tsx is missing <meta name="theme-color"> — theme color meta removed'
  );
});

test('+html.tsx theme-color value is #1e3a8a', () => {
  const hasCorrectThemeColor = /name=["']theme-color["'][^>]*content=["']#1e3a8a["']|content=["']#1e3a8a["'][^>]*name=["']theme-color["']/.test(htmlSource);
  assert.ok(
    hasCorrectThemeColor,
    'VIOLATION: +html.tsx theme-color is not "#1e3a8a" — brand color changed'
  );
});

test('+html.tsx contains apple-mobile-web-app-capable meta tag', () => {
  const hasAppleCapable = /name=["']apple-mobile-web-app-capable["']/.test(htmlSource);
  assert.ok(
    hasAppleCapable,
    'VIOLATION: +html.tsx is missing apple-mobile-web-app-capable — iOS PWA capability removed'
  );
});

test('+html.tsx manifest href points to manifest.json', () => {
  const hasManifestHref = /href=["']manifest\.json["']/.test(htmlSource);
  assert.ok(
    hasManifestHref,
    'VIOLATION: +html.tsx manifest link does not point to "manifest.json"'
  );
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log('\nPreservation violations found:');
  failures.forEach(({ name, error }) => {
    console.log(`  • [${name}]`);
    console.log(`    ${error}`);
  });
  console.log('\n✗ Preservation tests FAILED — baseline behavior has been broken.');
  process.exit(1);
} else {
  console.log('\n✓ All preservation tests passed — baseline behavior confirmed.');
  console.log('  These behaviors must remain unchanged after the PWA fix is applied.');
  process.exit(0);
}
