import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe agregar Authorization header cuando hay token', () => {
    localStorage.setItem('token', 'test-token-123');

    httpClient.get('/api/clients').subscribe();

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush([]);
  });

  it('no debe agregar Authorization header cuando no hay token', () => {
    httpClient.get('/api/clients').subscribe();

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('no debe agregar Authorization header para requests de login', () => {
    localStorage.setItem('token', 'test-token-123');

    httpClient.post('/api/users/login', {}).subscribe();

    const req = httpMock.expectOne('/api/users/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
