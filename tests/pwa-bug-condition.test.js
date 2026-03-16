/**
 * PWA Bug Condition Exploration Test
 *
 * Property 1: Bug Condition - PWA Installability Criteria Fails
 *
 * Validates: Requirements 1.3, 1.4
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the code when it fails.
 *
 * This test encodes the EXPECTED (correct) behavior.
 * When the fix is applied, this test will pass.
 *
 * Scoped PBT Approach — two concrete failing cases:
 *   (a) app.config.js has `web: {}` empty → missing required PWA fields
 *   (b) public/sw.js does not exist → no Service Worker
 *   (c) app/+html.tsx has no serviceWorker.register → SW never registered
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

// ─── Property 1a: app.config.js web section has required PWA fields ──────────

console.log('\nProperty 1a: app.config.js expo.web contains required PWA fields');
console.log('─'.repeat(65));

// Load app.config.js by evaluating it (it uses ES module export default)
// We read it as text and extract the web section via regex for simplicity
const appConfigSource = readFile('app.config.js');

// Extract the web: { ... } block content
// The bug: web: {} is empty — these assertions will FAIL
test('expo.web.name is defined and non-empty', () => {
  // Parse the config by requiring it via a temp eval approach
  // Since app.config.js uses `export default`, we check the source text
  const hasName = /web\s*:\s*\{[^}]*name\s*:/.test(appConfigSource);
  assert.ok(hasName, 'COUNTEREXAMPLE: expo.web.name is missing — web: {} is empty in app.config.js');
});

test('expo.web.themeColor is defined and non-empty', () => {
  const hasThemeColor = /web\s*:\s*\{[^}]*themeColor\s*:/.test(appConfigSource);
  assert.ok(hasThemeColor, 'COUNTEREXAMPLE: expo.web.themeColor is missing — web: {} is empty in app.config.js');
});

test('expo.web.display is defined (should be "standalone")', () => {
  const hasDisplay = /web\s*:\s*\{[^}]*display\s*:/.test(appConfigSource);
  assert.ok(hasDisplay, 'COUNTEREXAMPLE: expo.web.display is missing — web: {} is empty in app.config.js');
});

test('expo.web.startUrl is defined (should be "/")', () => {
  const hasStartUrl = /web\s*:\s*\{[^}]*startUrl\s*:/.test(appConfigSource);
  assert.ok(hasStartUrl, 'COUNTEREXAMPLE: expo.web.startUrl is missing — web: {} is empty in app.config.js');
});

// ─── Property 1b: public/sw.js exists with a fetch event listener ────────────

console.log('\nProperty 1b: public/sw.js exists with a fetch event listener');
console.log('─'.repeat(65));

test('public/sw.js file exists', () => {
  const exists = fileExists('public/sw.js');
  assert.ok(exists, 'COUNTEREXAMPLE: public/sw.js does not exist — no Service Worker present');
});

test('public/sw.js contains a fetch event listener', () => {
  assert.ok(fileExists('public/sw.js'), 'COUNTEREXAMPLE: public/sw.js does not exist — cannot check fetch handler');
  const swSource = readFile('public/sw.js');
  const hasFetchListener = /addEventListener\s*\(\s*['"]fetch['"]/.test(swSource);
  assert.ok(hasFetchListener, 'COUNTEREXAMPLE: public/sw.js exists but has no fetch event listener');
});

test('public/sw.js fetch handler uses network-first strategy', () => {
  assert.ok(fileExists('public/sw.js'), 'COUNTEREXAMPLE: public/sw.js does not exist');
  const swSource = readFile('public/sw.js');
  const hasNetworkFirst = /fetch\s*\(\s*event\.request\s*\)/.test(swSource);
  assert.ok(hasNetworkFirst, 'COUNTEREXAMPLE: SW fetch handler does not call fetch(event.request) — not network-first');
});

// ─── Property 1c: app/+html.tsx contains serviceWorker.register ──────────────

console.log('\nProperty 1c: app/+html.tsx contains serviceWorker.register');
console.log('─'.repeat(65));

test('+html.tsx contains serviceWorker.register call', () => {
  const htmlSource = readFile('app/+html.tsx');
  const hasSwRegister = /serviceWorker\.register/.test(htmlSource);
  assert.ok(hasSwRegister, 'COUNTEREXAMPLE: +html.tsx has no serviceWorker.register — SW is never registered on page load');
});

test('+html.tsx registers /sw.js specifically', () => {
  const htmlSource = readFile('app/+html.tsx');
  const registersSwJs = /serviceWorker\.register\s*\(\s*['"]\/sw\.js['"]/.test(htmlSource);
  assert.ok(registersSwJs, 'COUNTEREXAMPLE: +html.tsx does not register /sw.js — SW registration path is missing or incorrect');
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(65));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log('\nCounterexamples found (bug confirmed):');
  failures.forEach(({ name, error }) => {
    console.log(`  • [${name}]`);
    console.log(`    ${error}`);
  });
  console.log('\n⚠  Test FAILED as expected — bug condition confirmed.');
  console.log('   These counterexamples prove the PWA installability bug exists.');
  console.log('   DO NOT fix the code yet — document these counterexamples first.');
  process.exit(1);
} else {
  console.log('\n✓ All assertions passed — bug has been fixed!');
  process.exit(0);
}
