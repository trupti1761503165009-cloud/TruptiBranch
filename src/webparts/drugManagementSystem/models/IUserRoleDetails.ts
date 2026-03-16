export interface IUserRoleDetails {
  isAdmin: boolean;
  isHR: boolean;
  isAuthor: boolean;
  isApprover: boolean;
  isReviewer: boolean;
  title: string;
  email: string;
  Id: number;
  sharePointGroups: string[];
  permissions: string[];
}