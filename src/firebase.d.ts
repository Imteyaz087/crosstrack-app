/* Firebase modular SDK — subpath module declarations for TypeScript */
declare module 'firebase/app' {
  interface FirebaseApp {
    name: string
  }
  export function initializeApp(options: object): FirebaseApp
  export type { FirebaseApp }
}

declare module 'firebase/auth' {
  interface User {
    uid: string
    email: string | null
    displayName: string | null
  }
  export function getAuth(app?: import('firebase/app').FirebaseApp): { currentUser: User | null }
  export function signInWithPopup(auth: unknown, provider: unknown): Promise<{ user: User }>
  export function signOut(auth: unknown): Promise<void>
  export function onAuthStateChanged(auth: unknown, cb: (u: User | null) => void): () => void
  export class GoogleAuthProvider {}
  export type { User }
}

declare module 'firebase/firestore' {
  interface Firestore {}
  interface DocumentReference {}
  export function getFirestore(app?: import('firebase/app').FirebaseApp): Firestore
  export function doc(db: Firestore, ...path: string[]): DocumentReference
  export function getDoc(ref: DocumentReference): Promise<{ exists: () => boolean; data: () => Record<string, unknown> }>
  export function setDoc(ref: DocumentReference, data: object): Promise<void>
  export function writeBatch(db: Firestore): {
    set(ref: DocumentReference, data: object): void
    commit(): Promise<void>
  }
  export type { Firestore }
}
