import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@/lib/supabase/client'; // この行を削除
import { persist, createJSONStorage } from 'zustand/middleware';
import { Database } from '@/types/supabase'; // types/supabase.ts からインポート
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // この行を削除
import { createBrowserClient } from '@supabase/ssr'; // この行を追加

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  signUp: (email: string, password: string, userData: { user_name: string; gender: string | null;[key: string]: any }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: false,
      error: null,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ session: null, user: null, error: null, loading: false }),
      signUp: async (email, password, userData) => {
        set({ loading: true, error: null });
        if (!supabaseUrl || !supabaseAnonKey) {
          set({ loading: false, error: 'Supabase URL or Anon Key is not defined.' });
          return;
        }
        const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey); // 変更
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: userData.user_name,
              gender: userData.gender,
            },
          },
        });

        if (signUpError) {
          set({ loading: false, error: signUpError.message, user: null, session: null });
          return;
        }

        if (authData.user && authData.session) {
          set({
            loading: false,
            user: authData.user,
            session: authData.session,
            error: null,
          });
        } else if (authData.user && !authData.session) {
          set({
            loading: false,
            user: authData.user,
            session: null, 
            error: null, 
          });
        } else {
          set({ loading: false, error: 'Sign up successful, but no user data returned.', user: null, session: null });
        }
      },
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        if (!supabaseUrl || !supabaseAnonKey) {
          set({ loading: false, error: 'Supabase URL or Anon Key is not defined.' });
          return;
        }
        const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey); // 変更

        const { data, error: signInError } = await supabase.auth.signInWithPassword({ // error 変数名を signInError に変更
          email,
          password,
        });

        if (signInError) {
          set({ loading: false, error: signInError.message, user: null, session: null });
        } else if (data.user && data.session) {
          set({
            loading: false,
            user: data.user,
            session: data.session,
            error: null,
          });
        } else {
          set({
            loading: false,
            error: 'Login failed. User or session data is missing.',
            user: null,
            session: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// 注意: 上記の signUp 実装はダミーです。
// Supabaseクライアント (`@/lib/supabase/client.ts`) を正しくインポートし、
// 実際の `supabase.auth.signUp` を呼び出すように修正する必要があります。
// また、usersテーブルへのメタデータ保存の戦略 (options.data or Function/Trigger) も確定させる必要があります。 