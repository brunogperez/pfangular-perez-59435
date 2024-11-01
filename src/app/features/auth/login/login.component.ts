import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  hideIcon: 'visibility_off' | 'visibility' = 'visibility_off';
  passwordType: 'password' | 'text' = 'password';

  errorMessage = signal('');

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router:Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: [null, Validators.required, Validators.email],
      password: [null, Validators.required],
    });
  }

  togglePassword(): void {
    this.hideIcon =
      this.hideIcon === 'visibility' ? 'visibility_off' : 'visibility';
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigate(['dashboard','home'])
        },
        error: (err) => {
          console.log(err);
          if (err instanceof Error) {
            alert(err)
          }
          if(err instanceof HttpErrorResponse){
            if(err.status === 0){
            alert(err.statusText);
            }
          }
        },
      });
    }
  }
}
