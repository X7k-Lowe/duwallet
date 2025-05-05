'use client';

import React from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  // const router = useRouter();

  const handleSignupSuccess = () => {
    console.log('Signup process initiated. Check email.');
  };

  const handleSignupError = (message: string) => {
    alert(`Signup failed: ${message}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold">新規登録</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
              パスワード（確認）
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded border p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            登録
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="underline">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
