const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    defaultViewport: { width: 430, height: 932, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(1200);
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const req = indexedDB.open('CrossTrackDB');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('profile', 'readwrite');
        const store = tx.objectStore('profile');
        store.clear();
        store.add({
          displayName: 'Aron',
          experienceLevel: 'beginner',
          goal: 'general_health',
          calorieTarget: 2000,
          waterTarget: 2500,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(1600);

  async function clickText(text) {
    const clicked = await page.evaluate((label) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const candidates = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const target = candidates.find((el) => normalize(el.textContent) === label)
        || candidates.find((el) => normalize(el.textContent).includes(label));
      if (!target) return false;
      target.click();
      return true;
    }, text);
    if (!clicked) throw new Error(`Missing text: ${text}`);
    await sleep(900);
  }

  await page.evaluate(() => {
    const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
    const btn = Array.from(document.querySelectorAll('button, a, [role="button"]')).find((el) => normalize(el.textContent).includes('Skip tour'));
    if (btn) btn.click();
  });
  await sleep(800);

  await clickText('More');
  await clickText('WOD Timer');
  await clickText('AMRAP');
  await sleep(1200);
  await page.screenshot({ path: 'C:/ClaudeWork/Imu/trackvolt-timer-amrap-mobile-final.png', fullPage: true });
  console.log('C:/ClaudeWork/Imu/trackvolt-timer-amrap-mobile-final.png');
  await browser.close();
})();
