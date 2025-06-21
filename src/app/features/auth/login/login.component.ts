import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  hideIcon: 'visibility_off' | 'visibility' = 'visibility_off';
  passwordType: 'password' | 'text' = 'password';

  errorMessage = signal('');
  loading = false;

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.deleteToken();
    // Set default credentials for testing
    this.loginForm.patchValue({
      email: 'admin@mail.com',
      password: '123123123'
    });
    // Test backend connection on init
    this.testBackendConnection();
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }

  togglePassword(): void {
    this.hideIcon =
      this.hideIcon === 'visibility' ? 'visibility_off' : 'visibility';
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  testBackendConnection(): void {
    this.loading = true;
    this.errorMessage.set('');
    this.authService.verifyToken().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  doLogin(): void {
    if (this.loading) return;
    
    this.loading = true;
    this.errorMessage.set('');
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['dashboard', 'home']);
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      },
    });
  }

  private handleError(err: any): void {
    console.error('Error:', err);
    let errorMessage = 'Error desconocido';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } 
    
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else if (err.status === 400 || err.status === 401) {
        errorMessage = err.error?.error || 'Credenciales inválidas';
      } else if (err.status >= 500) {
        errorMessage = 'Error del servidor. Por favor, intente más tarde.';
      }
    }
    
    this.errorMessage.set(errorMessage);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.doLogin();
    }
  }
}
