import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Cek dulu apakah sudah ada app yang diinisialisasi
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getDatabase(app)
const provider = new GoogleAuthProvider()

export async function signInWithGooglePopup(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (err) {
    console.error('Popup login error:', err)
    return null
  }
}
