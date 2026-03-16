export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Author' | 'Reviewer' | 'Approver';
  isActive: boolean;
}
