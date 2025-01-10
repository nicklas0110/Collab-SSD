import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { Observable } from 'rxjs';
import { User } from '../../shared/interfaces/user.interface';

interface ProfileUpdate {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpService) {}

  getProfile(): Observable<User> {
    return this.http.get<User>('profile');
  }

  updateProfile(data: ProfileUpdate): Observable<User> {
    return this.http.put<User>('profile', data);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>('profile/password', {
      currentPassword,
      newPassword
    });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>('profile');
  }
}
