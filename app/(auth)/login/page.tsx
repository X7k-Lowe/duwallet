'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement login logic using useAuthStore and Supabase
    console.log('Login form submitted');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">duwallet</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Eメール</Label>
            <Input type="email" id="email" name="email" required />
          </div>

          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input type="password" id="password" name="password" required />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" name="rememberMe" />
              <Label htmlFor="rememberMe" className="text-sm font-medium text-gray-700">
                ログイン状態を保持する
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            ログイン
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