import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBrowserClient } from '@supabase/ssr'; // createClientComponentClient から変更

interface Wallet {
  id: string;
  name: string;
  // 必要に応じて他の家計簿情報（例：作成日、最終更新日など）も追加可能
}

// Supabaseからの応答型を定義 (より厳密な型付けのため)
interface WalletMemberResponse {
  wallet_id: string;
  wallets: {
    id: string;
    name: string;
  } | null; // walletsテーブルとのjoin結果なのでnullの可能性も考慮
}

interface WalletState {
  activeWalletId: string | null;
  activeWalletName: string | null;
  wallets: Wallet[];
  setActiveWallet: (id: string, name: string) => void;
  loadWallets: (userId: string) => Promise<void>;
  clearActiveWallet: () => void;
  clearAllWallets: () => void; // ログアウト時などに使用
  isLoading: boolean;
  error: string | null;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      activeWalletId: null,
      activeWalletName: null,
      wallets: [],
      isLoading: false,
      error: null,

      setActiveWallet: (id, name) => {
        set({ 
          activeWalletId: id, 
          activeWalletName: name,
          error: null,
        });
      },

      loadWallets: async (userId: string) => {
        if (!userId) {
          set({ wallets: [], activeWalletId: null, activeWalletName: null, isLoading: false, error: 'User ID is required to load wallets.' });
          return;
        }
        // NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY は環境変数から読み込まれる想定
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        set({ isLoading: true, error: null });

        try {
          const { data, error: dbError } = await supabase
            .from('wallet_members') 
            .select(`
              wallet_id,
              wallets!inner (
                id,
                name
              )
            `)
            .eq('user_id', userId)
            .returns<WalletMemberResponse[]>(); // 戻り値の型を指定

          if (dbError) {
            console.error('Supabase error loading wallets:', dbError.message);
            set({ wallets: [], activeWalletId: null, activeWalletName: null, isLoading: false, error: `Failed to load wallets: ${dbError.message}` });
            return;
          }

          const walletList: Wallet[] = data
            ?.filter((item): item is WalletMemberResponse & { wallets: { id: string; name: string } } => item.wallets !== null)
            .map(item => ({
              id: item.wallets.id,
              name: item.wallets.name,
            })) || [];

          set({ wallets: walletList, isLoading: false, error: null });

          const { activeWalletId, wallets: currentWallets } = get();
          // アクティブなウォレットがリストに存在しない場合、または削除された場合はクリア
          if (activeWalletId && !currentWallets.find(w => w.id === activeWalletId)) {
            set({ activeWalletId: null, activeWalletName: null });
          } else if (!activeWalletId && currentWallets.length > 0) {
            // アクティブなウォレットが未設定で、ウォレットが1つ以上ある場合
            //   ユーザー設定に応じて、自動選択または選択画面へ誘導するための準備 (ここでは一旦最初のものを選択)
            // TODO: ユーザーが「単一の家計簿のみ参加」設定の場合のみ自動選択するロジックを middleware.ts や呼び出し元で考慮
            set({
              activeWalletId: currentWallets[0].id,
              activeWalletName: currentWallets[0].name,
            });
          }

        } catch (error: any) {
          console.error('Failed to load or process wallets:', error);
          set({ wallets: [], activeWalletId: null, activeWalletName: null, isLoading: false, error: `An unexpected error occurred: ${error.message}` });
        }
      },
      clearActiveWallet: () => set({ activeWalletId: null, activeWalletName: null, error: null }),
      clearAllWallets: () => set({ wallets: [], activeWalletId: null, activeWalletName: null, isLoading: false, error: null })
    }),
    {
      name: 'wallet-storage', // localStorage のキー名
      // storage: createJSONStorage(() => localStorage), // デフォルトで localStorage を使用
    }
  )
); 