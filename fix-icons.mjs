#!/usr/bin/env node
/**
 * TrackVolt — Fix PWA icon filenames
 * Run: node fix-icons.mjs
 * Then delete this file.
 */
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const pub = join(import.meta.dirname, 'public')

const copies = [
  ['AppIcon-192x192.png', 'icon-192.png'],
  ['AppIcon-512x512.png', 'icon-512.png'],
  ['AppIcon-512x512.png', 'icon-512-maskable.png'],
]

for (const [src, dest] of copies) {
  const srcPath = join(pub, src)
  const destPath = join(pub, dest)
  if (!existsSync(srcPath)) {
    console.log(`⚠️  Source missing: ${src}`)
    continue
  }
  copyFileSync(srcPath, destPath)
  console.log(`✅ ${src} → ${dest}`)
}

// Create screenshots folder if missing
const ssDir = join(pub, 'screenshots')
if (!existsSync(ssDir)) {
  mkdirSync(ssDir, { recursive: true })
  console.log('📁 Created public/screenshots/ (needs actual screenshots)')
}

// Clean up helper files
const junk = ['decode-favicon.mjs']
for (const f of junk) {
  const p = join(pub, f)
  if (existsSync(p)) {
    const { unlinkSync } = await import('fs')
    unlinkSync(p)
    console.log(`🗑️  Removed ${f}`)
  }
}

console.log('\\n✅ Done! You can delete fix-icons.mjs now.')
