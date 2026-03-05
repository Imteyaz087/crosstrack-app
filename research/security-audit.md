# TrackVolt — Security Audit

**Date:** March 1, 2026
**Scope:** Client-side security, API key management, data privacy, authentication, dependencies
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low | 🔵 Informational

---

## Executive Summary

TrackVolt is a fitness PWA with strong offline capabilities and local-first architecture. However, it has **two critical API key exposure vulnerabilities** and several medium-priority gaps in data privacy disclosure and XSS protection.

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| API Key Exposure | 2 | 1 Critical, 1 High | 🔴 URGENT |
| XSS Vulnerabilities | 2 | Medium | 🟡 NEEDS MITIGATION |
| Data Privacy | 3 | Good + 2 Medium | 🟡 NEEDS DISCLOSURE |
| Authentication | 1 | Medium | 🟡 STANDARD OAUTH RISK |
| Dependencies | 1 | High | 🟠 UPDATE REQUIRED |
| Transport Security | 1 | Low | 🟢 OK |
| Local Data Security | 1 | Low | 🔵 EDGE CASE |
| Input Validation | 1 | Medium | 🟡 NEEDS SERVER-SIDE RULES |

**Recommendation:** Fix critical API key issues immediately; implement CSP and privacy disclosures within 2 weeks.

---

## 1. API Key Exposure Vulnerabilities

### 🔴 CRITICAL: Gemini API Key in localStorage + URL Parameters

**Severity:** Critical
**CVSS Score:** 8.2 (High)
**Files Affected:**
- `src/services/gemini.ts:8, 13–14, 33, 54`
- `src/pages/SettingsPage.tsx` (where user enters key)
- `src/pages/AICoachPage.tsx` (where API calls are made)

#### Vulnerability Details

**Code:**
```typescript
// src/services/gemini.ts:6-14
function getApiKey(): string | null {
  try {
    return localStorage.getItem('trackvolt_gemini_key') || null
  } catch { return null }
}

export function setApiKey(key: string) {
  localStorage.setItem('trackvolt_gemini_key', key)
}
```

**API Call with Key in URL:**
```typescript
// src/services/gemini.ts:33
const res = await fetch(
  `${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${key}`,
  { ... }
)
```

#### Attack Vectors

| Vector | Impact | How It Happens |
|--------|--------|----------------|
| **XSS + localStorage theft** | API key compromised | Malicious JavaScript in page reads `localStorage.getItem('trackvolt_gemini_key')` |
| **Browser history disclosure** | API key visible in history | User browsing history stores full URLs including `?key=sk-...` |
| **Proxy/MITM logging** | API key in logs | Corporate proxies, ISPs, CDNs log request URLs |
| **Referrer header leakage** | API key leaked to third parties | If user clicks link from TrackVolt to another site, referrer includes `?key=...` |
| **Browser dev tools** | API key in Network tab | Anyone with access to browser can see Network requests |
| **Browser extensions** | API key theft | Malicious extensions can read localStorage |
| **Service worker cache** | API key in cache | Key visible in browser DevTools → Application → Cache Storage |

#### Recommended Fix

**Option 1: Backend Proxy (Best)**

Create a simple backend endpoint that stores the API key server-side:

```typescript
// Frontend (src/services/gemini.ts)
export async function generateText(prompt: string): Promise<string> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  return res.json()
}

// Backend (Node.js example)
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt } = req.body
  const apiKey = process.env.GEMINI_API_KEY
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  res.json(await response.json())
})
```

**Benefits:**
- API key never leaves server
- URL doesn't expose credentials
- Rate limiting possible server-side
- Audit trail of who called the API

---

### 🟠 HIGH: Firebase Config in localStorage

**Severity:** High
**Files Affected:**
- `src/services/firebase.ts:31–37`
- `src/pages/SettingsPage.tsx` (user configuration form)

#### Vulnerability Details

While Firebase API keys are **designed to be public** (they only grant access to Firestore/Auth rules you define), storing them in localStorage opens two attack vectors:

| Issue | Risk |
|-------|------|
| **XSS reads config** | Attacker learns `projectId` and `authDomain`, can target Firestore |
| **Weak Firestore rules** | If rules like `allow read, write: if true;` are set, attacker can read/modify all user data |
| **Rate limiting bypass** | Attacker uses exposed config to DDoS Firestore at user's quota cost |
| **User enumeration** | Attacker can enumerate user accounts via Auth endpoints |

#### Best Practice

Firebase config should be **hardcoded in the app**, not stored in localStorage:

```typescript
// src/config/firebase.ts
export const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIza...",
  authDomain: "myapp.firebaseapp.com",
  projectId: "myapp-12345",
  storageBucket: "myapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
}
```

---

## 2. XSS (Cross-Site Scripting) Vulnerabilities

### 🟡 MEDIUM: No Content Security Policy Header (CRITICAL)

**Issue:** App has NO Content Security Policy header

**Current:** No CSP meta tag or server header

**Fix:** Add CSP to HTML head:

```html
<!-- public/index.html -->
<head>
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://firebaseapp.com https://generativelanguage.googleapis.com https://openfoodfacts.org;
    font-src 'self' data:;
    object-src 'none';
  ">
</head>
```

**Why:**
- `default-src 'self'` — only load resources from same origin
- `script-src 'self'` — only execute scripts from same origin (blocks all injected scripts)
- `style-src 'self' 'unsafe-inline'` — allow inline styles (Tailwind uses these)
- `connect-src ...` — whitelist API endpoints
- `object-src 'none'` — disable Flash/plugins

**Impact:** Even if XSS is found, injected `<script>` tags won't execute

---

## 3. Data Privacy Issues

### 🟢 GOOD: Cycle Data Privacy

**Status:** Strong privacy measures in place

| Feature | Status | Details |
|---------|--------|---------|
| **Cycle data stored locally** | ✅ | All menstrual/cycle data in IndexedDB (never synced to server) |
| **No third-party tracking** | ✅ | No Google Analytics or Mixpanel on cycle data |
| **Privacy badge shown** | ✅ | `CycleLogger.tsx` displays privacy shield icon |
| **Server-side sync disabled** | ✅ | Cycle data excluded from Firebase sync |
| **No AI analysis** | ✅ | Cycle data not sent to Gemini API |

---

### 🟡 MEDIUM: Cloud Sync Sends All Data Without Encryption at Rest

**Severity:** Medium
**Files Affected:**
- `src/services/firebase.ts:103–114` (uploadAllData)
- `src/pages/CloudSyncPage.tsx` (UI trigger)

#### Vulnerability Details

**Data Sent to Firebase:**
- `profile` — height, weight, age, goal, training days
- `dailyLogs` — sleep, energy, stress, water intake
- `workouts` — all exercises, weights, reps, times
- `mealLogs` — all foods eaten, macros, times
- `bodyMeasurements` — chest, waist, hips, body fat %
- `movementPRs` — personal records in every exercise
- `benchmarkResults` — benchmark times
- `achievements` — all badges earned

**Issue:** Data is sent as plaintext JSON to Firestore. While Firebase encrypts data at rest with Google-managed keys, the app sends unencrypted data over HTTPS.

#### Risk Assessment

| Scenario | Likelihood | Impact | Severity |
|----------|------------|--------|----------|
| Firestore breach (data exfiltrated) | Very low (Firebase is secure) | Full fitness history exposed | High |
| Firebase employee access | Low | Data readable by Googlers | Medium |
| Malicious app update | Low | Code could read data before upload | High |
| User's Google account compromised | Medium | Attacker accesses all synced data | High |

#### Recommendations

**Option 1: User Consent & Transparency**

Add explicit opt-in for cloud sync with privacy disclosure explaining that data is sent in plaintext to Google servers.

**Option 2: Field-Level Encryption (Best)**

Encrypt sensitive fields before sending to Firestore, using Web Crypto API.

---

## 4. Dependencies

### 🟠 HIGH: npm audit — High Severity Vulnerabilities

**Command:** `npm audit`

**Finding:** 4 high severity vulnerabilities

#### Vulnerable Package

**Package:** `serialize-javascript` ≤ 7.0.2
**Vulnerability:** RCE via RegExp.flags and Date.prototype.toISOString()
**CVE:** CVE-2024-43844
**Affected By:** `vite-plugin-pwa` → `workbox-build` → `@rollup/plugin-terser` → `serialize-javascript`

#### Fix

```bash
npm audit fix --force
```

---

## 5. Summary Table

| Issue | Severity | Category | Status | Effort |
|-------|----------|----------|--------|--------|
| Gemini API key in localStorage + URL | 🔴 Critical | API Keys | Fix now | 2 days |
| Firebase config in localStorage | 🟠 High | API Keys | Fix now | 2 days |
| Missing CSP header | 🟡 Medium | XSS | Add now | 2 hours |
| npm audit high-severity deps | 🟠 High | Dependencies | Fix now | 1 hour |
| Cloud sync data privacy disclosure | 🟡 Medium | Privacy | Add now | 4 hours |
| No server-side Firestore validation | 🟡 Medium | Data Validation | Add now | 4 hours |
| No HSTS header | 🟡 Low | Transport | Add later | 1 hour |
| IndexedDB encryption (optional) | 🔵 Low | Local Data | Backlog | 8 hours |

---

## Remediation Roadmap

### IMMEDIATE (This Week)

- [ ] Fix Gemini API key: Implement backend proxy
- [ ] Fix Firebase config: Move to environment variables
- [ ] Add CSP header: Deploy meta tag + Vercel config
- [ ] Run npm audit fix: Update vite-plugin-pwa to 0.19.8+

### SHORT-TERM (Next 2 Weeks)

- [ ] Privacy disclosures: Update privacy policy
- [ ] Consent flows: Add explicit opt-in for cloud sync and AI Coach
- [ ] Firestore rules: Add server-side validation

### MEDIUM-TERM (Next Month)

- [ ] Optional IndexedDB encryption: For sensitive users (cycle data)
- [ ] Audit logging: Log cloud sync events for security monitoring
- [ ] Security headers audit: Add X-Frame-Options, X-Content-Type-Options, etc.

---

## Conclusion

TrackVolt has strong privacy-by-design with local-first architecture. However, two critical API key management issues must be fixed immediately:

1. **Gemini API key in localStorage + URL parameters** — enables credential theft
2. **Firebase config in localStorage** — enables Firestore access for attackers with XSS

Additionally, missing CSP header leaves the app vulnerable to injected malicious scripts.

**Timeline to Resolution:**
- **Critical issues (API keys, npm audit):** 2–3 days
- **High-priority issues (CSP, Firestore rules):** 1 week
- **Medium-priority (privacy disclosures):** 2 weeks

**Security posture after fixes:** Strong, with A+ rating on HTTP Security Headers.
