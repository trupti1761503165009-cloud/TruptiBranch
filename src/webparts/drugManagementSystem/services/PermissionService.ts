import { IUserRoleDetails } from '../models/IUserRoleDetails';

export class PermissionService {
  static async checkUserPermissions(provider: any, currentUser: any): Promise<IUserRoleDetails> {
    try {
      // Get user's SharePoint groups
      const userGroupsRaw = await provider.getCurrentUserGroups();
      const userGroups = Array.isArray(userGroupsRaw) ? userGroupsRaw : [];

      const isSiteAdmin = !!currentUser?.isAdmin;
      const isAdminGroup = userGroups.some((group: any) => group.Title === 'Admin');
      const isHR = userGroups.some((group: any) => group.Title === 'HR');
      const isAuthorGroup = userGroups.some((group: any) => group.Title === 'Author');
      const isApproverGroup = userGroups.some((group: any) => group.Title === 'Approver');

      const isAdmin = isSiteAdmin || isAdminGroup;
      const isAuthor = isAuthorGroup || isAdmin;
      const isApprover = isApproverGroup || isAdmin;
      const isReviewer = userGroups.some((group: any) => group.Title === 'Reviewer') || isApprover;
      const isHRRole = isHR || isAdmin;

      return {
        isAdmin,
        isHR: isHRRole,
        isAuthor,
        isApprover,
        isReviewer,
        title: currentUser?.displayName || 'Unknown User',
        email: currentUser?.email || '',
        Id: currentUser?.userId || 0,
        sharePointGroups: userGroups.map((g: any) => g.Title).filter(Boolean),
        permissions: this.getPermissionsForRole(isAdmin, isHRRole, isAuthor, isApprover)
      };
    } catch (error) {
      console.error('Error in checkUserPermissions:', error);
      // Fallback to basic author permissions
      return {
        isAdmin: currentUser?.isAdmin || false,
        isHR: false,
        isAuthor: true,
        isApprover: false,
        isReviewer: false,
        title: currentUser?.displayName || 'User',
        email: currentUser?.email || '',
        Id: currentUser?.userId || 0,
        sharePointGroups: [],
        permissions: ['CreateDocuments', 'ViewDocumentCreatedTab']
      };
    }
  }

  private static getPermissionsForRole(isAdmin: boolean, isHR: boolean, isAuthor: boolean, isApprover: boolean): string[] {
    if (isAdmin) {
      return ['ViewAllTabs', 'ManageUsers', 'CreateDocuments', 'ApproveDocuments', 'ViewDocumentCreatedTab', 'ViewApproverTab'];
    }
    if (isHR) {
      return ['ManageUsers'];
    }
    if (isAuthor || isApprover) {
      return ['CreateDocuments', 'ApproveDocuments', 'ViewDocumentCreatedTab', 'ViewApproverTab'];
    }
    return [];
  }
}