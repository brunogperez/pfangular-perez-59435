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
    
  }

  deleteToken(): void {
    localStorage.removeItem('token');
  }

  togglePassword(): void {
    this.hideIcon =
      this.hideIcon === 'visibility' ? 'visibility_off' : 'visibility';
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  doLogin(): void {
    this.authService.login(this.loginForm.value).subscribe({
      next: (result) => {
        this.router.navigate(['dashboard', 'home']);
      },
      error: (err) => {
        console.error(err);
        if (err instanceof Error) {
          alert(err.message);
        }
        if (err instanceof HttpErrorResponse) {
          if (err.status === 0) {
            alert('No se pudo conectar con el servidor');
          }
        }
      },
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.doLogin();
    }
  }
}
