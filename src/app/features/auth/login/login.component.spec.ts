import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../dashboard/users/models';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        MockProvider(AuthService, {
          login: () => of(mockUser),
          verifyToken: () => of(false),
        }),
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        provideMockStore({
          initialState: {
            auth: { authenticatedUser: null },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    component.hideIcon = 'visibility';
    component.passwordType = 'password';
  });

  it('El componente debe haber sido instanciado', () => {
    expect(component).toBeTruthy();
  });

  it('El email debe ser requerido', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.invalid).toBeTrue();
  });

  it('Al llamar la funcion onSubmit, si el formulario es invalido, los campos se deben marcar como touched', () => {
    const spyMarkAllAsTouched = spyOn(component.loginForm, 'markAllAsTouched');

    component.loginForm.setValue({
      email: '',
      password: '',
    });
    component.onSubmit();
    expect(spyMarkAllAsTouched).toHaveBeenCalled();
  });

  it('Al llamar onSubmit debe llamar a la funcion doLogin', () => {
    component.loginForm.setValue({
      email: 'faker@mail.com',
      password: '123123',
    });

    const spyLogin = spyOn(component, 'doLogin');
    component.onSubmit();
    expect(spyLogin).toHaveBeenCalled();
  });

  it('El toggle debe alternar el type entre password y text', () => {
    component.passwordType = 'password';
    component.togglePassword();
    expect(component.passwordType).toBe('text');
  });

  it('Deberia cambiar passwordType a "text" y hideIcon a "visibility_off"', () => {
    component.togglePassword();

    expect(component.passwordType).toBe('text');
    expect(component.hideIcon).toBe('visibility_off');
  });

  it('Deberia cambiar passwordType a "password" y hideIcon a "visibility"', () => {
    component.togglePassword();
    component.togglePassword();
    expect(component.passwordType).toBe('password');
    expect(component.hideIcon).toBe('visibility');
  });

  it('Deberia navegar al dashboard al autenticarse correctamente', () => {
    component.loginForm.setValue({
      email: 'faker@mail.com',
      password: '123123',
    });
    component.doLogin();
    expect(router.navigate).toHaveBeenCalledWith(['dashboard', 'home']);
  });

  it('Deberia establecer loading en false despues de login exitoso', () => {
    component.loginForm.setValue({
      email: 'faker@mail.com',
      password: '123123',
    });
    component.doLogin();
    expect(component.loading).toBeFalse();
  });

  it('No debe ejecutar doLogin si loading es true', () => {
    const loginSpy = spyOn(authService, 'login').and.returnValue(of(mockUser));
    component.loading = true;
    component.doLogin();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('Deberia establecer errorMessage para un error generico', () => {
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new Error('Error generico'))
    );
    component.doLogin();
    expect(component.errorMessage()).toBe('Error generico');
    expect(component.loading).toBeFalse();
  });

  it('Deberia establecer errorMessage para un error de conexion (status 0)', () => {
    const httpError = new HttpErrorResponse({
      error: 'Network error',
      status: 0,
    });
    spyOn(authService, 'login').and.returnValue(throwError(() => httpError));
    component.doLogin();
    expect(component.errorMessage()).toBe(
      'No se pudo conectar con el servidor. Verifique su conexi\u00f3n a internet.'
    );
    expect(component.loading).toBeFalse();
  });

  it('Deberia establecer errorMessage para error de credenciales (status 400)', () => {
    const httpError = new HttpErrorResponse({
      error: { error: 'Credenciales invalidas' },
      status: 400,
    });
    spyOn(authService, 'login').and.returnValue(throwError(() => httpError));
    component.doLogin();
    expect(component.errorMessage()).toBe('Credenciales invalidas');
    expect(component.loading).toBeFalse();
  });

  it('Deberia establecer errorMessage para error de servidor (status 500)', () => {
    const httpError = new HttpErrorResponse({
      error: 'Server Error',
      status: 500,
    });
    spyOn(authService, 'login').and.returnValue(throwError(() => httpError));
    component.doLogin();
    expect(component.errorMessage()).toBe(
      'Error del servidor. Por favor, intente más tarde.'
    );
    expect(component.loading).toBeFalse();
  });

  it('testBackendConnection debe llamar a verifyToken en ngOnInit', () => {
    const verifySpy = spyOn(authService, 'verifyToken').and.returnValue(
      of(true)
    );
    component.ngOnInit();
    expect(verifySpy).toHaveBeenCalled();
  });

  it('testBackendConnection debe manejar error de conexion', () => {
    const httpError = new HttpErrorResponse({
      error: 'Network error',
      status: 0,
    });
    spyOn(authService, 'verifyToken').and.returnValue(
      throwError(() => httpError)
    );
    component.testBackendConnection();
    expect(component.loading).toBeFalse();
    expect(component.errorMessage()).toBeTruthy();
  });

  it('deleteToken debe remover el token del localStorage', () => {
    localStorage.setItem('token', 'test-token');
    component.deleteToken();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
