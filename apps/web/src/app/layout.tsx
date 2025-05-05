import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'DUWALLET - 共同家計簿',
  description: '複数ユーザーが共同で管理する家計簿アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* eslint-disable-next-line react/no-children-prop */}
        <Providers children={<main>{children}</main>} />
      </body>
    </html>
  );
}
