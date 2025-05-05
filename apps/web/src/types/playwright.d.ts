declare module '@playwright/test' {
  export function test(name: string, fn: (arg: { page: any }) => Promise<void>): void;
  export function expect(actual: any): {
    toBeTruthy(): void;
    toBeFalsy(): void;
    toEqual(expected: any): void;
    [key: string]: any;
  };

  export interface PlaywrightTestConfig {
    testDir?: string;
    timeout?: number;
    forbidOnly?: boolean;
    retries?: number;
    use?: any;
    reporter?: string | string[];
    [key: string]: any;
  }
}
