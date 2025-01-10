import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RateLimitService } from '../../../core/services/rate-limit.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  remainingAttempts: number = 5;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private rateLimitService: RateLimitService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
      ]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email.toLowerCase().trim();
      
      // Check rate limit before attempting login
      if (!this.rateLimitService.checkRateLimit(email)) {
        const lockoutTime = this.rateLimitService.getLockoutTime(email);
        if (lockoutTime) {
          const minutesLeft = Math.ceil((lockoutTime.getTime() - Date.now()) / (60 * 1000));
          this.errorMessage = `Too many login attempts. Please try again in ${minutesLeft} minutes.`;
        }
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email.toLowerCase().trim(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.rateLimitService.resetAttempts(email);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login Error:', error);
          this.remainingAttempts = this.rateLimitService.getRemainingAttempts(email);
          this.errorMessage = `${error.error?.message || 'Login failed'}. ${this.remainingAttempts} attempts remaining.`;
          this.isLoading = false;
        }
      });
    } else {
      if (this.loginForm.get('email')?.hasError('required')) {
        this.errorMessage = 'Email is required';
      } else if (this.loginForm.get('email')?.hasError('pattern')) {
        this.errorMessage = 'Invalid email format';
      } else if (this.loginForm.get('password')?.hasError('required')) {
        this.errorMessage = 'Password is required';
      }
    }
  }
}