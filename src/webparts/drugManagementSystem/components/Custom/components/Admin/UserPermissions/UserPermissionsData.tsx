import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  roles: string[];
  groups: string[];
  role?: string; // For component compatibility (shows in grid)
  status?: 'Active' | 'Inactive';
  ProjectName?: string;
  loginName?: string;
}

export function UserPermissionsData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [users, setUsers] = React.useState<UserWithRoles[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<UserWithRoles[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'All' | 'Admin' | 'HR' | 'Author' | 'Approver'>('All');

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [editingUser, setEditingUser] = React.useState<UserWithRoles | null>(null);
  const [formData, setFormData] = React.useState<Partial<UserWithRoles>>({
    name: '',
    email: '',
    roles: []
  });

  // Delete dialog state for component compatibility
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [canAddUser, setCanAddUser] = React.useState(true);

  // Loading and messages
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Stats
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    adminCount: 0,
    hrCount: 0,
    authorCount: 0,
    approverCount: 0
  });

  const calculateStats = (userList: UserWithRoles[]) => {
    const stats = {
      totalUsers: userList.length,
      adminCount: userList.filter(u => u.roles.includes('Admin')).length,
      hrCount: userList.filter(u => u.roles.includes('HR')).length,
      authorCount: userList.filter(u => u.roles.includes('Author')).length,
      approverCount: userList.filter(u => u.roles.includes('Approver')).length
    };
    setStats(stats);
  };

  const loadUsers = React.useCallback(async () => {
    if (!provider) {
      // Mock data for development
      const mockUsers: UserWithRoles[] = [
        { id: 1, name: 'John Smith', email: 'john.smith@company.com', roles: ['Admin'], groups: ['DMS Admins'], status: 'Active' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', roles: ['HR'], groups: ['DMS HR'], status: 'Active' },
        { id: 3, name: 'Michael Brown', email: 'michael.brown@company.com', roles: ['Author'], groups: ['DMS Members'], status: 'Active' },
        { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', roles: ['Approver'], groups: ['DMS Approvers'], status: 'Active' },
        { id: 5, name: 'Robert Wilson', email: 'robert.wilson@company.com', roles: ['Author', 'Approver'], groups: ['DMS Members', 'DMS Approvers'], status: 'Active' },
        { id: 6, name: 'Lisa Anderson', email: 'lisa.anderson@company.com', roles: ['Author'], groups: ['DMS Members'], status: 'Active' },
        { id: 7, name: 'David Martinez', email: 'david.martinez@company.com', roles: ['Approver'], groups: ['DMS Approvers'], status: 'Active' },
        { id: 8, name: 'Jennifer Taylor', email: 'jennifer.taylor@company.com', roles: ['Admin'], groups: ['DMS Admins'], status: 'Active' }
      ];
      setUsers(mockUsers);
      calculateStats(mockUsers);
      return;
    }

    setIsLoading(true);
    try {
      // Get users from different SharePoint groups
      const [adminUsers, hrUsers, authorUsers, approverUsers] = await Promise.all([
        provider.getUsersFromGroup('DMS Admins').catch(() => [] as any[]),
        provider.getUsersFromGroup('DMS HR').catch(() => [] as any[]),
        provider.getUsersFromGroup('DMS Members').catch(() => [] as any[]),
        provider.getUsersFromGroup('DMS Approvers').catch(() => [] as any[])
      ]);

      // Merge users and their roles
      const userMap = new Map<number, UserWithRoles>();

      const addUsers = (userList: any[], role: string, groupName: string) => {
        userList.forEach(u => {
          if (userMap.has(u.value)) {
            const existing = userMap.get(u.value)!;
            if (!existing.roles.includes(role)) {
              existing.roles.push(role);
            }
            if (!existing.groups.includes(groupName)) {
              existing.groups.push(groupName);
            }
          } else {
            userMap.set(u.value, {
              id: u.value,
              name: u.label,
              email: u.email || '',
              roles: [role],
              groups: [groupName]
            });
          }
        });
      };

      addUsers(adminUsers, 'Admin', 'DMS Admins');
      addUsers(hrUsers, 'HR', 'DMS HR');
      addUsers(authorUsers, 'Author', 'DMS Members');
      addUsers(approverUsers, 'Approver', 'DMS Approvers');

      const userList = Array.from(userMap.values()).map(u => ({
        ...u,
        role: u.roles.join(', '), // Populate singular role for the grid
        status: u.status ?? 'Active'
      }));
      setUsers(userList);
      calculateStats(userList);
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load users:', error);
      setErrorMessage('Unable to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);



  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const applyFilters = React.useCallback(() => {
    let filtered = [...users];

    if (roleFilter !== 'All') {
      filtered = filtered.filter(u => u.roles.includes(roleFilter));
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const openAddPanel = () => {
    setPanelMode('add');
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      roles: []
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (user: UserWithRoles) => {
    setPanelMode('edit');
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roles: [...user.roles]
    });
    setIsPanelOpen(true);
  };

  const openViewPanel = (user: UserWithRoles) => {
    setPanelMode('view');
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roles: [...user.roles]
    });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      roles: []
    });
  };

  const handleSave = async (): Promise<boolean> => {
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('User name is required.');
      return false;
    }
    if (!provider) {
      setSuccessMessage('Demo mode: User permissions saved locally.');
      closePanel();
      return true;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      if (panelMode === 'add') {
        const groupMapping: Record<string, string> = {
          'Admin': 'DMS Admins',
          'HR': 'DMS HR',
          'Author': 'DMS Members',
          'Approver': 'DMS Approvers'
        };
        const groupName = groupMapping[formData.role || 'Author'];
        // Note: For 'add', we assume formData.email or name can be used as LoginName
        // In a real app, a PeoplePicker would provide the LoginName
        await provider.addUserToGroup(formData.email || formData.name || '', groupName);
        setSuccessMessage('User added to group successfully.');
      } else if (panelMode === 'edit' && editingUser) {
        // Logic for changing roles could involve removing from old groups and adding to new ones
        // For now, let's just re-add to ensure they are in the selected group
        const groupMapping: Record<string, string> = {
          'Admin': 'DMS Admins',
          'HR': 'DMS HR',
          'Author': 'DMS Members',
          'Approver': 'DMS Approvers'
        };
        const groupName = groupMapping[formData.role || 'Author'];
        await provider.addUserToGroup(editingUser.email || editingUser.name, groupName);
        setSuccessMessage('User permissions updated successfully.');
      }

      await loadUsers();
      closePanel();
      return true;
    } catch (error) {
      console.error('Failed to save user permissions:', error);
      setErrorMessage('Unable to save user permissions. Please ensure the user exists and specify their correct LoginName or Email.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setRoleFilter('All');
    setSearchTerm('');
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Admin': return '#1565C0';
      case 'HR': return '#7B1FA2';
      case 'Author': return '#2E7D32';
      case 'Approver': return '#E65100';
      default: return '#666';
    }
  };

  // Compatibility handlers for component
  const addUser = async (): Promise<boolean> => {
    if (!formData.name?.trim()) {
      setFieldErrors({ name: 'User name is required' });
      return false;
    }
    return await handleSave();
  };

  const saveEdit = async (): Promise<boolean> => {
    return await handleSave();
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const groupMapping: Record<string, string> = {
        'Admin': 'DMS Admins',
        'HR': 'DMS HR',
        'Author': 'DMS Members',
        'Approver': 'DMS Approvers'
      };

      // Remove from all groups they belong to in this context
      for (const group of editingUser.groups) {
        await provider.removeUserFromGroup(editingUser.id, group);
      }

      setSuccessMessage('User removed from groups successfully.');
      await loadUsers();
      setIsDeleteDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to remove user:', error);
      setErrorMessage('Unable to remove user from group.');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length > 0) {
      setIsDeleteDialogOpen(true);
    }
  };

  return {
    users,
    filteredUsers,
    selectedIds,
    searchTerm,
    roleFilter,
    isPanelOpen,
    panelMode,
    formData,
    editingUser,
    isLoading,
    errorMessage,
    successMessage,
    stats,
    isDeleteDialogOpen,
    fieldErrors,
    canAddUser,
    setSelectedIds,
    setSearchTerm,
    setRoleFilter,
    setFormData,
    setIsDeleteDialogOpen,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    resetFilters,
    loadUsers,
    getRoleBadgeColor,
    // Compatibility properties
    addUser,
    saveEdit,
    openDeleteDialog,
    confirmDelete,
    bulkDelete
  };
}
