export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOnline?: boolean;
  lastSeen?: Date;
  profilePictureUrl?: string;
  status?: string;
}

export enum MessageType {
  Text = 0,
  Image = 1,
  File = 2,
  Audio = 3,
  Video = 4,
  Voice = 5
}

export enum MessageDeliveryStatus {
  Sent = 0,
  Delivered = 1,
  Read = 2,
  Failed = 3
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  user: User;
  emoji: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  collaborationId?: string;
  recipientId?: string;
  senderId: string;
  sender: User;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
  messageType: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageId?: string;
  replyToMessage?: Message;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deliveryStatus: MessageDeliveryStatus;
  reactions?: MessageReaction[];
}

export interface CreateMessage {
  content: string;
  collaborationId?: string;
  recipientId?: string;
  messageType?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageId?: string;
}

export interface EditMessage {
  content: string;
}

export interface CreateMessageReaction {
  emoji: string;
} 