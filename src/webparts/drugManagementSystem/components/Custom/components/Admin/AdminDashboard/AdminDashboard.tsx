/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faClock,
  faFileLines,
  faFolder,
  faEye,
  faPenToSquare,
  faPlus,
  faList,
  faTrashCan,
  faUsers,
  faFolderOpen,
  faFileArrowUp,
  faUserPen,
  faChartPie,
  faGear
} from '@fortawesome/free-solid-svg-icons';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { CustomModal } from '../../../../Common/CustomModal';
import { CreateDocumentPage } from '../CreateDocumentPage/CreateDocumentPage';
import { Loader } from '../../../../Common/Loader/Loader';
import type { Document, User } from '../../../types';
import { AdminDashboardData } from './AdminDashboardData';
import type { AdminDashboardSortField } from './AdminDashboardData';
import { showToast } from '../../../../Common/Toast/toastBus';
import { FileIconHelper } from '../../../utils/fileIconHelper';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';
import { StatusBadge } from '../../../../Common/StatusBadge/StatusBadge';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';

export const AdminDashboard: React.FC = () => {
  const {
    stats,
    recentUsers,
    sortedDocuments,
    isViewModalOpen,
    isEditing,
    editName,
    editCategory,
    isWizardOpen,
    isSignatureModalOpen,
    viewingDocument,
    signature,
    errorMessage,
    successMessage,
    isLoading,
    setIsViewModalOpen,
    setIsEditing,
    setEditName,
    setEditCategory,
    setIsWizardOpen,
    setIsSignatureModalOpen,
    setSignature,
    loadData,
    handleSort,
    handleSaveChanges,
    handleDeleteDocument,
    handleOpenDocument,
    handleFinalApprove,
    getSortIcon
  } = AdminDashboardData();

  React.useEffect(() => {
    if (successMessage) showToast({ type: 'success', message: successMessage });
  }, [successMessage]);
  React.useEffect(() => {
    if (errorMessage) showToast({ type: 'error', message: errorMessage });
  }, [errorMessage]);

  if (isWizardOpen) {
    return (
      <CreateDocumentPage
        onCancel={() => setIsWizardOpen(false)}
        onSuccess={() => {
          void loadData();
          setIsWizardOpen(false);
        }}
      />
    );
  }

  const statCards = [
    {
      title: 'Total Documents',
      count: stats.totalDocuments,
      icon: faFileLines,
      color: 'blue' as const,
      subtitle: 'All documents in system'
    },
    {
      title: 'Total Templates',
      count: stats.templates,
      icon: faList,
      color: 'purple' as const,
      subtitle: 'Available templates'
    },
    {
      title: 'Total Categories',
      count: stats.categories,
      icon: faFolder,
      color: 'orange' as const,
      subtitle: 'Document categories'
    },
    {
      title: 'Total Users',
      count: stats.users,
      icon: faUsers,
      color: 'blue' as const,
      subtitle: 'Active users'
    },
    {
      title: 'Review Pending',
      count: stats.reviewPending,
      icon: faClock,
      color: 'orange' as const,
      subtitle: 'Awaiting review'
    },
    {
      title: 'Approved Documents',
      count: stats.approved,
      icon: faCircleCheck,
      color: 'green' as const,
      subtitle: 'Successfully approved'
    }
  ];

  const recentDocumentsColumns: any[] = [
    {
      key: 'name',
      name: `Document Name ${getSortIcon('name' as AdminDashboardSortField)}`,
      fieldName: 'name',
      minWidth: 220,
      maxWidth: 360,
      isSortingRequired: true,
      onColumnClick: () => handleSort('name'),
      onRender: (item: Document) => {
        const iconInfo = FileIconHelper.getFileIcon(item.name);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 16,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: iconInfo.bgColor,
              borderRadius: 4,
              color: iconInfo.color
            }}>
              <FontAwesomeIcon icon={iconInfo.icon} />
            </div>
            <span>{item.name}</span>
          </div>
        );
      }
    },
    {
      key: 'category',
      name: `Category ${getSortIcon('category' as AdminDashboardSortField)}`,
      fieldName: 'category',
      minWidth: 140,
      maxWidth: 200,
      isSortingRequired: true,
      onColumnClick: () => handleSort('category'),
      onRender: (item: Document) => <span className="category-badge">{item.category}</span>
    },
    {
      key: 'author',
      name: `Author ${getSortIcon('author' as AdminDashboardSortField)}`,
      fieldName: 'author',
      minWidth: 120,
      maxWidth: 160,
      isSortingRequired: true,
      onColumnClick: () => handleSort('author'),
      onRender: (item: Document) => <span>{item.author || '-'}</span>
    },
    {
      key: 'status',
      name: `Status ${getSortIcon('status' as AdminDashboardSortField)}`,
      fieldName: 'status',
      minWidth: 120,
      maxWidth: 160,
      isSortingRequired: true,
      onColumnClick: () => handleSort('status'),
      onRender: (item: Document) => (
        <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'lastModified',
      name: `Last Modified ${getSortIcon('lastModified' as AdminDashboardSortField)}`,
      fieldName: 'lastModified',
      minWidth: 120,
      maxWidth: 160,
      isSortingRequired: true,
      onColumnClick: () => handleSort('lastModified')
    },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      minWidth: 90,
      maxWidth: 120,
      onRender: (item: Document) => (
        <div className="action-buttons">
          <DefaultButton onClick={() => handleOpenDocument(item)}>
            <FontAwesomeIcon icon={faEye} style={{ marginRight: 8 }} />
            View
          </DefaultButton>
        </div>
      )
    }
  ];

  const recentUsersColumns: any[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 220,
      maxWidth: 320,
      onRender: (user: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="user-avatar-small" style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#1E88E5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {user.name.split(' ').map((n: any) => n[0]).join('')}
          </div>
          <strong>{user.name}</strong>
        </div>
      )
    },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 220, maxWidth: 320 },
    {
      key: 'role',
      name: 'Role',
      fieldName: 'role',
      minWidth: 120,
      maxWidth: 160,
      onRender: (user: User) => <span className="category-badge">{user.role}</span>
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 120,
      maxWidth: 160,
      onRender: (user: User) => (
        <span className={`status-badge status-${user.status.toLowerCase()}`}>
          {user.status}
        </span>
      )
    }
  ];

  return (
    <div>
      {isLoading && <Loader />}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => { } },
          { label: 'Admin Dashboard', isActive: true }
        ]}
      />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Dashboarddddd</h1>
      </div>

      <div className="enhanced-stats-grid">
        {statCards.map((card, index) => (
          <SummaryCard
            key={index}
            title={card.title}
            value={card.count}
            icon={card.icon}
            color={card.color}
            subtitle={card.subtitle}
          />
        ))}
      </div>

      {/* <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '12px' }}>Quick Actions</h3>
        <div className="dms-quick-actions">
          <button className="dms-quick-action-btn dms-quick-action-btn--primary" onClick={() => setIsWizardOpen(true)}>
            <FontAwesomeIcon icon={faFileArrowUp} />
            Create Document
          </button>
          <button className="dms-quick-action-btn" onClick={() => window.location.href = '#/manage-documents'}>
            <FontAwesomeIcon icon={faFolderOpen} />
            Browse Documents
          </button>
          <button className="dms-quick-action-btn" onClick={() => window.location.href = '#/manage-categories'}>
            <FontAwesomeIcon icon={faList} />
            Manage Categories
          </button>
          <button className="dms-quick-action-btn" onClick={() => window.location.href = '#/user-permissions'}>
            <FontAwesomeIcon icon={faUserPen} />
            Add User
          </button>
          <button className="dms-quick-action-btn" onClick={() => window.location.href = '#/reports'}>
            <FontAwesomeIcon icon={faChartPie} />
            View Reports
          </button>
          <button className="dms-quick-action-btn" onClick={() => window.location.href = '#/manage-templates'}>
            <FontAwesomeIcon icon={faGear} />
            Manage Templates
          </button>
        </div>
      </div> */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h3 className="table-title">Recent Documents</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Latest 5 documents added to the system</p>
          </div>
          <PrimaryButton
            onClick={() => setIsWizardOpen(true)}
            styles={{
              root: { background: '#1E88E5', borderColor: '#1E88E5' },
              rootHovered: { background: '#1565C0', borderColor: '#1565C0' },
              rootPressed: { background: '#0D47A1', borderColor: '#0D47A1' }
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            Create New Document
          </PrimaryButton>
        </div>
        <MemoizedDataGridComponent
          items={sortedDocuments}
          columns={recentDocumentsColumns}
          reRenderComponent={true}
          onSelectedItem={() => {}}
        />
      </div>

      <div className="table-card" style={{ marginTop: '24px' }}>
        <div className="table-header">
          <div>
            <h3 className="table-title">Recent Users</h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Latest 5 active users in the system</p>
          </div>
        </div>
        <MemoizedDataGridComponent
          items={recentUsers}
          columns={recentUsersColumns}
          reRenderComponent={true}
          onSelectedItem={() => {}}
        />
      </div>

      <CustomModal
        isModalOpenProps={isViewModalOpen}
        setModalpopUpFalse={setIsViewModalOpen}
        subject="Document Details"
        isLoading={isLoading}
        message={
          viewingDocument ? (
            <div>
              <div className="document-details">
                <div className="detail-item">
                  <div className="detail-label">Document Name</div>
                  <div className="detail-value">{viewingDocument.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{viewingDocument.category}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-badge status-${viewingDocument.status.toLowerCase().replace(' ', '-')}`}>
                      {viewingDocument.status}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Author</div>
                  <div className="detail-value">{viewingDocument.author || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Last Modified</div>
                  <div className="detail-value">{viewingDocument.lastModified}</div>
                </div>
              </div>

              {isEditing && (
                <div style={{ marginTop: 20 }}>
                  <TextField
                    label="Document Name"
                    value={editName}
                    onChange={(_e, v) => setEditName(v ?? '')}
                  />
                  <TextField
                    label="Category"
                    value={editCategory}
                    onChange={(_e, v) => setEditCategory(v ?? '')}
                    styles={{ root: { marginTop: 12 } }}
                  />
                </div>
              )}
            </div>
          ) : (
            ''
          )
        }
        closeButtonText="Close"
        yesButtonText={isEditing ? 'Save Changes' : 'Edit'}
        onClickOfYes={
          isEditing
            ? handleSaveChanges
            : () => {
              setEditName(viewingDocument?.name ?? '');
              setEditCategory(viewingDocument?.category ?? '');
              setIsEditing(true);
            }
        }
        thirdButtonText={isEditing ? undefined : 'Delete'}
        onClickThirdButton={isEditing ? undefined : handleDeleteDocument}
        onClose={() => setIsEditing(false)}
      />
      <CustomModal
        isModalOpenProps={isSignatureModalOpen}
        setModalpopUpFalse={setIsSignatureModalOpen}
        subject="Final Approval with eSignature"
        isLoading={isLoading}
        message={
          viewingDocument ? (
            <div>
              <div className="document-details">
                <div className="detail-item">
                  <div className="detail-label">Document Name</div>
                  <div className="detail-value">{viewingDocument.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{viewingDocument.category}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Author</div>
                  <div className="detail-value">{viewingDocument.author || 'Unknown'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Reviewer</div>
                  <div className="detail-value">{viewingDocument.reviewer || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className="status-badge status-approved">Reviewer Approved</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <TextField
                  label="eSignature *"
                  placeholder="Type your full name as electronic signature"
                  value={signature}
                  onChange={(_e, v) => setSignature(v ?? '')}
                />
                <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                  By typing your name, you electronically sign and approve this document.
                </p>
              </div>
            </div>
          ) : (
            ''
          )
        }
        closeButtonText="Cancel"
        yesButtonText="Submit Final Approval"
        onClickOfYes={handleFinalApprove}
        isYesButtonDisbale={!signature}
      />
    </div>
  );
};


