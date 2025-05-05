// @ts-nocheck - tailwindマージユーティリティのため
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合するユーティリティ
 * clsxでクラス名を結合し、tailwind-mergeで最適化
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
