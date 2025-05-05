// @ts-nocheck - UIコンポーネントのスタイル処理のため
import React from 'react';
import { cn } from './utils/cn';

// 新しいJSXトランスフォームを使用するための設定
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const jsx = React.createElement;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return <div className={cn('rounded-lg border bg-white shadow-sm', className)} {...props} />;
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return <div className={cn('p-6 pb-4', className)} {...props} />;
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
};
