// @ts-nocheck - UIコンポーネントのスタイル処理のため
import React from 'react';
import { cn } from './utils/cn';

// 新しいJSXトランスフォームを使用するための設定
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const jsx = React.createElement;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ className, type, ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
};
