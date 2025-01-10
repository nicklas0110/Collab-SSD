import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.css'
})
export class ProfileDetailsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\s\\-]{2,20}$'),
        Validators.maxLength(20)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\s\\-]{2,20}$'),
        Validators.maxLength(20)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe(user => {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error updating profile', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  onUpdatePassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.profileService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
          this.passwordForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error updating password', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  onDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.profileService.deleteAccount().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          this.snackBar.open('Your account has been deleted', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error deleting account', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 