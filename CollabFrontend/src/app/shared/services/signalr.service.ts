import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TypingIndicator {
  userId: string;
  userName: string;
  collaborationId?: string;
  isTyping: boolean;
}

export interface UserStatusUpdate {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface MessageUpdate {
  messageId: string;
  status: 'delivered' | 'read';
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private connectionState = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);

  // Observable subjects for real-time events
  public typingIndicator$ = new Subject<TypingIndicator>();
  public directTypingIndicator$ = new Subject<TypingIndicator>();
  public userStatusUpdate$ = new Subject<UserStatusUpdate>();
  public messageUpdate$ = new Subject<MessageUpdate>();
  public newMessage$ = new Subject<any>();

  constructor() {}

  public async startConnection(token: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // Set up event listeners
    this.setupEventListeners();

    try {
      await this.hubConnection.start();
      this.connectionState.next(this.hubConnection.state);
      console.log('SignalR connection established');
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      this.connectionState.next(HubConnectionState.Disconnected);
    }

    // Handle connection state changes
    this.hubConnection.onreconnecting(() => {
      this.connectionState.next(HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.next(HubConnectionState.Connected);
    });

    this.hubConnection.onclose(() => {
      this.connectionState.next(HubConnectionState.Disconnected);
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionState.next(HubConnectionState.Disconnected);
    }
  }

  public async joinCollaboration(collaborationId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinCollaboration', collaborationId);
    }
  }

  public async leaveCollaboration(collaborationId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveCollaboration', collaborationId);
    }
  }

  public async sendTypingIndicator(collaborationId: string, isTyping: boolean): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendTypingIndicator', collaborationId, isTyping);
    }
  }

  public async sendDirectTypingIndicator(recipientId: string, isTyping: boolean): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendDirectTypingIndicator', recipientId, isTyping);
    }
  }

  public async markMessageAsDelivered(messageId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('MarkMessageAsDelivered', messageId);
    }
  }

  public async markMessageAsRead(messageId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('MarkMessageAsRead', messageId);
    }
  }

  public getConnectionState() {
    return this.connectionState.asObservable();
  }

  private setupEventListeners(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('TypingIndicator', (data: TypingIndicator) => {
      this.typingIndicator$.next(data);
    });

    this.hubConnection.on('DirectTypingIndicator', (data: TypingIndicator) => {
      this.directTypingIndicator$.next(data);
    });

    this.hubConnection.on('UserOnline', (data: UserStatusUpdate) => {
      this.userStatusUpdate$.next({ ...data, isOnline: true });
    });

    this.hubConnection.on('UserOffline', (data: UserStatusUpdate) => {
      this.userStatusUpdate$.next({ ...data, isOnline: false });
    });

    this.hubConnection.on('MessageDelivered', (data: { messageId: string }) => {
      this.messageUpdate$.next({ messageId: data.messageId, status: 'delivered' });
    });

    this.hubConnection.on('MessageRead', (data: { messageId: string }) => {
      this.messageUpdate$.next({ messageId: data.messageId, status: 'read' });
    });

    this.hubConnection.on('NewMessage', (message: any) => {
      this.newMessage$.next(message);
    });
  }
}