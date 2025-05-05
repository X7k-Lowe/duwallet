'use client';

import React from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Logo } from '@/components/ui/Logo';

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
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">新規登録</h1>
        <SignupForm onSuccess={handleSignupSuccess} onError={handleSignupError} />
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
