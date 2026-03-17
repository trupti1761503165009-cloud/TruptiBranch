/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import type { User } from '../../../types';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Link, TooltipHost } from '@fluentui/react';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faPenToSquare, faTrashCan, faUser, faUsers, faUserShield, faUserTie, faUserCheck, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import {MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { UserPermissionsData } from './UserPermissionsData';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';
import { StatusBadge } from '../../../../Common/StatusBadge/StatusBadge';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { Loader } from '../../../../Common/Loader/Loader';

import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';

export const UserPermissions: React.FC<any> = (props) => {
  const {
    filteredUsers,
    searchTerm,
    selectedIds,
    isDeleteDialogOpen,
    formData,
    fieldErrors,
    canAddUser,
    isLoading,
    setSearchTerm,
    setSelectedIds,
    setIsDeleteDialogOpen,
    setFormData,
    addUser,
    saveEdit,
    openDeleteDialog,
    confirmDelete,
    bulkDelete,
    loadUsers
  } = UserPermissionsData();

  const hrOnly: boolean = !!(props.hrOnly);

  // Form Page State (not Panel)
  const [formMode, setFormMode] = React.useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<string>(hrOnly ? 'HR' : 'All');

  // Message Dialog State
  const [messageDialog, setMessageDialog] = React.useState<{
    hidden: boolean;
    type: MessageType;
    title: string;
    message: string;
    fields: string[];
  }>({ hidden: true, type: 'info', title: '', message: '', fields: [] });

  const showMessage = (type: MessageType, title: string, message: string, fields: string[] = []) => {
    setMessageDialog({ hidden: false, type, title, message, fields });
  };

  const hideMessage = () => {
    setMessageDialog(prev => ({ ...prev, hidden: true }));
  };

  // Role options matching SharePoint Groups: Admin, HR, Users
  const roleOptions: IReactDropOptionProps[] = React.useMemo(() => [
    { label: 'Admin', value: 'Admin' },
    { label: 'HR', value: 'HR' },
    { label: 'Author', value: 'Author' }
  ], []);

  const roleFilterOptions: IReactDropOptionProps[] = React.useMemo(() => [
    { label: 'All Roles', value: 'All' },
    ...roleOptions
  ], [roleOptions]);

  const statusOptions: IReactDropOptionProps[] = React.useMemo(() => [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ], []);

  // Filter users by role
  const displayedUsers = React.useMemo(() => {
    if (roleFilter === 'All') return filteredUsers;
    return filteredUsers.filter(u => u.role === roleFilter);
  }, [filteredUsers, roleFilter]);

  // Group users by role for summary
  const roleSummary = React.useMemo(() => {
    const summary: Record<string, number> = {
      'Admin': 0,
      'HR': 0,
      'Author': 0
    };
    filteredUsers.forEach((user: any) => {
      const roles: string[] = Array.isArray((user as any).roles) ? (user as any).roles : [user.role];
      roles.forEach(r => {
        if (summary[r] !== undefined) summary[r]++;
      });
    });
    return summary;
  }, [filteredUsers]);

  const openFormPage = (mode: 'add' | 'edit' | 'view', user?: User) => {
    setFormMode(mode);
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Author',
        status: user.status || 'Active',
        ProjectName: (user as any).ProjectName || ''
      });
    } else {
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'Author', status: 'Active', ProjectName: '' });
    }
  };

  const closeFormPage = () => {
    setFormMode('list');
    setSelectedUser(null);
  };

  // Validate form
  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.name || !formData.name.trim()) {
      errors.push('Full Name');
    }
    if (!formData.email || !formData.email.trim()) {
      errors.push('Email Address');
    }
    return errors;
  };

  const handleFormSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showMessage('validation', 'Validation Error', 'Please complete all required fields.', validationErrors);
      return;
    }

    try {
      let success = false;
      if (formMode === 'add') {
        success = await addUser();
        if (success) showMessage('success', 'Success', 'User has been added successfully!');
      } else if (formMode === 'edit') {
        success = await saveEdit();
        if (success) showMessage('success', 'Updated', 'User has been updated successfully!');
      }

      if (success) {
        setTimeout(() => {
          closeFormPage();
        }, 1500);
      }
    } catch (error) {
      showMessage('error', 'Error', 'Failed to save user. Please try again.');
    }
  };

  const getFormTitle = () => {
    if (formMode === 'add') return 'Add New User';
    if (formMode === 'edit') return `Edit User - ${selectedUser?.name || ''}`;
    return `View User - ${selectedUser?.name || ''}`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return faUserShield;
      case 'HR': return faUserTie;
      case 'Approver': return faUserCheck;
      default: return faUsers;
    }
  };

  const columns: any[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 280,
      isSortingRequired: true,
      onRender: (item: User) => (
        <TooltipHost content={item.name}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
        </TooltipHost>
      )
    },
    {
      key: 'email',
      name: 'Email',
      fieldName: 'email',
      minWidth: 220,
      maxWidth: 300,
      isSortingRequired: true,
      onRender: (item: User) => (
        <TooltipHost content={item.email}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.email}
          </span>
        </TooltipHost>
      )
    },
    {
      key: 'role',
      name: 'Role (SharePoint Group)',
      fieldName: 'role',
      minWidth: 180,
      maxWidth: 220,
      isSortingRequired: true,
      onRender: (item: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FontAwesomeIcon icon={getRoleIcon(item && item?.role)} style={{ color: '#1E88E5' }} />
          <span>{item.role}</span>
        </div>
      )
    },
    {
      key: 'status',
      name: 'STATUS',
      fieldName: 'status',
      minWidth: 100,
      maxWidth: 140,
      isSortingRequired: true,
      onRender: (item: User) => {
        const status = (item.status || 'Active').toLowerCase();
        return <StatusBadge status={status} size="small" />;
      }
    },
  ];

  const isReadOnly = formMode === 'view';


  // LIST VIEW
  return (
    <div data-testid="user-permissions-page">
      {/* Loading Overlay */}
      {isLoading && <Loader />}

      {/* Message Dialog */}
      <MessageDialog
        hidden={messageDialog.hidden}
        onDismiss={hideMessage}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
        fields={messageDialog.fields}
      />

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>
        {hrOnly ? 'HR Group Members' : 'User Permissions'}
      </h1>

      {/* ===== SECTION 1: Summary Cards ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '16px 20px',
        marginBottom: 16
      }}>
        <div className="summary-cards-container" style={{ marginBottom: 0 }}>
          {!hrOnly && (
            <SummaryCard
              title="Admins"
              value={roleSummary['Admin']}
              icon={faUserShield}
              color="blue"
            />
          )}
          <SummaryCard
            title="HR"
            value={roleSummary['HR']}
            icon={faUserTie}
            color="green"
          />
          {!hrOnly && (
            <SummaryCard
              title="Users"
              value={roleSummary['Author']}
              icon={faUsers}
              color="orange"
            />
          )}
        </div>
      </div>

      {/* ===== SECTION 2: Filters ===== */}
      {!hrOnly && (
        <div style={{
          background: '#fff',
          borderRadius: 5,
          boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
          padding: '12px 20px',
          marginBottom: 16
        }}>
          <div className="ms-Grid">
            <div className="ms-Grid-row" style={{ alignItems: 'flex-end' }}>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <div className="formControl">
                  <ReactDropdown
                    name="roleFilter"
                    options={roleFilterOptions}
                    defaultOption={roleFilterOptions.find(o => o.value === roleFilter) || roleFilterOptions[0]}
                    onChange={(opt) => setRoleFilter(opt?.value ?? 'All')}
                    isCloseMenuOnSelect={true}
                    isSorted={false}
                    isClearable={false}
                  />
                </div>
              </div>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ paddingTop: 4, display: 'flex', alignItems: 'center' }}>
                <DefaultButton
                  text="Reset"
                  onClick={() => { setRoleFilter('All'); setSearchTerm(''); }}
                  styles={{
                    root: { background: '#d32f2f', borderColor: '#d32f2f', color: '#fff', minWidth: 100, borderRadius: 4 },
                    rootHovered: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                    rootPressed: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                    label: { color: '#fff', fontWeight: 600 },
                    icon: { color: '#fff' }
                  }}
                  onRenderIcon={() => <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: 6, color: '#fff' }} />}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SECTION 3: Breadcrumb ===== */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ label: 'Roles & Permissions', isActive: true }]} />
      </div>

      {/* ===== SECTION 4: Grid ===== */}
      <div className="boxCard" style={{ padding: 0, margin: 0, minHeight: 'auto' }}>
        <MemoizedDataGridComponent
          items={displayedUsers}
          columns={columns}
          reRenderComponent={true}
          isPagination={true}
          onSelectedItem={(items: User[]) => setSelectedIds(items.map(i => i.id))}
          isAddNew={true}
          addNewContent={
            <div className="dflex pb-1">
              <Link
                className="actionBtn iconSize btnRefresh icon-mr"
                style={{ paddingBottom: "2px" }}
                onClick={() => {
                  setRoleFilter('All');
                  setSearchTerm('');
                  void loadUsers();
                }}
              >
                <TooltipHost content={"Refresh Data"}>
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
              <PrimaryButton
                text="Add User to Group"
                className="btn btn-primary"
                onClick={() => {
                  props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddUser
                  });
                }}
              />
            </div>
          }
          addEDButton={
            selectedIds.length > 0 && (
              <div className="dflex">
                {selectedIds.length === 1 && (
                  <>
                    <Link
                      className="actionBtn iconSize btnView"
                      onClick={() => {
                        const item = displayedUsers.find(u => u.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditUser,
                            componentProps: { item, mode: 'view' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="View Details">
                        <FontAwesomeIcon icon={faEye} />
                      </TooltipHost>
                    </Link>
                    <Link
                      className="actionBtn iconSize btnEdit ml-10"
                      onClick={() => {
                        const item = displayedUsers.find(u => u.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditUser,
                            componentProps: { item, mode: 'edit' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="Edit">
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </TooltipHost>
                    </Link>
                  </>
                )}
                <Link
                  className="actionBtn iconSize btnDanger ml-10"
                  onClick={() => openDeleteDialog()}
                >
                  <TooltipHost content="Remove from Group">
                    <FontAwesomeIcon icon={faTrashCan} />
                  </TooltipHost>
                </Link>
              </div>
            )
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Remove User from Group"
        message="Are you sure you want to remove this user from the SharePoint Group? This will revoke their permissions."
        yesButtonText="Remove"
        onClickOfYes={() => void confirmDelete()}
        closeButtonText="Cancel"
      />
    </div>
  );
};
