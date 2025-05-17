'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import React, { useState, useEffect } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading, error: authError, user, session, clearAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [multipleWallets, setMultipleWallets] = useState('false');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      clearAuth();
    };
  }, [clearAuth]);

  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (user && session) {
      router.push('/select');
    } else if (user && !session && !authError && !loading) {
      setFormError('ユーザー登録は完了しましたが、セッションの取得に失敗しました。再度ログインをお試しください。');
    }
  }, [user, session, authError, loading, router]);

  const validateForm = (): boolean => {
    if (!email || !password || !passwordConfirm || !userName) {
      setFormError('すべての必須項目を入力してください。');
      return false;
    }
    const emailRegex = /^[\\s\\S]+@[\\s\\S]+\\.[\\s\\S]+$/;
    if (!emailRegex.test(email)) {
      setFormError('有効なメールアドレスを入力してください。');
      return false;
    }
    if (password.length < 8) {
      setFormError('パスワードは8文字以上で入力してください。');
      return false;
    }
    if (password !== passwordConfirm) {
      setFormError('パスワードが一致しません。');
      return false;
    }
    return true;
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    const userData = {
      user_name: userName,
      gender: gender || null,
    };

    await signUp(email, password, userData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">ユーザー登録</h1>
        </div>

        {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
        {authError && !formError && <p className="text-red-500 text-sm text-center">{authError}</p>}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <Label htmlFor="email">Eメール</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="passwordConfirm">パスワード（確認）</Label>
            <Input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="userName">名前</Label>
            <Input
              type="text"
              id="userName"
              name="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>性別</Label>
            <RadioGroup
              name="gender"
              value={gender}
              onValueChange={setGender}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">男性</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">女性</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">その他</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>複数家計簿への参加希望</Label>
            <RadioGroup
              name="multipleWallets"
              value={multipleWallets}
              onValueChange={setMultipleWallets}
              defaultValue="false"
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="multipleTrue" />
                <Label htmlFor="multipleTrue">複数の家計簿に参加する</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="multipleFalse" />
                <Label htmlFor="multipleFalse">一つの家計簿のみに参加する</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button type="submit" className="w-full sm:flex-1" disabled={loading}>
              {loading ? '登録中...' : '登録'}
            </Button>
            <Button type="button" variant="outline" className="w-full sm:flex-1 asChild" disabled={loading}>
              <Link href="/login">キャンセル</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 