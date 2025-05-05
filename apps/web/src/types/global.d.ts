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

  // React Hooks
  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (newState: T | ((prevState: T) => T)) => void];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: ReadonlyArray<any>
  ): T;
  export function useContext<T>(context: React.Context<T>): T;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function useId(): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function forwardRef<T, P>(render: (props: P, ref: React.Ref<T>) => React.ReactNode): any;

  // Component Type
  export type FC<P = Record<string, unknown>> = FunctionComponent<P>;
  export interface FunctionComponent<P = Record<string, unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: P, context?: any): React.ReactElement<any, any> | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ElementRef<T> = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ComponentPropsWithoutRef<T> = any;

  export namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elemName: string]: any;
    }
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
  }
}
