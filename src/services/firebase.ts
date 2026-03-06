import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut,
  onAuthStateChanged, type User
} from 'firebase/auth'
import {
  getFirestore, doc, setDoc, getDoc, writeBatch,
  type Firestore
} from 'firebase/firestore'

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
  // Check Vite env vars first (set in .env file, never exposed to client localStorage)
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
  // Fall back to localStorage for user-configured setups
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FirebaseConfig
  } catch { return null }
}

export function setFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  // Re-initialize on next call
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

// ---- Lazy initialization ----
let _app: FirebaseApp | null = null
let _auth: ReturnType<typeof getAuth> | null = null
let _db: Firestore | null = null

function ensureApp(): FirebaseApp {
  if (_app) return _app
  const config = getFirebaseConfig()
  if (!config) throw new Error('Firebase not configured. Add your Firebase config in Settings.')
  _app = initializeApp(config)
  return _app
}

export function getAppAuth() {
  if (_auth) return _auth
  _auth = getAuth(ensureApp())
  return _auth
}

export function getAppFirestore() {
  if (_db) return _db
  _db = getFirestore(ensureApp())
  return _db
}

// ---- Auth ----
export async function signInWithGoogle(): Promise<User> {
  try {
    const auth = getAppAuth()
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
    const auth = getAppAuth()
    await fbSignOut(auth)
  } catch (e: unknown) {
    throw new Error('Failed to sign out. Please try again.')
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getAppAuth()
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser(): User | null {
  try {
    const auth = getAppAuth()
    return auth.currentUser
  } catch { return null }
}

// ---- Firestore Sync ----
// Data structure: users/{uid}/data/{tableName} -> { items: [...], updatedAt: timestamp }

export async function uploadAllData(uid: string, data: Record<string, any[]>): Promise<void> {
  const db = getAppFirestore()
  const batch = writeBatch(db)
  const now = new Date().toISOString()

  for (const [tableName, items] of Object.entries(data)) {
    const ref = doc(db, 'users', uid, 'data', tableName)
    batch.set(ref, { items, updatedAt: now })
  }

  await batch.commit()
}

export async function downloadAllData(uid: string): Promise<Record<string, any[]> | null> {
  const db = getAppFirestore()
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
      result[tableName] = Array.isArray(d.items) ? d.items : []
      hasData = true
    }
  }

  return hasData ? result : null
}

export async function getLastSyncTime(uid: string): Promise<string | null> {
  const db = getAppFirestore()
  const ref = doc(db, 'users', uid, 'meta', 'sync')
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const lastSync = snap.data().lastSync
    return typeof lastSync === 'string' ? lastSync : null
  }
  return null
}

export async function setLastSyncTime(uid: string): Promise<void> {
  const db = getAppFirestore()
  const ref = doc(db, 'users', uid, 'meta', 'sync')
  await setDoc(ref, { lastSync: new Date().toISOString() })
}
