'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'; // 修正
import { useWalletStore } from '@/stores/wallet-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUserSettingsStore } from '@/stores/user-settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, /*CardDescription,*/ CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescriptionは通常別、またはCardHeader/Contentで表現
import { Label } from '@/components/ui/label';
// import { toast } from '@/components/ui/use-toast';

export default function WalletSelectPage() {
  const router = useRouter();
  const supabase = createBrowserClient( // 修正
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    activeWalletId,
    wallets,
    isLoading: isLoadingWallets,
    error: walletError,
    loadWallets,
    setActiveWallet,
    clearAllWallets,
  } = useWalletStore();
  const { session, clearAuth } = useAuthStore(); // clearSession から clearAuth に修正
  const { isMultiWalletEnabled } = useUserSettingsStore();

  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      loadWallets(session.user.id);
      const fetchPendingRequests = async () => {
        const { count, error } = await supabase
          .from('wallet_join_requests')
          .select('* ', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('status', 'pending');
        if (error) {
          console.error('Error fetching pending requests count:', JSON.stringify(error, null, 2));
        } else {
          setPendingRequestCount(count || 0);
        }
      };
      fetchPendingRequests();
    }
  }, [session, loadWallets, supabase]);

  useEffect(() => {
    if (activeWalletId && wallets.length > 0 && !isMultiWalletEnabled) {
      router.push('/wallet');
    }
  }, [activeWalletId, wallets, isMultiWalletEnabled, router]);

  const handleSelectWallet = (walletId: string, walletName: string) => {
    setActiveWallet(walletId, walletName);
    router.push('/wallet');
  };

  const handleCreateWallet = () => {
    router.push('/wallet/create');
  };

  const handleGoToUserSettings = () => {
    router.push('/user/settings?return_screen=/wallet/select');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      clearAuth(); // clearSession から clearAuth に修正
      clearAllWallets();
      router.push('/login');
    }
  };

  const handleJoinWallet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!joinCode.trim() || !session?.user) return;
    setIsJoining(true);
    setJoinError(null);

    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, accept_join_requests')
        .eq('join_code', joinCode.trim())
        .single();

      if (walletError || !walletData) {
        setJoinError('無効な参加コードです。コードを確認してください。');
        setIsJoining(false);
        return;
      }

      if (!walletData.accept_join_requests) {
        setJoinError('この家計簿は現在、参加申請を受け付けていません。');
        setIsJoining(false);
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('wallet_members')
        .select('id')
        .eq('wallet_id', walletData.id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (memberData) {
        setJoinError('既にこの家計簿のメンバーです。');
        setIsJoining(false);
        return;
      }
      
      const { data: requestData, error: requestError } = await supabase
        .from('wallet_join_requests')
        .select('id')
        .eq('wallet_id', walletData.id)
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (requestError) throw requestError;
      if (requestData) {
        setJoinError('既にこの家計簿への参加を申請済みです。承認をお待ちください。');
        setIsJoining(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('wallet_join_requests')
        .insert({
          user_id: session.user.id,
          wallet_id: walletData.id,
          status: 'pending',
          join_code: joinCode.trim(),
        });

      if (insertError) throw insertError;

      alert('参加申請を送信しました。管理者の承認をお待ちください。');
      setJoinCode('');
      setPendingRequestCount(prev => prev + 1);

    } catch (error: any) {
      console.error('Join wallet error:', error);
      setJoinError(`申請処理中にエラーが発生しました: ${error.message || '不明なエラー'}`);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoadingWallets) {
    return <div className="p-4">家計簿情報を読み込み中...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">家計簿選択</CardTitle>
          {walletError && <p className="text-red-500 text-sm">エラー: {walletError}</p>}
        </CardHeader>
        <CardContent>
          {wallets.length === 0 && !isLoadingWallets && (
            <p className="text-muted-foreground mb-4">
              まだ家計簿に参加していません。新しく作成するか、参加コードで既存の家計簿に参加しましょう。
            </p>
          )}
          {pendingRequestCount > 0 && (
            <p className="text-blue-600 bg-blue-100 p-3 rounded-md mb-4">
              申請中の家計簿: {pendingRequestCount}件 (承認されるまでお待ちください)
            </p>
          )}
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{wallet.name}</CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => handleSelectWallet(wallet.id, wallet.name)} className="w-full">
                    選択して開く
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>参加コードで参加</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinWallet} className="space-y-4">
            <div>
              <Label htmlFor="joinCode">参加コード</Label>
              <Input 
                id="joinCode" 
                type="text" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value)} 
                placeholder="参加コードを入力"
                required 
              />
            </div>
            {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
            <Button type="submit" disabled={isJoining || !joinCode.trim()} className="w-full">
              {isJoining ? '申請処理中...' : '参加申請'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Button onClick={handleCreateWallet} variant="default" className="w-full text-lg py-6">
          新しい家計簿を作成
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleGoToUserSettings} variant="outline">
            ユーザー設定
          </Button>
          <Button onClick={handleLogout} variant="outline">
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
} 