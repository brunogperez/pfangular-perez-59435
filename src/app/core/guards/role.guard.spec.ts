import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { MockProvider } from 'ng-mocks';

describe('roleGuard', () => {
  let authService: AuthService;
  let router: Router;

  const mockRoute: any = {};
  const mockState: any = { url: '/dashboard/users' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthService, {
          isAdmin: () => of(true),
        }),
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('debe permitir el acceso cuando el usuario es admin', (done) => {
    spyOn(authService, 'isAdmin').and.returnValue(of(true));

    const result$ = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    (result$ as any).subscribe((result: boolean) => {
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('debe redirigir a /dashboard/home cuando el usuario no es admin', (done) => {
    spyOn(authService, 'isAdmin').and.returnValue(of(false));

    const result$ = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    (result$ as any).subscribe((result: boolean) => {
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['dashboard', 'home']);
      done();
    });
  });
});
