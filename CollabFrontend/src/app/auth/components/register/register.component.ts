import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ValidatorService } from '../../../shared/services/validator.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private validatorService: ValidatorService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        (control: { value: string; }) => {
          const isValid = this.validatorService.validateName(control.value);
          return isValid ? null : { invalidName: true };
        }
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        (control: { value: string; }) => {
          const isValid = this.validatorService.validateName(control.value);
          return isValid ? null : { invalidName: true };
        }
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;
      const sanitizedData = {
        firstName: this.validatorService.sanitizeInput(formData.firstName),
        lastName: this.validatorService.sanitizeInput(formData.lastName),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      this.authService.register(sanitizedData).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration Error:', error);
          this.errorMessage = error.error?.message || 'Registration failed';
          this.isLoading = false;
        }
      });
    } else {
       // Show form validation errors
       if (this.registerForm.get('email')?.hasError('required')) {
        this.errorMessage = 'Email is required';
      } else if (this.registerForm.get('email')?.hasError('pattern')) {
        this.errorMessage = 'Invalid email format';
      } else if (this.registerForm.get('firstName')?.hasError('required')) {
        this.errorMessage = 'First name is required';
      } else if (this.registerForm.get('firstName')?.hasError('pattern')) {
        this.errorMessage = 'Invalid first name format';
      } else if (this.registerForm.get('lastName')?.hasError('required')) {
        this.errorMessage = 'Last name is required';
      } else if (this.registerForm.get('lastName')?.hasError('pattern')) {
        this.errorMessage = 'Invalid last name format';
      } else if (this.registerForm.get('password')?.hasError('required')) {
        this.errorMessage = 'Password is required';
      } else if (this.registerForm.get('password')?.hasError('pattern')) {
        this.errorMessage = 'Password must contain uppercase, lowercase, number and special character';
      } else if (this.registerForm.hasError('mismatch')) {
        this.errorMessage = 'Passwords do not match';
      }
      this.checkFormErrors();
    }
  }

  private checkFormErrors() {
    const password = this.registerForm.get('password')?.value;
    if (this.registerForm.get('password')?.hasError('pattern')) {
      const missing = [];
      if (!/[A-Z]/.test(password)) missing.push('uppercase letter');
      if (!/[a-z]/.test(password)) missing.push('lowercase letter');
      if (!/[0-9]/.test(password)) missing.push('number');
      if (!/[@$!%*?&]/.test(password)) missing.push('special character');
      if (password.length < 8) missing.push('minimum length of 8 characters');
      
      this.errorMessage = `Password must include: ${missing.join(', ')}`;
    } else if (this.registerForm.hasError('mismatch')) {
      this.errorMessage = 'Passwords do not match';
    }
  }
}
