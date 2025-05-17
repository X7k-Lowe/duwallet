'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

export default function RegisterPage() {
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implement registration logic using useAuthStore and Supabase
    console.log('Registration form submitted');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">ユーザー登録</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <Label htmlFor="email">Eメール</Label>
            <Input type="email" id="email" name="email" required />
          </div>

          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input type="password" id="password" name="password" required />
          </div>

          <div>
            <Label htmlFor="passwordConfirm">パスワード（確認）</Label>
            <Input type="password" id="passwordConfirm" name="passwordConfirm" required />
          </div>

          <div>
            <Label htmlFor="userName">名前</Label>
            <Input type="text" id="userName" name="userName" required />
          </div>

          <div>
            <Label>性別</Label>
            <RadioGroup name="gender" className="flex space-x-4">
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
            <Label>複数家計簿への参加</Label>
            <RadioGroup name="multipleWallets" defaultValue="false" className="flex space-x-4">
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
            <Button type="submit" className="w-full sm:flex-1">
              登録
            </Button>
            <Button type="button" variant="outline" className="w-full sm:flex-1 as_child">
              <Link href="/login">キャンセル</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 