interface Env {
    API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    DEBUG: boolean;
  }
  
  export const env: Env = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    NODE_ENV: (import.meta.env.MODE as 'development' | 'production' | 'test') || 'development',
    DEBUG: import.meta.env.DEV === true,
  };
  
  export const IS_DEV = env.NODE_ENV === 'development';
  export const IS_PROD = env.NODE_ENV === 'production';
  export const IS_TEST = env.NODE_ENV === 'test';