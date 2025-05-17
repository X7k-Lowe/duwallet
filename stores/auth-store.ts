import { create } from 'zustand';
import { Session, User, AuthError } from '@supabase/supabase-js';

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
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<void>;
}

// Supabaseクライアントのインポート (実際のパスはプロジェクト構成に合わせる)
// import { supabase } from '@/lib/supabase/client'; // この行は後で調整

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  error: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ session: null, user: null, error: null }),
  // 新規登録アクションの実装
  signUp: async (email, password, userData) => {
    set({ loading: true, error: null });
    console.log('Signing up with', email, userData);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ダミーの成功/失敗の分岐
    const FAKE_SUCCESS = true; // これを false に変えてエラーケースを試す
    const dummyUser: User = { id: '123', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
    const dummySession: Session = { access_token: 'dummy-access-token', token_type: 'bearer', user: dummyUser, expires_in: 3600, expires_at: Date.now() + 3600000, refresh_token: 'dummy-refresh-token' };

    if (FAKE_SUCCESS) {
      set({ session: dummySession, user: dummyUser, loading: false, error: null });
    } else {
      // AuthError のダミーインスタンスを作成する代わりに、単に文字列のエラーメッセージを設定
      const DUMMY_ERROR_MESSAGE = "Dummy sign-up error occurred.";
      set({ error: DUMMY_ERROR_MESSAGE, loading: false, session: null, user: null });
    }
  },
}));

// 注意: 上記の signUp 実装はダミーです。
// Supabaseクライアント (`@/lib/supabase/client.ts`) を正しくインポートし、
// 実際の `supabase.auth.signUp` を呼び出すように修正する必要があります。
// また、usersテーブルへのメタデータ保存の戦略 (options.data or Function/Trigger) も確定させる必要があります。 