export interface Message {
  id: string;
  content: string;
  collaborationId: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  read: boolean;
} 