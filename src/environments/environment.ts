import { Environment } from './environment.interface';

// This is the production environment
// In production, the API base URL should be set to your production backend URL
export const environment: Environment = {
  production: true,
  // Use empty string to use relative URLs in production (same domain)
  apiBaseURL: 'http://localhost:3000',
  enableDebugLogging: false
};
