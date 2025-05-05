declare module 'react' {
  import * as CSS from 'csstype';

  export interface ReactNode {
    // ReactNodeの定義
  }

  export function createElement(type: any, props?: any, ...children: any[]): any;

  export interface HTMLAttributes<_T> {
    className?: string;
    style?: CSS.Properties;
    [key: string]: any;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    [key: string]: any;
  }

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: any;
    [key: string]: any;
  }

  export interface HeadingHTMLAttributes<T> extends HTMLAttributes<T> {}
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
