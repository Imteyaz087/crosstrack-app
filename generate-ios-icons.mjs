/**
 * Generate all iOS app icon sizes from the 1024x1024 master.
 * 
 * RUN:  npm install sharp --save-dev
 * THEN: node generate-ios-icons.mjs
 * 
 * Output goes to: ios/App/App/Assets.xcassets/AppIcon.appiconset/
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
const MASTER = path.join(ROOT, 'TrackVolt Logo', '06-App-Icons', 'AppIcon-1024x1024.png');
const OUT_DIR = path.join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

// All iOS icon sizes needed for Xcode (iOS 12+)
const IOS_ICONS = [
  // iPhone Notification
  { size: 20, scale: 2, filename: 'icon-20@2x.png' },
  { size: 20, scale: 3, filename: 'icon-20@3x.png' },
  // iPhone Settings
  { size: 29, scale: 2, filename: 'icon-29@2x.png' },
  { size: 29, scale: 3, filename: 'icon-29@3x.png' },
  // iPhone Spotlight
  { size: 40, scale: 2, filename: 'icon-40@2x.png' },
  { size: 40, scale: 3, filename: 'icon-40@3x.png' },
  // iPhone App
  { size: 60, scale: 2, filename: 'icon-60@2x.png' },
  { size: 60, scale: 3, filename: 'icon-60@3x.png' },
  // iPad Notification
  { size: 20, scale: 1, filename: 'icon-20.png' },
  { size: 20, scale: 2, filename: 'icon-20@2x-ipad.png' },
  // iPad Settings
  { size: 29, scale: 1, filename: 'icon-29.png' },
  { size: 29, scale: 2, filename: 'icon-29@2x-ipad.png' },
  // iPad Spotlight
  { size: 40, scale: 1, filename: 'icon-40.png' },
  { size: 40, scale: 2, filename: 'icon-40@2x-ipad.png' },
  // iPad App
  { size: 76, scale: 1, filename: 'icon-76.png' },
  { size: 76, scale: 2, filename: 'icon-76@2x.png' },
  // iPad Pro
  { size: 83.5, scale: 2, filename: 'icon-83.5@2x.png' },
  // App Store
  { size: 1024, scale: 1, filename: 'icon-1024.png' },
];

async function main() {
  // Verify master exists
  if (!fs.existsSync(MASTER)) {
    console.error(`Master icon not found at: ${MASTER}`);
    process.exit(1);
  }

  // Create output directory
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n⚡ TrackVolt iOS Icon Generator\n');
  console.log(`Master: ${MASTER}`);
  console.log(`Output: ${OUT_DIR}\n`);

  for (const icon of IOS_ICONS) {
    const px = Math.round(icon.size * icon.scale);
    const outPath = path.join(OUT_DIR, icon.filename);
    
    await sharp(MASTER)
      .resize(px, px, { fit: 'cover', kernel: 'lanczos3' })
      .png({ quality: 100 })
      .toFile(outPath);
    
    console.log(`  ✓ ${icon.filename} (${px}x${px})`);
  }

  // Generate Contents.json for Xcode
  const contents = {
    images: [
      { size: '20x20', idiom: 'iphone', scale: '2x', filename: 'icon-20@2x.png' },
      { size: '20x20', idiom: 'iphone', scale: '3x', filename: 'icon-20@3x.png' },
      { size: '29x29', idiom: 'iphone', scale: '2x', filename: 'icon-29@2x.png' },
      { size: '29x29', idiom: 'iphone', scale: '3x', filename: 'icon-29@3x.png' },
      { size: '40x40', idiom: 'iphone', scale: '2x', filename: 'icon-40@2x.png' },
      { size: '40x40', idiom: 'iphone', scale: '3x', filename: 'icon-40@3x.png' },
      { size: '60x60', idiom: 'iphone', scale: '2x', filename: 'icon-60@2x.png' },
      { size: '60x60', idiom: 'iphone', scale: '3x', filename: 'icon-60@3x.png' },
      { size: '20x20', idiom: 'ipad', scale: '1x', filename: 'icon-20.png' },
      { size: '20x20', idiom: 'ipad', scale: '2x', filename: 'icon-20@2x-ipad.png' },
      { size: '29x29', idiom: 'ipad', scale: '1x', filename: 'icon-29.png' },
      { size: '29x29', idiom: 'ipad', scale: '2x', filename: 'icon-29@2x-ipad.png' },
      { size: '40x40', idiom: 'ipad', scale: '1x', filename: 'icon-40.png' },
      { size: '40x40', idiom: 'ipad', scale: '2x', filename: 'icon-40@2x-ipad.png' },
      { size: '76x76', idiom: 'ipad', scale: '1x', filename: 'icon-76.png' },
      { size: '76x76', idiom: 'ipad', scale: '2x', filename: 'icon-76@2x.png' },
      { size: '83.5x83.5', idiom: 'ipad', scale: '2x', filename: 'icon-83.5@2x.png' },
      { size: '1024x1024', idiom: 'ios-marketing', scale: '1x', filename: 'icon-1024.png' },
    ],
    info: { version: 1, author: 'generate-ios-icons.mjs' }
  };

  const contentsPath = path.join(OUT_DIR, 'Contents.json');
  fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));
  console.log(`  ✓ Contents.json (Xcode asset catalog)\n`);

  console.log(`✅ Generated ${IOS_ICONS.length} icons + Contents.json`);
  console.log(`   Ready for Xcode at: ${OUT_DIR}\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
