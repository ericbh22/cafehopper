// src/data/users.ts

export interface User {
    id: string;
    name: string;
    location?: string; // cafe id
    avatar?: string;
    reviews?: [];
  }
  
  export const users: User[] = [
    { id: 'u1', name: 'Alice', location: '1', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'u2', name: 'Bob', location: '2', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 'u3', name: 'Charlie', location: '1', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 'u4', name: 'Dana', location: undefined, avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 'u5', name: 'Erin', location: '3', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'u6', name: 'Frank', location: undefined, avatar: 'https://i.pravatar.cc/150?img=6' },
  ];
  
