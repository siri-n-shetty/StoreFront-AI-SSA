
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User as AppUser } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export enum UserRole {
  USER = 'user',
  SELLER = 'seller',
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, pass: string, firstName: string, lastName: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as AppUser);
        } else {
          // This case might happen if user document creation failed during signup
           setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Error signing in:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    window.location.href = '/login';
  };

  const signup = async (email: string, pass: string, firstName: string, lastName: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        email,
        firstName,
        lastName,
        role,
      });

    } catch (error: any) {
       console.error("Error signing up:", error);
       throw new Error(error.message || "Could not sign up user.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
