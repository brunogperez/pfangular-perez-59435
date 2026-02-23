import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { MockProvider } from 'ng-mocks';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  const mockRoute: any = {};
  const mockState: any = { url: '/dashboard' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthService, {
          verifyToken: () => of(true),
        }),
        MockProvider(Router, {
          createUrlTree: (commands: any[]) => {
            return { toString: () => commands.join('/') } as UrlTree;
          },
        }),
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('debe permitir el acceso cuando el token es valido', (done) => {
    spyOn(authService, 'verifyToken').and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    (result$ as any).subscribe((result: boolean | UrlTree) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('debe redirigir a /auth/login cuando el token es invalido', (done) => {
    spyOn(authService, 'verifyToken').and.returnValue(of(false));
    const mockUrlTree = {} as UrlTree;
    spyOn(router, 'createUrlTree').and.returnValue(mockUrlTree);

    const result$ = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    (result$ as any).subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(mockUrlTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['auth', 'login']);
      done();
    });
  });

  it('debe redirigir a /auth/login cuando verifyToken lanza un error', (done) => {
    spyOn(authService, 'verifyToken').and.returnValue(
      throwError(() => new Error('Network error'))
    );
    const mockUrlTree = {} as UrlTree;
    spyOn(router, 'createUrlTree').and.returnValue(mockUrlTree);

    const result$ = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    (result$ as any).subscribe((result: boolean | UrlTree) => {
      expect(result).toBe(mockUrlTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['auth', 'login']);
      done();
    });
  });
});
