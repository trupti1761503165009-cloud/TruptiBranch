import { IUser } from '../models/User';

const usersData: IUser[] = [
  {
    id: 'user1',
    name: 'Alice Admin',
    email: 'alice.admin@example.com',
    role: 'Admin',
    isActive: true
  },
  {
    id: 'user2',
    name: 'Bob Author',
    email: 'bob.author@example.com',
    role: 'Author',
    isActive: true
  },
  {
    id: 'user3',
    name: 'Charlie HR',
    email: 'charlie.hr@example.com',
    role: 'Author',
    isActive: true
  },
  {
    id: 'user4',
    name: 'Diana Approver',
    email: 'diana.approver@example.com',
    role: 'Approver',
    isActive: true
  }
];

export default usersData;
