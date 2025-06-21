import { Environment } from './environment.interface';

// This is the development environment
export const environment: Environment = {
  production: false,
  // Empty string to use relative URLs with proxy in development
  apiBaseURL: 'http://localhost:3000',
  // Enable detailed logging for debugging
  enableDebugLogging: true
};
