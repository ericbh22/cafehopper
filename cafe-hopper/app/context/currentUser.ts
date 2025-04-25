import { User } from '../data/user';

export const currentUserId = 'u2'; // Simulate login with u1, will need a backend soon 

export function getCurrentUser(users: User[]): User | undefined {
  return users.find((u) => u.id === currentUserId); // returns the user 
}

