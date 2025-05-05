// @ts-nocheck
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ClassValue = string | number | ClassValue[] | Record<string, any> | undefined | null | false;

/**
 * クラス名を結合するユーティリティ
 * clsxでクラス名を結合し、tailwind-mergeで最適化
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
