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
    // ここで Supabase のクライアントを初期化するか、外部から参照する
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    //   options: {
    //     data: userData, // usersテーブルに保存する追加情報
    //   },
    // });
    // ダミー実装 (後でSupabaseクライアントを正しくセットアップする)
    console.log('Signing up with', email, userData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 疑似的な非同期処理
    const dummySession = { user: { id: '123', email }, expires_at: Date.now() + 3600000 } as any as Session;
    const signUpError: AuthError | null = null; // AuthError 型を使用 or new AuthError('Dummy Error')など

    if (signUpError) {
      set({ error: signUpError.message, loading: false });
    } else if (dummySession && dummySession.user) {
      set({ session: dummySession, user: dummySession.user, loading: false });
      // usersテーブルへの追加情報の保存は、SupabaseのトリガーやEdge Functionで行うか、
      // signUpのoptions.data が期待通り動作するか確認の上、別途APIを叩く必要があるかを検討
    } else {
      // Email confirmation が有効な場合など、sessionやuserがすぐには返らないケースの考慮
      set({ loading: false, error: 'Unexpected state after sign up.' });
    }
  },
}));

// 注意: 上記の signUp 実装はダミーです。
// Supabaseクライアント (`@/lib/supabase/client.ts`) を正しくインポートし、
// 実際の `supabase.auth.signUp` を呼び出すように修正する必要があります。
// また、usersテーブルへのメタデータ保存の戦略 (options.data or Function/Trigger) も確定させる必要があります。 