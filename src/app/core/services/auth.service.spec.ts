import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthData } from '../../features/auth/models/index';
import { User } from '../../features/dashboard/users/models';
import { MockProvider } from 'ng-mocks';
import { NavigationExtras, Router } from '@angular/router';

const mockAuthData: AuthData = {
  email: 'fakeuser@mail.com',
  password: '123123',
};
const mockUser: User = {
  id: 'sdgakmn123',
  firstName: 'Faker',
  lastName: 'User',
  email: 'fakeuser@mail.com',
  password: '123123',
  createdAt: new Date(),
  role: 'admin',
  token: 'nj2k345bk2nj34n234nj2knokljn2okl3',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpController: HttpTestingController;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        MockProvider(Router, {
          navigate: (comands: any[], extras?: NavigationExtras) => {
            return new Promise((res) => res(true));
          },
        }),
      ],
    });
    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('El servicio debe ser definido', () => {
    expect(service).toBeTruthy();
  });
  it('Debe realizarse el login y establecer el token en localStorage', (done) => {
    service.login(mockAuthData).subscribe({
      next: (user) => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toEqual(mockUser.token);
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${service['apiURL']}/users?email=${mockAuthData.email}&password=${mockAuthData.password}`,
      method: 'GET',
    });
    mockRequest.flush([mockUser]);
  });

  it('Debe retornar un error al realizar un login inválido', (done) => {
    service.login(mockAuthData).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err['message']).toBe('Los datos son inválidos');
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${service['apiURL']}/users?email=${mockAuthData.email}&password=${mockAuthData.password}`,
      method: 'GET',
    });
    //mockRequest.flush([], { status: 401, statusText: 'Unauthorized' });
    mockRequest.flush([]);
  });

  it('El logOut debe remover el token del localStorage', (done) => {
    service.login(mockAuthData).subscribe({
      next: (user) => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toEqual(mockUser.token);
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${service['apiURL']}/users?email=${mockAuthData.email}&password=${mockAuthData.password}`,
      method: 'GET',
    });

    mockRequest.flush([mockUser]);
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('El logOut debe deshabilitar un usuario autenticado', (done) => {
    service.login(mockAuthData).subscribe();
    const mockRequest = httpController.expectOne({
      url: `${service['apiURL']}/users?email=${mockAuthData.email}&password=${mockAuthData.password}`,
      method: 'GET',
    });

    mockRequest.flush([mockUser]);

    service.logout();
    service.authUser$.subscribe({
      next: (user) => {
        expect(user).toBeNull();
        done();
      },
    });
  });

  it('El logOut debe redirigir al usuario a la ruta /auth/login', () => {
    const spyOnNavigate = spyOn(router, 'navigate');
    service.logout();
    expect(spyOnNavigate).toHaveBeenCalledOnceWith(['auth', 'login']);
  });

  it('Debe retornar TRUE si el usuario está autenticado', () => {
    const mockUsers: User[] = [
      {
        id: 'sdgakmn123',
        firstName: 'Faker',
        lastName: 'User',
        email: 'fakeuser@mail.com',
        password: '123123',
        createdAt: new Date(),
        role: 'user',
        token: 'nj2k345bk2nj34n234nj2knokljn2okl3',
      },
    ];

    const token = 'nj2k345bk2nj34n234nj2knokljn2okl3';

    localStorage.setItem('token', token);

    service.verifyToken().subscribe((isAuth) => {
      expect(isAuth).toBeTrue();
    });

    const req = httpController.expectOne(
      `${service['apiURL']}/users?token=${token}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers); // Ahora enviamos un array en vez de un objeto único
  });

  it('Debe retornar FALSE si el usuario no está autenticado', () => {
    const mockUsers: User[] = [];
    const token = 'mockToken';
    localStorage.setItem('token', token);

    service.verifyToken().subscribe((isAuth) => {
      expect(isAuth).toBeFalse();
    });

    const req = httpController.expectOne(
      `${service['apiURL']}/users?token=${token}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
