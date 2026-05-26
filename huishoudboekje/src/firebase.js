import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCvEsNLzaIV1QptIo8QRQ6zv8sSTIskF9M',
  authDomain: 'adjs-95592.firebaseapp.com',
  projectId: 'adjs-95592',
  storageBucket: 'adjs-95592.firebasestorage.app',
  messagingSenderId: '54863312015',
  appId: '1:54863312015:web:a276a96b0483503ebcacfa',
  measurementId: 'G-PLNT91VDDJ',
}

export const app = initializeApp(firebaseConfig)

export const analytics = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
)
