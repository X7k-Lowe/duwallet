import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserSettingsState {
  isMultiWalletEnabled: boolean;
  setMultiWalletEnabled: (enabled: boolean) => void;
  // 今後、テーマ設定（ライト/ダーク）や通知設定なども追加可能
}

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      isMultiWalletEnabled: true, // デフォルトでは複数家計簿への参加を許可
      setMultiWalletEnabled: (enabled) => set({ isMultiWalletEnabled: enabled }),
    }),
    {
      name: 'user-settings-storage', // localStorageのキー名 (ドキュメントと統一)
      storage: createJSONStorage(() => localStorage), // 明示的にlocalStorageを指定
    }
  )
); 