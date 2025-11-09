import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { BASE_URL } from '../api';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  empId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [empId, setEmpId] = useState<string | null>(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setEmpId(u?.uid || null);
      if (u) {
        // Upsert employee profile on backend
        try {
          await fetch(`${BASE_URL}/employees/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: u.uid, name: u.displayName || '', email: u.email || '' }),
          });
        } catch {}
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      setEmpId(cred.user.uid);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    setEmpId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, empId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

