// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AuthData } from '../../features/auth/models';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { User, LoginResponse } from '../../features/dashboard/users/models';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/actions/auth.actions';
import { selectAuthUser } from '../../store/selectors/auth.selectors';

// Helper function for debug logging
const debugLog = (...args: any[]): void => {
  if (environment.enableDebugLogging) {
    console.debug('[AuthService]', ...args);
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  public authUser$: Observable<User | null>;
  private apiURL = environment.apiBaseURL;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private store: Store
  ) {
    this.authUser$ = this.store.select(selectAuthUser);
  }

  login(data: AuthData): Observable<User> {
    // Try with and without /api prefix since we have pathRewrite in proxy
    const loginUrl = `${this.apiURL}/api/users/login`;
    debugLog('Attempting login with URL:', loginUrl);
    
    return this.httpClient
      .post<LoginResponse>(
        loginUrl,
        {
          email: data.email,
          password: data.password
        },
        { 
          observe: 'response',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .pipe(
        map(response => {
          if (!response.body) {
            throw new Error('No response body received from server');
          }
          
          // Handle different response formats
          const responseBody = response.body as any;
          let token: string | undefined;
          let userData: Partial<User> = {};
          
          // Check for token in different possible locations
          if (responseBody.token) {
            token = responseBody.token;
            userData = { ...responseBody };
            delete userData.token;
          } else if (responseBody.data?.token) {
            token = responseBody.data.token;
            userData = { ...responseBody.data };
            delete userData.token;
          } else if (responseBody.access_token) {
            token = responseBody.access_token;
            userData = { ...responseBody };
            delete userData.access_token;
          }
          
          if (!token) {
            throw new Error('No authentication token found in response');
          }
          
          const user: User = {
            _id: userData._id || '',
            email: userData.email || data.email,
            name: userData.name || '',
            lastName: userData.lastName || '',
            role: userData.role || 'user',
            token: token,
            ...userData
          };
          
          debugLog('Login successful, user:', user);
          localStorage.setItem('token', token);
          this.store.dispatch(AuthActions.setAuthenticatedUser({ user }));
          
          return user;
        }),
        catchError((error: HttpErrorResponse) => {
          debugLog('Login error:', error);
          
          let errorMessage = 'Error desconocido';
          
          if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          } else if (error.status === 400 || error.status === 401) {
            // Try to extract error message from different response formats
            const errorResponse = error.error;
            if (typeof errorResponse === 'string') {
              try {
                const parsedError = JSON.parse(errorResponse);
                errorMessage = parsedError.message || parsedError.error || 'Credenciales inválidas';
              } catch (e) {
                errorMessage = errorResponse || 'Credenciales inválidas';
              }
            } else if (errorResponse?.message) {
              errorMessage = errorResponse.message;
            } else if (errorResponse?.error) {
              errorMessage = errorResponse.error;
            } else {
              errorMessage = 'Credenciales inválidas';
            }
          } else if (error.status >= 500) {
            errorMessage = 'Error del servidor. Por favor, intente más tarde.';
          }
          
          debugLog('Login failed:', errorMessage);
          throw new Error(errorMessage);
        })
      );
  }

  logout(): void {
    debugLog('Logging out user');
    
    // Clear user data from state
    this.store.dispatch(AuthActions.unsetAuthenticatedUser());
    
    // Clear authentication token
    localStorage.removeItem('token');
    debugLog('Authentication token removed');
    
    // Clear any other stored data if needed
    // localStorage.removeItem('userPreferences');
    
    // Navigate to login page
    this.router.navigate(['auth', 'login']).then(success => {
      if (success) {
        debugLog('Navigation to login page successful');
      } else {
        debugLog('Navigation to login page failed');
      }
    }).catch(error => {
      console.error('Error during navigation:', error);
    });
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      debugLog('No token found for verification');
      return of(false);
    }

    const profileUrl = `${this.apiURL}/api/users/profile`;
    debugLog('Verifying token with URL:', profileUrl);

    return this.httpClient
      .get<User & { token?: string }>(
        profileUrl,
        { 
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          observe: 'response'
        }
      )
      .pipe(
        map(response => {
          if (!response.body) {
            throw new Error('No response body received');
          }

          const user = response.body;
          debugLog('Token verification successful, user:', user);
          
          // Ensure the token is included in the user object
          const userWithToken = { ...user, token };
          this.store.dispatch(AuthActions.setAuthenticatedUser({ user: userWithToken }));
          
          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          debugLog('Token verification failed:', error);
          
          // Clear invalid token
          localStorage.removeItem('token');
          
          // Log specific error details if available
          if (error.status === 401) {
            debugLog('Token is invalid or expired');
          } else if (error.status === 0) {
            debugLog('Network error - could not connect to server');
          }
          
          return of(false);
        })
      );
  }

  getCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      debugLog('No token available to get current user');
      return of(null);
    }

    const profileUrl = `${this.apiURL}/api/users/profile`;
    debugLog('Fetching current user from:', profileUrl);

    return this.httpClient
      .get<User & { token?: string }>(
        profileUrl,
        { 
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          observe: 'response'
        }
      )
      .pipe(
        map(response => {
          if (!response.body) {
            throw new Error('No response body received');
          }

          debugLog('Successfully fetched current user:', response.body);
          // Ensure the token is included in the user object
          return { ...response.body, token };
        }),
        catchError((error: HttpErrorResponse) => {
          debugLog('Failed to fetch current user:', error);
          
          // Clear invalid token on 401 Unauthorized
          if (error.status === 401) {
            debugLog('Token is invalid or expired, removing from storage');
            localStorage.removeItem('token');
          }
          
          return of(null);
        })
      );
  }

  /**
   * Test the connection to the backend server
   * @returns Observable that completes if connection is successful
   */
  testConnection(): Observable<void> {
    const healthUrl = `${this.apiURL}/api/health`;
    debugLog('Testing backend connection at:', healthUrl);
    
    return this.httpClient.get<void>(healthUrl, { observe: 'response' }).pipe(
      tap(() => {
        debugLog('Backend health check successful');
      }),
      map(() => {}), // Convert to void
      catchError((error: HttpErrorResponse) => {
        debugLog('Health check failed, trying fallback endpoint', error);
        
        if (error.status === 0) {
          throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        }
        
        if (error.status === 404) {
          // If health endpoint doesn't exist, try the login endpoint as a fallback
          const loginUrl = `${this.apiURL}/api/users/login`;
          debugLog('Trying fallback endpoint:', loginUrl);
          
          return this.httpClient.get(loginUrl, { observe: 'response' }).pipe(
            tap(() => {
              debugLog('Fallback endpoint check successful');
            }),
            map(() => {}), // Convert to void
            catchError((loginError: HttpErrorResponse) => {
              debugLog('Fallback endpoint check failed:', loginError);
              
              if (loginError.status === 404) {
                // If login endpoint also returns 404, the API might be working but with different endpoints
                debugLog('Both health and login endpoints returned 404, but server is reachable');
                return of(undefined);
              }
              
              throw new Error('El endpoint de autenticación no está disponible');
            })
          );
        }
        
        // For other status codes, check if we got a response (server is reachable)
        if (error.status) {
          debugLog(`Server responded with status ${error.status}, but connection test successful`);
          return of(undefined);
        }
        
        throw new Error('Error en el servidor');
      })
    );
  }

  /**
   * Check if the current user has admin role
   * @returns Observable<boolean> true if the user is an admin, false otherwise
   */
  isAdmin(): Observable<boolean> {
    return this.authUser$.pipe(
      tap(user => {
        if (environment.enableDebugLogging) {
          debugLog('Checking admin status for user:', user);
        }
      }),
      map((user): boolean => {
        const isAdmin = !!user && user.role === 'admin';
        if (environment.enableDebugLogging) {
          debugLog(`User ${user ? user.email : 'unknown'} admin status: ${isAdmin}`);
        }
        return isAdmin;
      }),
      catchError(error => {
        console.error('Error checking admin status:', error);
        return of(false);
      })
    );
  }

  /**
   * Get the authentication headers with the current token
   * @returns Object containing the Authorization header with Bearer token and Content-Type
   * @throws Error if no token is available
   */
  getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('token');
    
    if (!token) {
      const error = new Error('No authentication token available');
      debugLog('Failed to get auth headers:', error.message);
      throw error;
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      // Add any additional default headers here
    };
    
    debugLog('Generated auth headers');
    return headers;
  }


}