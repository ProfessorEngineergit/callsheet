import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserDoc, getUserDoc } from '@/lib/db';
import type { AppUser } from '@/types';
import { colorFromString, getInitials } from '@/lib/utils';
import { isAllowedUser } from '@/lib/allowlist';

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  allowed: boolean;
  loginEmail: (email: string, pw: string) => Promise<void>;
  registerEmail: (email: string, pw: string, name: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function ensureUserDoc(user: User, displayName?: string): Promise<AppUser> {
  const existing = await getUserDoc(user.uid);
  if (existing) return existing;
  const name = displayName || user.displayName || user.email?.split('@')[0] || 'Nutzer';
  const appUser: AppUser = {
    uid: user.uid,
    name,
    email: user.email || '',
    role: 'member',
    color: colorFromString(name),
    initials: getInitials(name),
    createdAt: Date.now(),
  };
  await createUserDoc(appUser);
  return appUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ok = isAllowedUser(u);
        setAllowed(ok);
        if (ok) {
          try {
            setAppUser(await ensureUserDoc(u));
          } catch {
            setAppUser(null);
          }
        } else {
          setAppUser(null);
        }
      } else {
        setAllowed(false);
        setAppUser(null);
      }
      setLoading(false);
    });
  }, []);

  const value: AuthState = {
    user,
    appUser,
    loading,
    allowed,
    loginEmail: async (email, pw) => {
      await signInWithEmailAndPassword(auth, email, pw);
    },
    registerEmail: async (email, pw, name) => {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await ensureUserDoc(cred.user, name);
    },
    loginGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
    },
    logout: async () => {
      await signOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
