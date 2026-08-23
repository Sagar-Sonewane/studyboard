import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  displayName: string;
  isConfigured: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // Dev mode helper for offline testing
  setDevUser: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_STORAGE_KEY = 'studysync_dev_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Restore dev user if Supabase is not configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const storedDev = localStorage.getItem(DEV_STORAGE_KEY);
      if (storedDev) {
        try {
          const parsed = JSON.parse(storedDev);
          setDisplayName(parsed.name || 'Dev Host');
          setUser({
            id: parsed.id || 'dev-host-001',
            email: parsed.email || 'host@studysync.local',
            user_metadata: { display_name: parsed.name || 'Dev Host' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User);
        } catch {}
      }
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const name =
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';
        setDisplayName(name);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const name =
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';
        setDisplayName(name);
      } else {
        setDisplayName('');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured') };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEV_STORAGE_KEY);
    setUser(null);
    setSession(null);
    setDisplayName('');
  };

  const setDevUser = (name: string) => {
    if (!name.trim()) {
      localStorage.removeItem(DEV_STORAGE_KEY);
      setUser(null);
      setDisplayName('');
      return;
    }
    const devUserObj = {
      id: crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000001',
      name: name.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, '')}@studysync.local`,
    };
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(devUserObj));
    setDisplayName(devUserObj.name);
    setUser({
      id: devUserObj.id,
      email: devUserObj.email,
      user_metadata: { display_name: devUserObj.name },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User);
  };

  const token = session?.access_token || (user ? `dev-user-token:${user.id}:${displayName}` : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        displayName,
        isConfigured: isSupabaseConfigured,
        loading,
        signIn,
        signUp,
        signOut,
        setDevUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
