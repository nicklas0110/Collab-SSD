import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { mockUser } from '../../../shared/testing/mock-user';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    authServiceSpy.login.and.returnValue(of({ user: mockUser, token: 'fake-token' }));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully with valid credentials', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'TestPass123!@#'
    });
    
    component.onSubmit();
    fixture.detectChanges();
    
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'TestPass123!@#'
    });
  });

  it('should validate password correctly', () => {
    const passwordControl = component.loginForm.get('password');
    
    // Test valid password
    passwordControl?.setValue('TestPass123!@#');
    expect(passwordControl?.valid).toBeTrue();
    
    // Test invalid passwords
    const invalidPasswords = [
      'nouppercasepass1!',  // no uppercase
      'NOLOWERCASEPASS1!',  // no lowercase
      'NoSpecialChar123',   // no special char
      'NoNumber@pass',      // no number
      'Short1!',            // too short
    ];

    invalidPasswords.forEach(password => {
      passwordControl?.setValue(password);
      expect(passwordControl?.valid).toBeFalse();
    });
  });
});
