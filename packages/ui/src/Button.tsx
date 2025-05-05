// @ts-nocheck - UIコンポーネントのクラス変数処理のため
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

// 新しいJSXトランスフォームを使用するための設定
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const jsx = React.createElement;

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        outline: 'border border-primary bg-transparent text-primary hover:bg-gray-50',
        ghost: 'text-gray-800 hover:bg-gray-100',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-sm',
        lg: 'h-12 px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};
