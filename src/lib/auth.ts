import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

/** undefined while Firebase is still restoring the session; null when signed out. */
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export function signOut() {
  return fbSignOut(auth);
}

/** Firebase's error codes are not something to show a person. */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) {
    return 'That email and password do not match.';
  }
  if (code.includes('email-already-in-use')) return 'That email already has an account — sign in instead.';
  if (code.includes('weak-password')) return 'Password needs to be at least 6 characters.';
  if (code.includes('invalid-email')) return 'That does not look like an email address.';
  if (code.includes('network')) return 'No connection. It will sync when you are back online.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a minute and try again.';
  return 'Could not sign in. Try again.';
}
