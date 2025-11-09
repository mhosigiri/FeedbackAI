import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { BASE_URL } from '../api';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  empId: string | null;
  isEmployee: boolean;
  isCustomer: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsCustomer: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isCustomer, setIsCustomer] = useState<boolean>(() => {
    // Restore customer mode from localStorage
    return localStorage.getItem('isCustomer') === 'true';
  });
  
  const isLoggedIn = !!user || isCustomer;
  const isEmployee = !!user && !isCustomer;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setEmpId(u?.uid || null);
      if (u) {
        setIsCustomer(false);
        localStorage.removeItem('isCustomer');
        // Upsert employee profile on backend
        try {
          await fetch(`${BASE_URL}/employees/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: u.uid, name: u.displayName || '', email: u.email || '' }),
          });
        } catch {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      setEmpId(cred.user.uid);
      setIsCustomer(false);
      return true;
    } catch {
      return false;
    }
  };

  const loginAsCustomer = () => {
    setIsCustomer(true);
    setUser(null);
    setEmpId(null);
    localStorage.setItem('isCustomer', 'true');
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    setEmpId(null);
    setIsCustomer(false);
    localStorage.removeItem('isCustomer');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, empId, isEmployee, isCustomer, loading, login, loginAsCustomer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

