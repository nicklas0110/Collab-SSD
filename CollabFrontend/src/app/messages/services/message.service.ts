import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { Observable } from 'rxjs';
import { Message, CreateMessage, EditMessage, CreateMessageReaction, MessageReaction } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpService) {}

  // Message CRUD operations
  getMessages(collaborationId?: string): Observable<Message[]> {
    const endpoint = collaborationId 
      ? `messages/collaboration/${collaborationId}`
      : 'messages';
    return this.http.get<Message[]>(endpoint);
  }

  getDirectMessages(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`messages/direct/${userId}`);
  }

  getUnreadMessages(): Observable<Message[]> {
    return this.http.get<Message[]>('messages/unread');
  }

  sendMessage(message: CreateMessage): Observable<Message> {
    return this.http.post<Message>('messages', message);
  }

  editMessage(messageId: string, message: EditMessage): Observable<Message> {
    return this.http.put<Message>(`messages/${messageId}`, message);
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`messages/${messageId}`);
  }

  markAsRead(messageId: string): Observable<Message> {
    return this.http.put<Message>(`messages/${messageId}/read`, {});
  }

  searchMessages(query: string, collaborationId?: string): Observable<Message[]> {
    let url = `messages/search/${encodeURIComponent(query)}`;
    if (collaborationId) {
      url += `?collaborationId=${collaborationId}`;
    }
    return this.http.get<Message[]>(url);
  }

  // Message reactions
  addReaction(messageId: string, reaction: CreateMessageReaction): Observable<MessageReaction> {
    return this.http.post<MessageReaction>(`messages/${messageId}/reactions`, reaction);
  }

  removeReaction(messageId: string, reactionId: string): Observable<void> {
    return this.http.delete<void>(`messages/${messageId}/reactions/${reactionId}`);
  }

  getMessageReactions(messageId: string): Observable<MessageReaction[]> {
    return this.http.get<MessageReaction[]>(`messages/${messageId}/reactions`);
  }

  // File upload
  uploadFile(file: File): Observable<{url: string, fileName: string, fileSize: number}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{url: string, fileName: string, fileSize: number}>('messages/upload', formData);
  }

  // Message forwarding
  forwardMessage(messageId: string, targetCollaborationId?: string, targetUserId?: string): Observable<Message> {
    const payload = {
      targetCollaborationId,
      targetUserId
    };
    return this.http.post<Message>(`messages/${messageId}/forward`, payload);
  }

  // Get conversation participants for direct messages
  getConversationParticipants(): Observable<any[]> {
    return this.http.get<any[]>('messages/conversations');
  }

  // Search users for direct messaging
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`users/search/${encodeURIComponent(query)}`);
  }
}
