// @ts-nocheck
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

// 新しいJSXトランスフォームを使用するための設定
const jsx = React.createElement;

export const metadata: Metadata = {
  title: 'DUWallet - 共同家計簿',
  description: '複数ユーザーが共同で管理する家計簿アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
