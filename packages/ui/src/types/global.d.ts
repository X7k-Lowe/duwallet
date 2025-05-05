declare module 'react' {
  import * as CSS from 'csstype';

  export interface ReactNode {
    // ReactNodeの定義
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createElement(type: any, props?: any, ...children: any[]): any;

  export interface HTMLAttributes<T> {
    className?: string;
    style?: CSS.Properties;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface HeadingHTMLAttributes<T> extends HTMLAttributes<T> {}
}

declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
  }
}

declare module 'csstype' {
  interface Properties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
