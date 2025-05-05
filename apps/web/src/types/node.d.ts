declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    CI?: string;
    [key: string]: string | undefined;
  }
  
  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process; 