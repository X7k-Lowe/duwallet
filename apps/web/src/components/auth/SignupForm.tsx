'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client'; // Import Supabase client
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Note: Added password confirmation
const signupSchema = z
  .object({
    email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
    password: z.string().min(6, { message: 'パスワードは6文字以上である必要があります。' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'パスワード確認は6文字以上である必要があります。' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません。',
    path: ['confirmPassword'], // Set error on confirmPassword field
  });

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const SignupForm = ({ onSuccess, onError }: SignupFormProps) => {
  const supabase = createClient(); // Initialize Supabase client
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Redirect URL after email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      // const error = null // Placeholder removed

      if (error) {
        onError(error.message); // Use actual error message
        // onError('Signup failed') // Placeholder removed
      } else {
        // Show a message to the user to check their email for confirmation
        // Typically, you don't call onSuccess immediately after signUp
        // unless email confirmation is disabled in Supabase settings.
        alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
        // onSuccess() // Maybe call onSuccess after successful signup without confirmation?
      }
    } catch (err) {
      console.error('Signup error:', err);
      onError('予期せぬエラーが発生しました。');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-8">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <FormControl>
              <Input placeholder="you@example.com" {...field} />
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
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>パスワード (確認用)</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
        {form.formState.isSubmitting ? '登録中...' : '登録する'}
      </Button>
    </form>
  );
};
