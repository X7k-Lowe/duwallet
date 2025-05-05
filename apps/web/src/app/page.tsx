// @ts-nocheck
import React from 'react';

// 新しいJSXトランスフォームを使用するための設定
const jsx = React.createElement;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">DUWallet</h1>
      <p className="text-xl mb-8">複数ユーザーが共同で管理する家計簿アプリ</p>
      <div className="space-x-4">
        <a
          href="/login"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          ログイン
        </a>
        <a
          href="/signup"
          className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-gray-50 transition-colors"
        >
          アカウント作成
        </a>
      </div>
    </div>
  );
}
