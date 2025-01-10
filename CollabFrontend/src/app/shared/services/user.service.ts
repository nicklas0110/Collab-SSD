import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpService) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('users');
  }
} 