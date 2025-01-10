import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { Observable } from 'rxjs';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  collaborationId: string;
  senderId: string;
  sender: User;
  createdAt: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpService) {}

  getMessages(collaborationId?: string): Observable<Message[]> {
    const endpoint = collaborationId 
      ? `messages/collaboration/${collaborationId}`
      : 'messages';
    return this.http.get<Message[]>(endpoint);
  }

  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>('messages', message);
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http.put<Message>(`messages/${messageId}/read`, {});
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`messages/${messageId}`);
  }
}
