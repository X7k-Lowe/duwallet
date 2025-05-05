'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Import Supabase client

interface AuthStateCheckerProps {
  onAuthenticated: () => void;
  onUnauthenticated: () => void;
}

export const AuthStateChecker = ({
  onAuthenticated,
  onUnauthenticated,
}: AuthStateCheckerProps) => {
  useEffect(() => {
    const supabase = createClient(); // Initialize Supabase client

    const checkAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // const session = null // Placeholder removed
      if (session) {
        onAuthenticated();
      } else {
        onUnauthenticated();
      }
    };

    // Check immediately
    checkAuthState();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        onAuthenticated();
      } else {
        onUnauthenticated();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [onAuthenticated, onUnauthenticated]);

  return null; // This component does not render anything
};
