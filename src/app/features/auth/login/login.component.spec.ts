import {
  HttpClientTestingModule,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { MockProvider } from 'ng-mocks';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../dashboard/users/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [SharedModule, HttpClientTestingModule],
      providers: [
        provideHttpClientTesting(),
        MockProvider(AuthService, {
          login: () => of(mockUser),
        }),
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
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

  it('Al llamar la función onSubmit, si el formulario es inválido, los campos se deben marcar como touched', () => {
    const spyMarkAllAsTouched = spyOn(component.loginForm, 'markAllAsTouched');

    component.loginForm.setValue({
      email: '',
      password: '',
    });
    component.onSubmit();
    expect(spyMarkAllAsTouched).toHaveBeenCalled();
  });

  it('Al llamar onSubmit debe llamar a la función doLogin', () => {
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
  it('Debería cambiar passwordType a "text" y hideIcon a "visibility_off" ', () => {
    component.togglePassword();

    expect(component.passwordType).toBe('text');
    expect(component.hideIcon).toBe('visibility_off');
  });

  it('Debería cambiar passwordType a "password" y hideIcon a "visibility" ', () => {
    component.togglePassword();
    component.togglePassword();
    expect(component.passwordType).toBe('password');
    expect(component.hideIcon).toBe('visibility');
  });

  it('Debería navegar al dashboard al autenticarse correctamente', () => {
    component.loginForm.setValue({
      email: 'faker@mail.com',
      password: '123123',
    });
    component.doLogin();
    expect(router.navigate).toHaveBeenCalledWith(['dashboard', 'home']);
  });

  it('Debería mostrar un mensaje de alerta para un error genérico', () => {
    spyOn(authService, 'login').and.returnValue(
      throwError(() => new Error('Error genérico'))
    );
    spyOn(window, 'alert');
    component.doLogin();
    expect(window.alert).toHaveBeenCalledWith('Error genérico');
  });

  it('Debería mostrar un mensaje de alerta para un error de conexión', () => {
    const httpError = new HttpErrorResponse({
      error: 'Network error',
      status: 0,
    });
    spyOn(authService, 'login').and.returnValue(throwError(() => httpError));
    spyOn(window, 'alert');
    component.doLogin();
    expect(window.alert).toHaveBeenCalledWith(
      'No se pudo conectar con el servidor'
    );
  });
});
