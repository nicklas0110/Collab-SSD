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
      console.log('Form Data:', formData);

      const sanitizedData = {
        firstName: this.validatorService.sanitizeInput(formData.firstName),
        lastName: this.validatorService.sanitizeInput(formData.lastName),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };
      console.log('Sanitized Data:', sanitizedData);

      this.authService.register(sanitizedData).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration Error:', error);
          this.errorMessage = error.error?.message || error.message || 'Registration failed';
          this.isLoading = false;
        }
      });
    }
  }
}
