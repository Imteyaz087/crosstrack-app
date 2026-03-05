/**
 * TrackVolt Icon Generator
 * Generates all required PWA + iOS icons from the locked bolt geometry.
 *
 * Usage (one-time setup):
 *   npm install canvas --save-dev
 *   node generate-icons.js
 *
 * Output files written to public/:
 *   icon-192.png          — Android PWA icon
 *   icon-512.png          — Android PWA icon (large)
 *   icon-512-maskable.png — Android adaptive icon (full-bleed, bolt in safe zone)
 *   apple-touch-icon.png  — iOS home screen icon (180×180)
 */

import path from 'path';
import fs   from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Check dependency ────────────────────────────────────────────────────────
let createCanvas;
try {
  const mod = await import('canvas');
  createCanvas = mod.createCanvas;
} catch {
  console.error('\n  ✗  "canvas" package not found.\n');
  console.error('  Run this first:\n');
  console.error('      npm install canvas --save-dev\n');
  console.error('  Then re-run:  node generate-icons.js\n');
  process.exit(1);
}

// ─── Brand tokens ────────────────────────────────────────────────────────────
const VOLT = '#C8FF00';   // Volt green
const DARK = '#111118';   // Near-black background

// ─── Locked bolt geometry (8-point polygon, 100×100 coordinate space) ───────
// This exact shape matches favicon.svg and all TIPO banners — do not change.
const BOLT = [
  [26,  5],
  [70,  5],
  [82, 45],
  [60, 45],
  [65, 92],
  [50, 95],
  [28, 45],
  [47, 45],
];

// ─── Helper: draw rounded rectangle ─────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// ─── Core: render one icon ───────────────────────────────────────────────────
function renderIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Maskable icons: bolt sits inside 80% safe zone (10% padding each side)
  const pad   = maskable ? Math.round(size * 0.10) : 0;
  const inner = size - pad * 2;
  const scale = inner / 100;

  // Background
  if (maskable) {
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, size, size);           // full-bleed (OS applies its own mask)
  } else {
    const radius = Math.round(size * 0.22);   // ~iOS icon corner radius
    ctx.fillStyle = DARK;
    roundRect(ctx, 0, 0, size, size, radius);
    ctx.fill();
  }

  // Bolt polygon
  ctx.fillStyle = VOLT;
  ctx.beginPath();
  BOLT.forEach(([bx, by], i) => {
    const px = pad + bx * scale;
    const py = pad + by * scale;
    if (i === 0) ctx.moveTo(px, py);
    else         ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// ─── Icon manifest ───────────────────────────────────────────────────────────
const icons = [
  { file: 'icon-192.png',          size: 192, maskable: false },
  { file: 'icon-512.png',          size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true  },
  { file: 'apple-touch-icon.png',  size: 180, maskable: false },
];

// ─── Write to public/ ────────────────────────────────────────────────────────
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  console.error(`\n  ✗  public/ folder not found at:\n     ${publicDir}\n`);
  process.exit(1);
}

console.log('\nTrackVolt Icon Generator\n');

for (const { file, size, maskable } of icons) {
  const outPath = path.join(publicDir, file);
  const buf     = renderIcon(size, maskable);
  fs.writeFileSync(outPath, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  ✓  ${file.padEnd(26)} ${size}×${size}  (${kb} KB)`);
}

// Clean up the old placeholder if it exists
const placeholder = path.join(publicDir, 'COPY-ICONS-README.txt');
if (fs.existsSync(placeholder)) {
  fs.unlinkSync(placeholder);
  console.log('\n  ✓  Removed COPY-ICONS-README.txt');
}

console.log('\n  All icons written to public/');
console.log('  Run:  npm run dev\n');
