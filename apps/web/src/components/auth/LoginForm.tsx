'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上である必要があります。' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const supabase = createClient();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        onError(error.message);
        return;
      }
      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      onError('予期せぬエラーが発生しました。');
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-sm space-y-8"
      data-testid="login-form"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <FormControl>
              <Input data-testid="email-input" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>パスワード</FormLabel>
            <FormControl>
              <Input
                data-testid="password-input"
                type="password"
                placeholder="••••••••"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full"
        data-testid="login-button"
      >
        {form.formState.isSubmitting ? 'ログイン中...' : 'ログイン'}
      </Button>
    </form>
  );
};
