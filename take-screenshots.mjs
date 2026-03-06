#!/usr/bin/env node
/**
 * TrackVolt — PWA Screenshot Generator (uses your existing Chrome)
 * 
 * Usage:
 *   npm i puppeteer-core
 *   node take-screenshots.mjs
 */

import puppeteer from 'puppeteer-core'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const SITE = 'https://trackvolt.app'
const OUT = join(import.meta.dirname, 'public', 'screenshots')
const WIDTH = 430
const HEIGHT = 932
const DPR = 3  // 3x = 1290x2796

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// Find Chrome on Windows
function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    // Edge as fallback
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
  for (const p of paths) {
    if (existsSync(p)) return p
  }
  // Try registry
  try {
    const reg = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve', { encoding: 'utf8' })
    const match = reg.match(/REG_SZ\s+(.+)/)
    if (match) return match[1].trim()
  } catch {}
  return null
}

const delay = ms => new Promise(r => setTimeout(r, ms))

async function snap(page, name, setupFn) {
  console.log(`  Taking: ${name}...`)
  if (setupFn) await setupFn(page)
  await delay(2500)
  await page.screenshot({ path: join(OUT, name), type: 'png', fullPage: false })
  console.log(`  Done: ${name}`)
}

;(async () => {
  const chromePath = findChrome()
  if (!chromePath) {
    console.error('Could not find Chrome or Edge. Please set CHROME_PATH env variable.')
    process.exit(1)
  }
  console.log(`Using: ${chromePath}`)
  console.log('Launching...')

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DPR })

  console.log(`Loading ${SITE}...`)
  await page.goto(SITE, { waitUntil: 'networkidle2', timeout: 30000 })
  await delay(4000)

  // 1. Today Dashboard
  await snap(page, 'today-dashboard.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('Today')) t.click()
      })
    })
  })

  // 2. Workout Log
  await snap(page, 'workout-log.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('Log')) t.click()
      })
    })
  })

  // 3. Nutrition
  await snap(page, 'nutrition-macros.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('Eat')) t.click()
      })
    })
  })

  // 4. Progress
  await snap(page, 'progress-prs.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('More')) t.click()
      })
    })
    await delay(1500)
    await p.evaluate(() => {
      document.querySelectorAll('[class*="cursor-pointer"], button, div').forEach(el => {
        if (el.textContent?.includes('Progress') && el.textContent?.includes('Charts')) el.click()
      })
    })
  })

  // 5. Cycle Training
  await snap(page, 'cycle-training.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('Log')) t.click()
      })
    })
    await delay(1500)
    await p.evaluate(() => {
      document.querySelectorAll('button, div').forEach(el => {
        if (el.textContent?.trim() === 'Cycle') el.click()
      })
    })
  })

  // 6. Achievements
  await snap(page, 'achievements.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('More')) t.click()
      })
    })
    await delay(1500)
    await p.evaluate(() => {
      document.querySelectorAll('[class*="cursor-pointer"], button, div').forEach(el => {
        if (el.textContent?.includes('Achievements') && el.textContent?.includes('Badges')) el.click()
      })
    })
  })

  // 7. Training (calendar + workouts)
  await snap(page, 'offline-first.png', async p => {
    await p.evaluate(() => {
      document.querySelectorAll('[role="tab"]').forEach(t => {
        if (t.textContent?.includes('Train')) t.click()
      })
    })
  })

  await browser.close()
  console.log('\nAll 7 screenshots saved to public/screenshots/')
  console.log('Resolution: 1290x2796 (iPhone 15 Pro Max)')
})()
