import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthData } from '../../features/auth/models/index';
import { User } from '../../features/dashboard/users/models';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const mockAuthData: AuthData = {
  email: 'fakeuser@mail.com',
  password: '123123',
};

const mockUser: User = {
  _id: 'sdgakmn123',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    httpController.verify();
  });

  it('El servicio debe ser definido', () => {
    expect(service).toBeTruthy();
  });

  it('Debe realizarse el login y retornar el usuario', (done) => {
    service.login(mockAuthData).subscribe({
      next: (user) => {
        expect(user).toEqual(mockUser);
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${environment.apiBaseURL}/api/users/login`,
      method: 'POST',
    });
    expect(mockRequest.request.body).toEqual({
      email: mockAuthData.email,
      password: mockAuthData.password,
    });
    mockRequest.flush(mockUser);
  });

  it('Debe retornar un error con status 400 (credenciales inválidas)', (done) => {
    service.login(mockAuthData).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Email o password incorrectos');
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${environment.apiBaseURL}/api/users/login`,
      method: 'POST',
    });
    mockRequest.flush(
      { error: 'Email o password incorrectos' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('Debe retornar un error de conexión con status 0', (done) => {
    service.login(mockAuthData).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('No se pudo conectar con el servidor');
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${environment.apiBaseURL}/api/users/login`,
      method: 'POST',
    });
    mockRequest.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
  });

  it('Debe retornar un error con status 404', (done) => {
    service.login(mockAuthData).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(
          'Endpoint no encontrado - Verifica la URL del backend'
        );
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${environment.apiBaseURL}/api/users/login`,
      method: 'POST',
    });
    mockRequest.flush(
      { error: 'Not Found' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  it('Debe retornar error interno del servidor para otros errores', (done) => {
    service.login(mockAuthData).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Error interno del servidor');
        done();
      },
    });
    const mockRequest = httpController.expectOne({
      url: `${environment.apiBaseURL}/api/users/login`,
      method: 'POST',
    });
    mockRequest.flush(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  it('verifyToken debe retornar el usuario si el token es válido', (done) => {
    localStorage.setItem('token', 'nj2k345bk2nj34n234nj2knokljn2okl3');

    service.verifyToken().subscribe((user) => {
      expect(user).toEqual(mockUser);
      done();
    });

    const req = httpController.expectOne(
      `${environment.apiBaseURL}/api/users/profile`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('verifyToken debe retornar null si el token es inválido', (done) => {
    localStorage.setItem('token', 'invalidToken');

    service.verifyToken().subscribe((user) => {
      expect(user).toBeNull();
      done();
    });

    const req = httpController.expectOne(
      `${environment.apiBaseURL}/api/users/profile`
    );
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('verifyToken debe retornar null si no hay token en localStorage', (done) => {
    service.verifyToken().subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });
});
