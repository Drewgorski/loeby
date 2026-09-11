import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Same project as D+L Fitness — Drew's account, one bill, one console.
 *
 * This config is not a secret (Firebase web configs are public by design); all
 * of the protection comes from Auth plus the Firestore and Storage rules. Loeby
 * writes under `users/{uid}/...`, which the existing rules already scope to the
 * signed-in owner.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAcQ4RHc_TiUe9Asx6UX1eCUMYkbr00ccU',
  authDomain: 'dl-fitness-tracker.firebaseapp.com',
  projectId: 'dl-fitness-tracker',
  storageBucket: 'dl-fitness-tracker.firebasestorage.app',
  messagingSenderId: '737963919528',
  appId: '1:737963919528:web:b6a6ca20e29d623cff1a9d',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
