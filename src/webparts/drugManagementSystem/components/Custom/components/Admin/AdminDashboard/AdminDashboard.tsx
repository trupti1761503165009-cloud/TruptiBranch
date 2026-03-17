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
  faGear,
  faArrowsRotate,
  faCheck,
  faXmark,
  faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
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
    confirmDeleteDocument,
    isDeleteDocModalOpen,
    setIsDeleteDocModalOpen,
    handleUpdateDocument,
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

  // Approval / Reject modal state
  const [approvalModal, setApprovalModal] = React.useState<{
    open: boolean;
    doc: Document | null;
    action: 'approve' | 'reject' | null;
  }>({ open: false, doc: null, action: null });

  const tooltipId = React.useRef('admin-dash-tooltip').current;
  const [isDisplayEDbtn, setIsDisplayEDbtn] = React.useState(false);
  const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState(false);
  const [localUpdateItem, setLocalUpdateItem] = React.useState<any[]>([]);

  const _onItemSelectedDocs = (item: any[]): void => {
    if (item.length > 0) {
      setIsDisplayEditButtonview(item.length === 1);
      setLocalUpdateItem(item);
      setIsDisplayEDbtn(true);
    } else {
      setIsDisplayEditButtonview(false);
      setLocalUpdateItem([]);
      setIsDisplayEDbtn(false);
    }
  };

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
              fontSize: 16, width: 28, height: 28, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: iconInfo.bgColor, borderRadius: 4, color: iconInfo.color
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
        <StatusBadge status={item.status.toLowerCase().replace(/\s+/g, '-')} size="small" />
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
      name: 'ACTIONS',
      fieldName: 'actions',
      minWidth: 140,
      maxWidth: 180,
      onRender: (item: Document) => (
        <div className="dflex" style={{ gap: 6 }}>
          <Link className="actionBtn iconSize btnView" onClick={() => handleOpenDocument(item)}>
            <TooltipHost content="View"><FontAwesomeIcon icon={faEye} /></TooltipHost>
          </Link>
          <Link
            className="actionBtn iconSize btnEdit ml-10"
            onClick={() => setApprovalModal({ open: true, doc: item, action: 'approve' })}
          >
            <TooltipHost content="Approve">
              <FontAwesomeIcon icon={faCheck} style={{ color: '#2e7d32' }} />
            </TooltipHost>
          </Link>
          <Link
            className="actionBtn iconSize btnDanger ml-10"
            onClick={() => setApprovalModal({ open: true, doc: item, action: 'reject' })}
          >
            <TooltipHost content="Reject"><FontAwesomeIcon icon={faXmark} /></TooltipHost>
          </Link>
          <Link className="actionBtn iconSize btnView ml-10" onClick={() => handleOpenDocument(item)}>
            <TooltipHost content="History"><FontAwesomeIcon icon={faClockRotateLeft} /></TooltipHost>
          </Link>
        </div>
      )
    }
  ];

  const recentUsersColumns: any[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 300,
      onRender: (user: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#1E88E5',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0
          }}>
            {user.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <strong>{user.name}</strong>
        </div>
      )
    },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 200, maxWidth: 300 },
    {
      key: 'role',
      name: 'Role',
      fieldName: 'role',
      minWidth: 100,
      maxWidth: 140,
      onRender: (user: User) => <span className="category-badge">{user.role}</span>
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 100,
      maxWidth: 130,
      onRender: (user: User) => (
        <StatusBadge status={user.status.toLowerCase()} size="small" />
      )
    }
  ];

  return (
    <div className="pageContainer" style={{ paddingTop: 0 }}>
      {isLoading && <Loader />}

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>Admin Dashboard</h1>

      {/* ===== SECTION 1: Summary Cards ===== */}
      <div style={{
        background: '#fff', borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '16px 20px', marginBottom: 16
      }}>
        <div className="summary-cards-container" style={{ marginBottom: 0 }}>
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
      </div>

      {/* ===== SECTION 2: Breadcrumb ===== */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ label: 'Admin Dashboard', isActive: true }]} />
      </div>

      {/* ===== SECTION 3: Documents Grid ===== */}
      <div style={{ marginBottom: 16 }}>
        <MemoizedDataGridComponent
          items={sortedDocuments}
          columns={recentDocumentsColumns}
          reRenderComponent={true}
          isPagination={true}
          searchable={true}
          CustomselectionMode={2}
          onSelectedItem={_onItemSelectedDocs}
          isAddNew={true}
          addEDButton={
            isDisplayEDbtn ? (
              <div className="dflex">
                {isDisplayEditButtonview && (
                  <Link
                    className="actionBtn iconSize btnView"
                    onClick={() => localUpdateItem[0] && handleOpenDocument(localUpdateItem[0])}
                  >
                    <TooltipHost content="View Document" id={tooltipId}>
                      <FontAwesomeIcon icon={faEye} />
                    </TooltipHost>
                  </Link>
                )}
                <Link
                  className="actionBtn iconSize btnDanger ml-10"
                  onClick={() => localUpdateItem[0] && handleOpenDocument(localUpdateItem[0])}
                >
                  <TooltipHost content="Delete" id={tooltipId}>
                    <FontAwesomeIcon icon={faTrashCan} />
                  </TooltipHost>
                </Link>
              </div>
            ) : false
          }
          addNewContent={
            <div className="dflex pb-1">
              <PrimaryButton
                className="btn btn-primary"
                onClick={() => setIsWizardOpen(true)}
                text="Create New Document"
              />
              <Link className="actionBtn iconSize btnRefresh ml-10" onClick={() => { void loadData(); }}>
                <TooltipHost content="Refresh Grid">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
            </div>
          }
        />
      </div>

      {/* ===== SECTION 4: Users Grid ===== */}
      <div>
        <MemoizedDataGridComponent
          items={recentUsers}
          columns={recentUsersColumns}
          reRenderComponent={true}
          isPagination={true}
          searchable={true}
          CustomselectionMode={0}
          onSelectedItem={() => { }}
          isAddNew={false}
        />
      </div>

      {/* ===== Approve / Reject Modal ===== */}
      <CustomModal
        isModalOpenProps={approvalModal.open}
        setModalpopUpFalse={() => setApprovalModal({ open: false, doc: null, action: null })}
        subject={approvalModal.action === 'approve' ? 'Approve Document' : 'Reject Document'}
        isLoading={isLoading}
        message={
          approvalModal.doc ? (
            <div>
              <p>
                Are you sure you want to <strong>{approvalModal.action === 'approve' ? 'approve' : 'reject'}</strong> the document:
              </p>
              <p style={{ fontWeight: 600, color: '#333' }}>{approvalModal.doc.name}</p>
            </div>
          ) : ''
        }
        yesButtonText={approvalModal.action === 'approve' ? 'Approve' : 'Reject'}
        closeButtonText="Cancel"
        onClickOfYes={async () => {
          if (approvalModal.doc && approvalModal.action) {
            const newStatus = approvalModal.action === 'approve' ? 'Approved' : 'Rejected';
            await handleUpdateDocument(approvalModal.doc.id, { Status: newStatus });
            setApprovalModal({ open: false, doc: null, action: null });
          }
        }}
        onClose={() => setApprovalModal({ open: false, doc: null, action: null })}
      />

      {/* ===== View Document Modal ===== */}
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
                    <StatusBadge status={viewingDocument.status.toLowerCase().replace(' ', '-')} size="small" />
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
          ) : ''
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

      {/* ===== Delete Document Confirmation Modal ===== */}
      <CustomModal
        isModalOpenProps={isDeleteDocModalOpen}
        setModalpopUpFalse={() => setIsDeleteDocModalOpen(false)}
        subject="Delete Document"
        isLoading={isLoading}
        message={
          viewingDocument ? (
            <div>
              <p>Are you sure you want to permanently delete:</p>
              <p style={{ fontWeight: 600, color: '#d32f2f' }}>{viewingDocument.name}</p>
              <p style={{ fontSize: 12, color: '#666' }}>This action cannot be undone.</p>
            </div>
          ) : ''
        }
        yesButtonText="Delete"
        closeButtonText="Cancel"
        onClickOfYes={confirmDeleteDocument}
        onClose={() => setIsDeleteDocModalOpen(false)}
      />

      {/* ===== eSignature Approval Modal ===== */}
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
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <StatusBadge status="approved" size="small" />
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
          ) : ''
        }
        closeButtonText="Cancel"
        yesButtonText="Submit Final Approval"
        onClickOfYes={handleFinalApprove}
        isYesButtonDisbale={!signature}
      />
    </div>
  );
};
