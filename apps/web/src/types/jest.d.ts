declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function expect(actual: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeInTheDocument(): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(count: number): void;
    toHaveBeenCalledWith(...args: any[]): void;
    toContain(expected: any): void;
    [key: string]: any;
  };
  function beforeEach(fn: () => void): void;
  function afterEach(fn: () => void): void;
  function beforeAll(fn: () => void): void;
  function afterAll(fn: () => void): void;

  namespace jest {
    function fn<T = any>(): jest.Mock<T>;
    function mock(moduleName: string, factory?: any): void;
    function clearAllMocks(): void;
    interface Mock<T = any> {
      (...args: any[]): T;
      mockReturnValue(value: T): this;
      mockResolvedValue(value: T): this;
      mockRejectedValue(error: any): this;
      mockImplementation(implementation: (...args: any[]) => T): this;
      mockClear(): this;
      mock: {
        calls: any[][];
      };
    }
  }
}

export {};
