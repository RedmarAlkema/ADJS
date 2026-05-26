import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase'

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export function signInAsGuest() {
  return signInAnonymously(auth)
}

export function signOut() {
  return firebaseSignOut(auth)
}
