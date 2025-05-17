'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error: authError, user, session, clearAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      router.push('/');
    }
  }, [user, session, router]);

  const validateForm = (): boolean => {
    if (!email || !password) {
      setFormError('Eメールとパスワードを入力してください。');
      return false;
    }
    const emailRegex = /^[\s\S]+@[\s\S]+\.[\s\S]+$/;
    if (!emailRegex.test(email)) {
      setFormError('有効なメールアドレスを入力してください。');
      return false;
    }
    return true;
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }
    await signIn(email, password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">duwallet</h1>
        </div>

        {(formError || authError) && <p className="text-red-500 text-sm text-center">{formError || authError}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium text-gray-700">
                ログイン状態を保持する
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            新規ユーザー登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
} 