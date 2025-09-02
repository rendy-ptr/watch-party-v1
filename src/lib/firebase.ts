import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Init Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const provider = new GoogleAuthProvider()

const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, provider)
  } catch (error) {
    console.warn('Popup gagal, fallback ke redirect:', error)
    await signInWithRedirect(auth, provider)
    return null
  }
}

const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      return result.user
    }
    return null
  } catch (error) {
    console.error('Redirect login error:', error)
    return null
  }
}

const logout = async () => {
  await signOut(auth)
}

export { auth, provider, loginWithGoogle, handleRedirectResult, logout }
