declare module 'class-variance-authority' {
  export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];
  export function cva<T = Record<string, any>>(base: string, config: T): (props?: any) => string;
}

declare module 'clsx' {
  export default function clsx(...inputs: any[]): string;
  export type ClassValue = any;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: (string | undefined | null | false)[]): string;
} 