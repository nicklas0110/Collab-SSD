import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { Observable } from 'rxjs';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Collaboration {
  id: string;
  title: string;
  description: string;
  participants: User[];
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  constructor(private http: HttpService) {}

  getCollaborations(): Observable<Collaboration[]> {
    return this.http.get<Collaboration[]>('collaborations');
  }

  getCollaboration(id: string): Observable<Collaboration> {
    return this.http.get<Collaboration>(`collaborations/${id}`);
  }

  createCollaboration(data: Partial<Collaboration>): Observable<Collaboration> {
    return this.http.post<Collaboration>('collaborations', data);
  }

  updateCollaboration(id: string, data: Partial<Collaboration>): Observable<Collaboration> {
    return this.http.put<Collaboration>(`collaborations/${id}`, data);
  }

  deleteCollaboration(id: string): Observable<void> {
    return this.http.delete<void>(`collaborations/${id}`);
  }

  addParticipant(collaborationId: string, userId: string): Observable<void> {
    return this.http.post<void>(`collaborations/${collaborationId}/participants`, { userId });
  }
}
