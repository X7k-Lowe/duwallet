declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
}

declare namespace React {
  interface ReactNode {
    [key: string]: any;
  }
}

declare global {
  namespace JSX {
    interface Element {
      [key: string]: any;
    }
  }
} 