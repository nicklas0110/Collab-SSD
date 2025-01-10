import { User } from '../interfaces/user.interface';

export const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}; 