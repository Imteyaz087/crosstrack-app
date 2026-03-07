// Firebase SDK loaded dynamically — 333KB chunk only fetched when functions are called
// (not when Settings/CloudSync pages load)

// ---- Firebase Config ----
// Priority: env vars (build-time) -> localStorage (user-configured at runtime)
const CONFIG_KEY = 'trackvolt_firebase_config'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

/** Try env vars first, then fall back to localStorage */
export function getFirebaseConfig(): FirebaseConfig | null {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (envApiKey) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FirebaseConfig
  } catch { return null }
}

export function setFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  _app = null
  _auth = null
  _db = null
}

export function clearFirebaseConfig() {
  localStorage.removeItem(CONFIG_KEY)
  _app = null
  _auth = null
  _db = null
}

export function hasFirebaseConfig(): boolean {
  return getFirebaseConfig() !== null
}

// ---- Lazy initialization (fully dynamic imports) ----
let _app: any = null
let _auth: any = null
let _db: any = null

async function ensureApp() {
  if (_app) return _app
  const config = getFirebaseConfig()
  if (!config) throw new Error('Firebase not configured. Add your Firebase config in Settings.')
  const { initializeApp } = await import('firebase/app')
  _app = initializeApp(config)
  return _app
}

async function getAppAuth() {
  if (_auth) return _auth
  const app = await ensureApp()
  const { getAuth } = await import('firebase/auth')
  _auth = getAuth(app)
  return _auth
}

async function getAppFirestore() {
  if (_db) return _db
  const app = await ensureApp()
  const { getFirestore } = await import('firebase/firestore')
  _db = getFirestore(app)
  return _db
}

// ---- Auth ----
export type { User } from 'firebase/auth'

export async function signInWithGoogle() {
  try {
    const auth = await getAppAuth()
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Sign-in failed'
    throw new Error(msg.includes('popup') ? 'Sign-in popup was blocked or closed. Try again.' : msg)
  }
}

export async function signOutUser(): Promise<void> {
  try {
    const auth = await getAppAuth()
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  } catch (e: unknown) {
    throw new Error('Failed to sign out. Please try again.')
  }
}

export function onAuthChange(callback: (user: any) => void): () => void {
  // Must start listening synchronously when called, but auth load is async
  // Return an unsubscribe function that will be set once auth loads
  let unsubscribe: (() => void) | null = null
  let cancelled = false

  getAppAuth().then(async (auth) => {
    if (cancelled) return
    const { onAuthStateChanged } = await import('firebase/auth')
    if (cancelled) return
    unsubscribe = onAuthStateChanged(auth, callback)
  }).catch(() => {
    callback(null)
  })

  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export async function getCurrentUser() {
  try {
    const auth = await getAppAuth()
    return auth.currentUser
  } catch { return null }
}

// ---- Firestore Sync ----
export async function uploadAllData(uid: string, data: Record<string, any[]>): Promise<void> {
  const db = await getAppFirestore()
  const { doc, writeBatch } = await import('firebase/firestore')
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  for (const [tableName, items] of Object.entries(data)) {
    const ref = doc(db, 'users', uid, 'data', tableName)
    batch.set(ref, { items, updatedAt: now })
  }

  await batch.commit()
}

export async function downloadAllData(uid: string): Promise<Record<string, any[]> | null> {
  const db = await getAppFirestore()
  const { doc, getDoc } = await import('firebase/firestore')
  const tables = [
    'profile', 'dailyLogs', 'workouts', 'mealLogs', 'foods',
    'mealTemplates', 'weeklyPlans', 'bodyMeasurements',
    'benchmarkResults', 'movementPRs', 'achievements', 'heartRateSessions'
  ]

  const result: Record<string, any[]> = {}
  let hasData = false

  for (const tableName of tables) {
    const ref = doc(db, 'users', uid, 'data', tableName)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const d = snap.data()
      result[tableName] = d.items || []
      hasData = true
    }
  }

  return hasData ? result : null
}

export async function getLastSyncTime(uid: string): Promise<string | null> {
  const db = await getAppFirestore()
  const { doc, getDoc } = await import('firebase/firestore')
  const ref = doc(db, 'users', uid, 'meta', 'sync')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data().lastSync || null
  return null
}

export async function setLastSyncTime(uid: string): Promise<void> {
  const db = await getAppFirestore()
  const { doc, setDoc } = await import('firebase/firestore')
  const ref = doc(db, 'users', uid, 'meta', 'sync')
  await setDoc(ref, { lastSync: new Date().toISOString() })
}
