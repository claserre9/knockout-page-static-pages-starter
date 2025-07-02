import { User } from './UserService';

export const fakeUsers: User[] = [
  {
    id: '1',
    username: 'alice',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Anderson',
    isActive: true
  },
  {
    id: '2',
    username: 'bob',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Brown',
    isActive: true
  },
  {
    id: '3',
    username: 'charlie',
    email: 'charlie@example.com',
    firstName: 'Charlie',
    lastName: 'Clark',
    isActive: false
  }
];
