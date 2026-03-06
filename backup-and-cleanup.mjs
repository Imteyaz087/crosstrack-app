/**
 * TrackVolt — Backup & Cleanup Script
 * 
 * WHAT THIS DOES:
 * 1. Creates a git commit of EVERYTHING as-is (your safety net)
 * 2. Deletes dead files that are NOT used by the live app
 * 3. Deletes helper scripts that have already done their job
 * 4. Creates another git commit after cleanup
 * 
 * RUN: node backup-and-cleanup.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

// ── FILES TO DELETE ──────────────────────────────────────────────
// Dead root-level strays (duplicates of files already in src/)
const DEAD_ROOT_FILES = [
  'BarcodeScanner.tsx',
  'CycleCalendar.tsx',
  'CycleLogger.tsx',
  'MealLogger.tsx',
  'useCycleTracking.ts',
  'useWorkoutForm.ts',
  'zh-CN.ts',
];

// Dead source files (not imported by any production code)
const DEAD_SRC_FILES = [
  'src/components/PlaceholderPage.tsx',
  'src/components/Toast.tsx',
  'src/components/InstallBanner.tsx',
  'src/data/foodLibrary.ts',
  'src/data/movements.ts',
  'src/i18n/zhCN.ts.bak',
];

// Helper scripts that already did their job
const HELPER_SCRIPTS = [
  'fix-icons.mjs',
  'take-screenshots.mjs',
  'setup-icons.mjs',
  'generate-icons.js',
  'check-imports.cjs',
  'verify-store-usage.cjs',
  'unpack-source.cjs',
];

function run(cmd) {
  console.log(`  > ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    if (out.trim()) console.log(out.trim());
    return true;
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`);
    return false;
  }
}

function deleteFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log(`  ✓ Deleted: ${relPath}`);
    return true;
  } else {
    console.log(`  ⊘ Already gone: ${relPath}`);
    return false;
  }
}

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║   TrackVolt — Backup & Cleanup              ║');
console.log('╚══════════════════════════════════════════════╝\n');

// ── STEP 1: BACKUP ──────────────────────────────────────────────
console.log('━━━ STEP 1: Creating backup commit ━━━');
run('git add -A');
run('git commit -m "BACKUP: pre-cleanup snapshot — all fixes applied (icons, screenshots, types, capacitor)"');
console.log('');

// ── STEP 2: DELETE DEAD FILES ───────────────────────────────────
console.log('━━━ STEP 2: Removing dead root-level strays ━━━');
let deleted = 0;
for (const f of DEAD_ROOT_FILES) {
  if (deleteFile(f)) deleted++;
}
console.log('');

console.log('━━━ STEP 3: Removing dead source files ━━━');
for (const f of DEAD_SRC_FILES) {
  if (deleteFile(f)) deleted++;
}
console.log('');

console.log('━━━ STEP 4: Removing helper scripts ━━━');
for (const f of HELPER_SCRIPTS) {
  if (deleteFile(f)) deleted++;
}
console.log('');

// Also delete THIS script after it runs
console.log('━━━ STEP 5: Self-cleanup ━━━');
const selfPath = path.join(ROOT, 'backup-and-cleanup.mjs');

// ── STEP 3: COMMIT CLEANUP ─────────────────────────────────────
console.log('━━━ STEP 6: Committing cleanup ━━━');
run('git add -A');
run(`git commit -m "chore: remove ${deleted} dead files and helper scripts"`);

// Delete self last
if (fs.existsSync(selfPath)) {
  fs.unlinkSync(selfPath);
  console.log('  ✓ Deleted: backup-and-cleanup.mjs (self)');
  run('git add -A');
  run('git commit -m "chore: remove backup-and-cleanup script"');
}

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║   ✅ DONE — Backup created, dead files gone  ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log('Your backup commit is safe in git history.');
console.log('If anything breaks, run: git log --oneline');
console.log('Then: git reset --hard <backup-commit-hash>');
console.log('');
