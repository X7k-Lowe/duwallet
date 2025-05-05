'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { BiometricPrompt } from '@/components/auth/BiometricPrompt';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/books');
  };

  const handleLoginError = (message: string) => {
    alert(`Login failed: ${message}`);
  };

  const handleBiometricSuccess = () => {
    router.push('/books');
  };

  const handleBiometricCancel = () => {
    console.log('Biometric auth cancelled');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">ログイン</h1>
        <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />
        <BiometricPrompt onSuccess={handleBiometricSuccess} onCancel={handleBiometricCancel} />
        <div className="mt-4 text-center text-sm">
          アカウントをお持ちでないですか？{' '}
          <Link href="/signup" className="underline">
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}
