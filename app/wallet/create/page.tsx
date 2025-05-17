'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useAuthStore } from '@/stores/auth-store';
import { useWalletStore } from '@/stores/wallet-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid'; // 参加コードの自動生成用

export default function CreateWalletPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { session } = useAuthStore();
  const { setActiveWallet, loadWallets } = useWalletStore();

  const [walletName, setWalletName] = useState('');
  const [acceptJoinRequests, setAcceptJoinRequests] = useState(true);
  const [joinCodeType, setJoinCodeType] = useState<'auto' | 'manual'>('auto');
  const [manualJoinCode, setManualJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateJoinCode = () => {
    return uuidv4().slice(0, 8); // 8文字のランダムなコード
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) {
      setError('ユーザー認証が必要です。');
      return;
    }
    if (!walletName.trim()) {
      setError('家計簿名を入力してください。');
      return;
    }
    if (joinCodeType === 'manual' && !manualJoinCode.trim()) {
      setError('参加コード（手動）を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    const newWalletId = uuidv4();
    const finalJoinCode = joinCodeType === 'auto' ? generateJoinCode() : manualJoinCode.trim();

    try {
      // 1. wallets テーブルに新しい家計簿を挿入
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert({
          id: newWalletId,
          name: walletName.trim(),
          created_by_user_id: session.user.id,
          accept_join_requests: acceptJoinRequests,
          join_code: finalJoinCode,
        })
        .select()
        .single();

      if (walletError) throw walletError;
      if (!walletData) throw new Error('家計簿の作成に失敗しました。');

      // 2. wallet_members テーブルに作成者を管理者として挿入
      const { error: memberError } = await supabase
        .from('wallet_members')
        .insert({
          wallet_id: newWalletId,
          user_id: session.user.id,
          role: 'admin', // 'admin' or '管理ユーザー' (DBスキーマ定義に合わせる)
        });

      if (memberError) {
        // ロールバック処理の検討: 作成したwalletを削除するなど
        console.error('メンバー登録に失敗。ロールバック処理が必要になるかもしれません。', memberError);
        throw memberError;
      }

      // 3. ストアを更新し、新しい家計簿をアクティブにする
      await loadWallets(session.user.id); // ウォレットリストを再読み込み
      setActiveWallet(newWalletId, walletData.name);

      // toast({ title: "家計簿が作成されました！", description: walletData.name });
      router.push('/wallet'); // 家計簿ホームへ遷移

    } catch (err: any) {
      console.error('Create wallet error:', err);
      setError(err.message || '家計簿の作成中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">新しい家計簿を作成</CardTitle>
          <CardDescription>
            家計簿名と参加設定を入力してください。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && <p className="text-red-500 text-sm p-3 bg-red-100 rounded-md">エラー: {error}</p>}
            
            <div className="space-y-2">
              <Label htmlFor="walletName">家計簿名</Label>
              <Input
                id="walletName"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="例: 〇〇家の家計簿"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptJoinRequests"
                checked={acceptJoinRequests}
                onCheckedChange={setAcceptJoinRequests}
                disabled={isLoading}
              />
              <Label htmlFor="acceptJoinRequests">参加申請を受け付ける</Label>
            </div>

            <div className="space-y-3">
              <Label>参加コード設定</Label>
              <RadioGroup
                value={joinCodeType}
                onValueChange={(value: 'auto' | 'manual') => setJoinCodeType(value)}
                className="space-y-1"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="autoCode" />
                  <Label htmlFor="autoCode">自動発行する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manualCode" />
                  <Label htmlFor="manualCode">手動で設定する</Label>
                </div>
              </RadioGroup>
              {joinCodeType === 'manual' && (
                <div className="pl-6 pt-2 space-y-2">
                  <Label htmlFor="manualJoinCodeInput">参加コード (手動)</Label>
                  <Input
                    id="manualJoinCodeInput"
                    value={manualJoinCode}
                    onChange={(e) => setManualJoinCode(e.target.value)}
                    placeholder="任意の参加コード"
                    required={joinCodeType === 'manual'}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '作成中...' : '家計簿を作成'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 