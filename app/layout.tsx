'use client'; // クライアントコンポーネントとしてマーク

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect } from 'react'; // useEffect をインポート
import { supabase } from '@/lib/supabase/client'; // Supabaseクライアントをインポート
import { useAuthStore } from '@/stores/auth-store'; // Authストアをインポート

const inter = Inter({ subsets: ["latin"] });

// export const metadata = { // クライアントコンポーネントでは metadata export は使えないのでコメントアウトまたは削除
//   // 必要に応じてメタデータを記述
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading, setError, setUser, clearAuth } = useAuthStore(); // clearAuth も取得

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange( // data から subscription を取得
      async (event, session) => {
        console.log('onAuthStateChange event:', event, 'session:', session);
        setSession(session); // session が null の場合も user は null になる (auth-store側で対応済み)
        // setUser(session?.user ?? null); // setSession内で対応するため不要な場合もあるが、明示的に更新
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // ログイン成功時の処理 (必要であれば)
        } else if (event === 'SIGNED_OUT') {
          // ログアウト成功時の処理、またはセッションが無効になった場合
          clearAuth(); // ストアをクリア
        } else if (event === 'USER_UPDATED'){
          // ユーザー情報更新時の処理
          setUser(session?.user ?? null); 
        } else if (event === 'PASSWORD_RECOVERY') {
          // パスワード回復時の処理
        } else if (event === 'TOKEN_REFRESHED') {
          // トークンリフレッシュ時の処理
          // setSession(session) は既に呼ばれているので、必要に応じて追加処理
        }
        // USER_DELETED イベントは直接サポートされていない場合があるため、SIGNED_OUTでカバー
      }
    );

    // 初期セッションの取得も試みる
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        setSession(data.session);
        // setUser(data.session.user); // setSession内で対応
      }
      setLoading(false);
    };

    // アプリケーションの初期ロード時に現在のユーザー状態を確認する
    // onAuthStateChangeが初回イベント(INITIAL_SESSION or SIGNED_IN or SIGNED_OUT)を発行するので、
    // getCurrentSessionの呼び出しは必須ではないかもしれないが、確実に初期状態を反映するために残す。
    // ただし、onAuthStateChangeが発火する前にストアが更新されることを避けるため、
    // onAuthStateChangeの登録後に呼び出すか、タイミングを考慮する必要がある。
    // ここでは、まずonAuthStateChangeに任せ、もし初期表示で問題があれば getCurrentSession() を復活させる。
    // setLoading(true) は onAuthStateChange の最初で呼ばれる。

    // getCurrentSession(); // 一旦コメントアウトして onAuthStateChange の挙動に依存させる

    return () => {
      subscription?.unsubscribe(); // 正しい unsubscribe の呼び出し方
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回レンダリング時のみ実行

  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 