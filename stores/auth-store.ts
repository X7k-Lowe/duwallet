import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client'; // 変更: シングルトンクライアントをインポート
import { persist, createJSONStorage } from 'zustand/middleware';
import { Database } from '@/types/supabase';
// import { createBrowserClient } from '@supabase/ssr'; // 削除: ここでは不要

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
  signUp: (email: string, password: string, userData: { user_name: string; gender: string | null; multiple_wallets: boolean; [key: string]: any }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // 削除
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // 削除

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: false,
      error: null,
      setSession: (session) => set({ session, user: session?.user ?? null }), // sessionと一緒にuserも更新
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ session: null, user: null, error: null, loading: false }),
      signUp: async (email, password, userData) => {
        set({ loading: true, error: null });
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: userData.user_name,
              gender: userData.gender,
              multiple_wallets: userData.multiple_wallets,
            },
          },
        });

        if (signUpError) {
          set({ loading: false, error: signUpError.message, user: null, session: null });
          return;
        }

        if (authData.user) { 
          if (!authData.session) {
            // メール認証が有効で、セッションがまだ発行されていない場合
            set({
              loading: false,
              error: "確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。", // ユーザーへの明確なメッセージ
              user: authData.user, // ユーザー情報は一時的に保持するがセッションはnull
              session: null,
            });
            console.log('User signed up, email verification required. Session is null.');
          } else {
            // メール認証が無効、または既に何らかの理由でセッションが発行された場合 (通常は onAuthStateChange で処理される)
            set({
              loading: false,
              error: null,
              // user: authData.user, // onAuthStateChange へ移行
              // session: authData.session, // onAuthStateChange へ移行
            });
          }
        } else {
          set({ loading: false, error: 'ユーザー登録に成功しましたが、ユーザーデータが返されませんでした。', user: null, session: null });
        }
      },
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        // const supabase = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!); // 削除

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          set({ loading: false, error: signInError.message, user: null, session: null });
        } else if (data.user && data.session) {
          // onAuthStateChange でセッションとユーザーは設定されるので、ここではエラーがなければ基本的に何もしなくても良い。
          set({
            loading: false,
            error: null,
            // user: data.user, // onAuthStateChange に任せる
            // session: data.session, // onAuthStateChange に任せる
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

// 注意コメントは不要になったので削除

// 注意: 上記の signUp 実装はダミーです。
// Supabaseクライアント (`@/lib/supabase/client.ts`) を正しくインポートし、
// 実際の `supabase.auth.signUp` を呼び出すように修正する必要があります。
// また、usersテーブルへのメタデータ保存の戦略 (options.data or Function/Trigger) も確定させる必要があります。 