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

  // React Hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useContext<T>(context: React.Context<T>): T;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function useId(): string;
  export function forwardRef<T, P>(render: (props: P, ref: React.Ref<T>) => React.ReactNode): any;

  // Component Type
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
  }

  export type ElementRef<T> = any;
  export type ComponentPropsWithoutRef<T> = any;

  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
