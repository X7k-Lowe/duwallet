'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface UseAuthReturn {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: typeof supabase.auth.signInWithPassword;
  signUp: typeof supabase.auth.signUp;
  signOut: typeof supabase.auth.signOut;
}

const supabase = createClient();

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (credentials: Parameters<typeof supabase.auth.signInWithPassword>[0]) => {
      setLoading(true);
      const result = await supabase.auth.signInWithPassword(credentials);
      setLoading(false);
      return result;
    },
    []
  );

  const signUp = useCallback(async (credentials: Parameters<typeof supabase.auth.signUp>[0]) => {
    setLoading(true);
    const result = await supabase.auth.signUp(credentials);
    // Session is typically established after email confirmation for signUp
    setLoading(false);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const result = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
    return result;
  }, []);

  return { session, user, loading, signInWithPassword, signUp, signOut };
}
