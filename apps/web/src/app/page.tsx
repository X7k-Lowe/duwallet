'use client';

import { useRouter } from 'next/navigation';
import { AuthStateChecker } from '@/components/auth/AuthStateChecker';
import { Logo } from '@/components/ui/Logo';

export default function SplashPage() {
  const router = useRouter();

  const handleAuthenticated = () => {
    router.replace('/books'); // Use replace to avoid adding splash to history
  };

  const handleUnauthenticated = () => {
    router.replace('/login'); // Use replace
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Logo />
      <p className="mt-4 text-muted-foreground">読み込み中...</p>
      <AuthStateChecker
        onAuthenticated={handleAuthenticated}
        onUnauthenticated={handleUnauthenticated}
      />
    </div>
  );
}
