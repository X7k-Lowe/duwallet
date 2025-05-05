'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface BiometricPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricPrompt = ({ onSuccess, onCancel }: BiometricPromptProps) => {
  const handleBiometricAuth = async () => {
    console.log('Biometric auth attempt - Not implemented yet');
    // TODO: Implement WebAuthn or Credential API logic
    // Potentially call onSuccess or onCancel based on the result
    onCancel(); // Placeholder
  };

  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-muted-foreground mb-2">または</p>
      <Button variant="outline" onClick={handleBiometricAuth}>
        生体認証でログイン
      </Button>
    </div>
  );
};
