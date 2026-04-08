import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp
};
export type { FirebaseUser };

export const ADMIN_EMAIL = "sherwinsheru@gmail.com";

export async function ensureUserExists(user: FirebaseUser) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const role = user.email === ADMIN_EMAIL ? 'admin' : 'student';
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: role,
      createdAt: serverTimestamp()
    });
    return role;
  }
  return userSnap.data().role;
}
