import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Message, MessageReaction, CreateMessageReaction, User } from '../../interfaces/message.interface';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../auth/services/auth.service';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    EmojiPickerComponent
  ],
  template: `
    <div class="message-container" [class.own-message]="isOwnMessage" [class.deleted]="message.isDeleted">
      <!-- Reply indication -->
      @if (message.replyToMessage && !message.isDeleted) {
        <div class="reply-to">
          <mat-icon class="reply-icon">reply</mat-icon>
          <span class="reply-text">{{ message.replyToMessage.sender.firstName }}: {{ getPreviewText(message.replyToMessage.content) }}</span>
        </div>
      }

      <div class="message-wrapper">
        <!-- Avatar and sender info -->
        @if (!isOwnMessage) {
          <div class="avatar">
            @if (message.sender.profilePictureUrl) {
              <img [src]="message.sender.profilePictureUrl" [alt]="message.sender.firstName" class="avatar-img">
            } @else {
              <div class="avatar-placeholder">{{ getInitials(message.sender) }}</div>
            }
          </div>
        }

        <div class="message-content" [class.own-content]="isOwnMessage">
          <!-- Message header -->
          <div class="message-header">
            @if (!isOwnMessage) {
              <span class="sender-name">{{ message.sender.firstName }} {{ message.sender.lastName }}</span>
            }
            <span class="message-time">{{ message.createdAt | date:'short' }}</span>
            @if (message.isEdited) {
              <span class="edited-indicator">(edited)</span>
            }
            <!-- Delivery status -->
            @if (isOwnMessage) {
              <mat-icon class="delivery-status" [matTooltip]="getDeliveryStatusText()">
                {{ getDeliveryStatusIcon() }}
              </mat-icon>
            }
          </div>

          <!-- Message body -->
          @if (!message.isDeleted) {
            <div class="message-body">
              <!-- Text content -->
              @if (message.messageType === 0) {
                @if (isEditing) {
                  <div class="edit-form">
                    <textarea [(ngModel)]="editContent" class="edit-textarea"></textarea>
                    <div class="edit-actions">
                      <button mat-button (click)="saveEdit()">Save</button>
                      <button mat-button (click)="cancelEdit()">Cancel</button>
                    </div>
                  </div>
                } @else {
                  <p class="message-text">{{ message.content }}</p>
                }
              }

              <!-- File attachment -->
              @if (message.fileUrl) {
                <div class="file-attachment">
                  @if (isImageFile(message.fileName)) {
                    <img [src]="message.fileUrl" [alt]="message.fileName" class="attached-image" (click)="openImageModal(message.fileUrl)">
                  } @else {
                    <div class="file-info">
                      <mat-icon>attach_file</mat-icon>
                      <span class="file-name">{{ message.fileName }}</span>
                      <span class="file-size">({{ formatFileSize(message.fileSize || 0) }})</span>
                      <button mat-icon-button (click)="downloadFile(message.fileUrl, message.fileName)">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Message actions -->
            <div class="message-actions">
              <!-- Reactions -->
              @if (message.reactions && message.reactions.length > 0) {
                <div class="reactions">
                  @for (reaction of getGroupedReactions(); track reaction.emoji) {
                    <button 
                      mat-stroked-button 
                      class="reaction-chip"
                      [class.own-reaction]="hasUserReacted(reaction.emoji)"
                      (click)="toggleReaction(reaction.emoji)"
                      [matTooltip]="getReactionTooltip(reaction)">
                      {{ reaction.emoji }} {{ reaction.count }}
                    </button>
                  }
                </div>
              }

              <!-- Action buttons -->
              <div class="action-buttons">
                <button mat-icon-button (click)="showEmojiPicker = !showEmojiPicker" matTooltip="React">
                  <mat-icon>add_reaction</mat-icon>
                </button>
                <button mat-icon-button (click)="replyToMessage.emit(message)" matTooltip="Reply">
                  <mat-icon>reply</mat-icon>
                </button>
                @if (isOwnMessage) {
                  <button mat-icon-button [matMenuTriggerFor]="messageMenu" matTooltip="More">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                }
                <button mat-icon-button (click)="forwardMessage.emit(message)" matTooltip="Forward">
                  <mat-icon>forward</mat-icon>
                </button>
              </div>
            </div>

            <!-- Emoji picker -->
            @if (showEmojiPicker) {
              <app-emoji-picker 
                (emojiSelected)="onEmojiSelected($event)"
                (clickOutside)="showEmojiPicker = false">
              </app-emoji-picker>
            }
          } @else {
            <div class="deleted-message">
              <mat-icon>delete</mat-icon>
              <span>This message was deleted</span>
            </div>
          }
        </div>

        <!-- Avatar for own messages -->
        @if (isOwnMessage) {
          <div class="avatar">
            @if (currentUser?.profilePictureUrl) {
              <img [src]="currentUser.profilePictureUrl" [alt]="currentUser.firstName" class="avatar-img">
            } @else {
              <div class="avatar-placeholder">{{ getInitials(currentUser!) }}</div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Message menu -->
    <mat-menu #messageMenu="matMenu">
      <button mat-menu-item (click)="startEdit()">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="deleteMessage.emit(message.id)">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent implements OnInit {
  @Input() message!: Message;
  @Input() currentUser!: User;
  @Output() replyToMessage = new EventEmitter<Message>();
  @Output() forwardMessage = new EventEmitter<Message>();
  @Output() deleteMessage = new EventEmitter<string>();

  isOwnMessage = false;
  isEditing = false;
  editContent = '';
  showEmojiPicker = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.isOwnMessage = this.message.senderId === this.currentUser?.id;
  }

  getInitials(user: User): string {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  getPreviewText(text: string, maxLength = 50): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getDeliveryStatusIcon(): string {
    switch (this.message.deliveryStatus) {
      case 0: return 'done'; // Sent
      case 1: return 'done_all'; // Delivered
      case 2: return 'done_all'; // Read
      case 3: return 'error'; // Failed
      default: return 'done';
    }
  }

  getDeliveryStatusText(): string {
    switch (this.message.deliveryStatus) {
      case 0: return 'Sent';
      case 1: return 'Delivered';
      case 2: return 'Read';
      case 3: return 'Failed';
      default: return 'Sent';
    }
  }

  isImageFile(fileName?: string): boolean {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getGroupedReactions() {
    if (!this.message.reactions) return [];
    
    const grouped = this.message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {} as any);

    return Object.values(grouped);
  }

  hasUserReacted(emoji: string): boolean {
    return this.message.reactions?.some(r => r.emoji === emoji && r.userId === this.currentUser?.id) || false;
  }

  getReactionTooltip(reaction: any): string {
    const users = reaction.users.map((u: User) => `${u.firstName} ${u.lastName}`);
    return users.join(', ');
  }

  toggleReaction(emoji: string) {
    const existingReaction = this.message.reactions?.find(r => 
      r.emoji === emoji && r.userId === this.currentUser?.id
    );

    if (existingReaction) {
      this.messageService.removeReaction(this.message.id, existingReaction.id).subscribe({
        next: () => {
          // Remove reaction from local state
          this.message.reactions = this.message.reactions?.filter(r => r.id !== existingReaction.id);
        },
        error: (error) => {
          this.snackBar.open('Failed to remove reaction', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.messageService.addReaction(this.message.id, { emoji }).subscribe({
        next: (reaction) => {
          // Add reaction to local state
          if (!this.message.reactions) this.message.reactions = [];
          this.message.reactions.push(reaction);
        },
        error: (error) => {
          this.snackBar.open('Failed to add reaction', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onEmojiSelected(emoji: string) {
    this.toggleReaction(emoji);
    this.showEmojiPicker = false;
  }

  startEdit() {
    this.isEditing = true;
    this.editContent = this.message.content;
  }

  saveEdit() {
    if (this.editContent.trim() !== this.message.content) {
      this.messageService.editMessage(this.message.id, { content: this.editContent.trim() }).subscribe({
        next: (updatedMessage) => {
          this.message.content = updatedMessage.content;
          this.message.isEdited = true;
          this.message.editedAt = new Date();
          this.isEditing = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to edit message', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editContent = '';
  }

  openImageModal(imageUrl: string) {
    // Implementation for image modal would go here
    window.open(imageUrl, '_blank');
  }

  downloadFile(fileUrl: string, fileName?: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'file';
    link.click();
  }
}