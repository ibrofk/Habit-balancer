import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC13psrZ9Uano4sf71mm8vTkxqgyAZq9DQ",
  authDomain: "hale-courage-437710-j8.firebaseapp.com",
  databaseURL: "https://hale-courage-437710-j8-default-rtdb.firebaseio.com",
  projectId: "hale-courage-437710-j8",
  storageBucket: "hale-courage-437710-j8.firebasestorage.app",
  messagingSenderId: "1049464856968",
  appId: "1:1049464856968:web:9b015611c32799c498da3d",
  measurementId: "G-BKRWC9ZFQB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

export default app;
