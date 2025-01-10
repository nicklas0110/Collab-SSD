import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { CollaborationService } from '../../../collaboration/services/collaboration.service';
import { MessageService } from '../../../messages/services/message.service';
import { map, combineLatest } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

export interface ActivityItem {
  id: string;
  type: 'collaboration' | 'message';
  action: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  link: string;
  collaborationId?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  collaborationCount$ = this.collaborationService.getCollaborations().pipe(
    map(collabs => collabs.filter(c => c.status === 'active').length)
  );

  unreadMessages$ = combineLatest([
    this.messageService.getMessages(),
    this.authService.currentUser$
  ]).pipe(
    map(([messages, currentUser]) => 
      messages.filter(m => !m.read && m.senderId !== currentUser?.id).length
    )
  );

  activities$ = combineLatest([
    this.collaborationService.getCollaborations(),
    this.messageService.getMessages()
  ]).pipe(
    map(([collaborations, messages]) => {
      const activities: ActivityItem[] = [];

      // Add collaboration activities
      collaborations.forEach(collab => {
        activities.push({
          id: collab.id,
          type: 'collaboration',
          action: 'created',
          title: collab.title,
          description: `Created by ${collab.createdBy.firstName} ${collab.createdBy.lastName}`,
          timestamp: new Date(collab.createdAt),
          icon: 'group_add',
          link: '/collaborations'
        });
      });

      // Add message activities
      messages.forEach(msg => {
        const collab = collaborations.find(c => c.id === msg.collaborationId);
        if (collab) {
          activities.push({
            id: msg.id,
            type: 'message',
            action: 'sent',
            title: `New message in ${collab.title}`,
            description: `${msg.sender.firstName} ${msg.sender.lastName}: ${msg.content}`,
            timestamp: new Date(msg.createdAt),
            icon: 'message',
            link: '/messages',
            collaborationId: msg.collaborationId
          });
        }
      });

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    })
  );

  constructor(
    private collaborationService: CollaborationService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  navigateToActivity(activity: ActivityItem) {
    if (activity.type === 'message') {
      this.router.navigate(['/messages'], { 
        queryParams: { collaborationId: activity.collaborationId }
      });
    } else if (activity.type === 'collaboration') {
      this.router.navigate(['/collaborations'], { 
        queryParams: { collaborationId: activity.id }
      });
    }
  }
} 