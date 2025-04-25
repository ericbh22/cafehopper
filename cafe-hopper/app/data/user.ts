// src/data/users.ts

export interface User {
    id: string;
    name: string;
    location: string | null; // cafe id
    avatar?: string;
    reviews?: [];
    friends?: string[];
  }

  export const users: User[] = [
    { id: 'u1', name: 'Alice', location: '1', avatar: 'https://i.pravatar.cc/150?img=1', friends: ['u2', 'u3'] },
    { id: 'u2', name: 'Bob', location: '2', avatar: 'https://i.pravatar.cc/150?img=2', friends: ['u3', 'u5'] },
    { id: 'u3', name: 'Charlie', location: '1', avatar: 'https://i.pravatar.cc/150?img=3', friends: ['u1', 'u4'] },
    { id: 'u4', name: 'Dana', location: null, avatar: 'https://i.pravatar.cc/150?img=4', friends: ['u2', 'u6'] },
    { id: 'u5', name: 'Erin', location: '3', avatar: 'https://i.pravatar.cc/150?img=5', friends: ['u1', 'u4'] },
    { id: 'u6', name: 'Frank', location: null, avatar: 'https://i.pravatar.cc/150?img=6', friends: ['u3', 'u5'] },
  ];
