import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Link, TooltipHost } from '@fluentui/react';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faFolderPlus, faPenToSquare, faTrashCan, faUpload, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import '../CreateCTDFolder.css';
import { CreateCTDFolderData } from './CreateCTDFolderData';
import { Loader } from '../../../../Common/Loader/Loader';
import { RequiredFieldsDialog } from '../../../../Common/Dialogs/RequiredFieldsDialog';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { getFileTypeIcon } from '../../../../Common/utils';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const CreateCTDFolder: React.FC = () => {
  const {
    folders,
    isDeleteDialogOpen,
    folderToDelete,
    selectedParent,
    newFolderCode,
    newFolderName,
    newFolderDescription,
    newFolderSortOrder,
    searchTerm,
    fieldErrors,
    errorMessage,
    successMessage,
    isLoading,
    requiredDialogHidden,
    requiredFields,
    setRequiredDialogHidden,
    parentOptions,
    setIsDeleteDialogOpen,
    setSelectedParent,
    setNewFolderCode,
    setNewFolderName,
    setNewFolderDescription,
    setNewFolderSortOrder,
    setSearchTerm,
    handleCreateFolder,
    handleEditConfirm,
    handleDeleteClick,
    handleDeleteConfirm
  } = CreateCTDFolderData();

  const setAppGlobalState = useSetAtom(appGlobalStateAtom);

  // Message Dialog State (replaces toasts)
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

  React.useEffect(() => {
    if (successMessage) showMessage('success', 'Success', successMessage);
  }, [successMessage]);
  React.useEffect(() => {
    if (errorMessage && requiredDialogHidden) showMessage('error', 'Error', errorMessage);
  }, [errorMessage, requiredDialogHidden]);

  // Form Page State (not Panel)
  const [formMode, setFormMode] = React.useState<'list' | 'add' | 'edit' | 'view'>('list');

  React.useEffect(() => {
    const isForm = formMode !== 'list';
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isForm }));
    return () => {
      setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
    };
  }, [formMode, setAppGlobalState]);
  const [selectedFolder, setSelectedFolder] = React.useState<any | null>(null);

  const getParentFolderOptions = (): IReactDropOptionProps[] => parentOptions;

  const [folderTrail, setFolderTrail] = React.useState<string[]>([]);

  const folderById = React.useMemo(() => new Map(folders.map((f) => [String(f.id), f])), [folders]);
  const currentParentId = folderTrail.length ? folderTrail[folderTrail.length - 1] : undefined;

  const currentLevelFolders = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return folders
      .filter((f) => (currentParentId ? f.parentId === currentParentId : !f.parentId))
      .filter((f) => {
        if (!q) return true;
        return (f.code || '').toLowerCase().includes(q) || (f.name || '').toLowerCase().includes(q);
      })
      .sort((a, b) => (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) || (a.code || '').localeCompare(b.code || ''));
  }, [currentParentId, folders, searchTerm]);

  // Open form page for different modes
  const openFormPage = (mode: 'add' | 'edit' | 'view', folder?: any) => {
    setFormMode(mode);
    if (folder && mode !== 'add') {
      setSelectedFolder(folder);
      setNewFolderCode(folder.code || '');
      setNewFolderName(folder.name || '');
      setNewFolderDescription(folder.description || '');
      setNewFolderSortOrder(String(folder.sortOrder || ''));
      setSelectedParent(folder.parentId || '');
    } else {
      setSelectedFolder(null);
      setSelectedParent(currentParentId || '');
      setNewFolderCode(currentParentId ? (folderById.get(currentParentId)?.code || '') + '.' : '');
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderSortOrder('');
    }
  };

  const closeFormPage = () => {
    setFormMode('list');
    setSelectedFolder(null);
    setNewFolderCode('');
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderSortOrder('');
  };

  const handleFormSave = async () => {
    let success = false;
    if (formMode === 'add') {
      success = await handleCreateFolder();
    } else if (formMode === 'edit' && selectedFolder) {
      success = await handleEditConfirm();
    }

    if (success) {
      closeFormPage();
    }
  };

  const getFormTitle = () => {
    if (formMode === 'add') return currentParentId ? 'Create Subfolder' : 'Create Root Module';
    if (formMode === 'edit') return `Edit Folder - ${selectedFolder?.code || ''}`;
    return `View Folder - ${selectedFolder?.code || ''}`;
  };

  const folderColumns: any[] = React.useMemo(
    () => [
      {
        key: 'folder',
        name: 'FOLDER',
        fieldName: 'name',
        minWidth: 320,
        maxWidth: 560,
        isSortingRequired: true,
        onRender: (item: any) => (
          <div className="doc-name-cell">
            <img className="doc-icon" src={getFileTypeIcon('folder')} alt="" style={{ width: 16, height: 16, marginRight: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TooltipHost content={item.code}>
                <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</strong>
              </TooltipHost>
              <TooltipHost content={item.name}>
                <span style={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </TooltipHost>
            </div>
          </div>
        )
      },
      { key: 'createdDate', name: 'CREATED DATE', fieldName: 'createdDate', minWidth: 120, maxWidth: 160, isSortingRequired: true },
    ],
    [handleDeleteClick, setNewFolderCode, setSelectedParent]
  );



  const breadcrumbs = React.useMemo(() => {
    const crumbs: Array<{ id: any; label: string }> = [{ id: 'root', label: 'CTD/eCTD Folders' }];
    folderTrail.forEach((id) => {
      const f = folderById.get(id);
      crumbs.push({ id, label: f ? `${f.code}` : id });
    });
    return crumbs;
  }, [folderById, folderTrail]);

  const isReadOnly = formMode === 'view';

  // FORM PAGE VIEW
  if (formMode !== 'list') {
    return (
      <div className="create-ctd-folder" data-testid="ctd-folder-form">
        {isLoading && <Loader />}
        <RequiredFieldsDialog
          hidden={requiredDialogHidden}
          onDismiss={() => setRequiredDialogHidden(true)}
          fields={requiredFields}
        />
        <MessageDialog
          hidden={messageDialog.hidden}
          onDismiss={hideMessage}
          type={messageDialog.type}
          title={messageDialog.title}
          message={messageDialog.message}
          fields={messageDialog.fields}
        />

        {/* Header with Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-main-title">{getFormTitle()}</h1>
            <p style={{ marginTop: 6, color: '#666', fontSize: 14 }}>
              {formMode === 'add' ? 'Create a new CTD folder or module' :
                formMode === 'edit' ? 'Update the folder information' :
                  'Folder details (read-only)'}
            </p>
          </div>
          <DefaultButton onClick={closeFormPage}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
            Back to List
          </DefaultButton>
        </div>

        {/* Breadcrumb */}
        <div className="breadcrumb-nav" style={{ marginBottom: 20 }}>
          <span className="breadcrumb-item" onClick={closeFormPage} style={{ cursor: 'pointer', color: '#1E88E5' }}>
            CTD Folders
          </span>
          <span className="breadcrumb-separator" style={{ margin: '0 8px', color: '#999' }}>›</span>
          <span className="breadcrumb-current" style={{ color: '#333', fontWeight: 600 }}>
            {formMode === 'add' ? 'Create New' : formMode === 'edit' ? 'Edit' : 'View'}
          </span>
        </div>

        {/* Form Card */}
        <div className="form-section" style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="ms-Grid">
            {/* Section Header */}
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12">
                <div className="form-section-header">Folder Information</div>
              </div>
            </div>

            {/* Row 1: Parent Folder */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field">
                  <label className="form-label">Parent Folder (Optional)</label>
                  <ReactDropdown
                    name="parentFolder"
                    options={getParentFolderOptions()}
                    defaultOption={getParentFolderOptions().find(o => o.value === selectedParent) ?? getParentFolderOptions()[0]}
                    onChange={(opt) => {
                      const nextParentId = opt?.value ?? '';
                      setSelectedParent(nextParentId);
                      if (nextParentId && formMode === 'add') {
                        const parent = folders.find(f => f.id === nextParentId);
                        setNewFolderCode(parent ? parent.code + '.' : '');
                      }
                    }}
                    isCloseMenuOnSelect={true}
                    isSorted={true}
                    isClearable={false}
                    isDisabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Folder Code and Name */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field">
                  <TextField
                    label="Folder Code"
                    required={!isReadOnly}
                    placeholder="e.g., Module 1.2 or 1.2.3"
                    value={newFolderCode}
                    onChange={(_e, v) => setNewFolderCode(v ?? '')}
                    errorMessage={fieldErrors.code}
                    disabled={isReadOnly}
                    data-testid="folder-code-input"
                  />
                  {!isReadOnly && (
                    <small className="form-hint" style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Use standard CTD numbering (e.g., 1.1.1, 2.3, Module 5)</small>
                  )}
                </div>
              </div>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field">
                  <TextField
                    label="Folder Name"
                    required={!isReadOnly}
                    placeholder="e.g., Administrative Information"
                    value={newFolderName}
                    onChange={(_e, v) => setNewFolderName(v ?? '')}
                    errorMessage={fieldErrors.name}
                    disabled={isReadOnly}
                    data-testid="folder-name-input"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Sort Order */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field">
                  <TextField
                    label="Sort Order"
                    type="number"
                    value={newFolderSortOrder}
                    onChange={(_e, v) => setNewFolderSortOrder(v || '')}
                    disabled={isReadOnly}
                    data-testid="folder-sort-order-input"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
              <div className="ms-Grid-col ms-sm12">
                <div className="form-field">
                  <TextField
                    label="Description"
                    multiline
                    rows={4}
                    value={newFolderDescription}
                    onChange={(_e, v) => setNewFolderDescription(v ?? '')}
                    disabled={isReadOnly}
                    placeholder="Enter folder description"
                    data-testid="folder-description-input"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isReadOnly && (
              <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                <div className="ms-Grid-col ms-sm12">
                  <FormActions
                    onSave={handleFormSave}
                    onCancel={closeFormPage}
                    saveText={formMode === 'add' ? 'Create Folder' : 'Update Folder'}
                    cancelText="Cancel"
                    isSaving={isLoading}
                  />
                </div>
              </div>
            )}
            {isReadOnly && (
              <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                <div className="ms-Grid-col ms-sm12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <DefaultButton
                    onClick={closeFormPage}
                    data-testid="back-folder-btn"
                    styles={{
                      root: { background: '#757575', borderColor: '#757575', color: '#fff' },
                      rootHovered: { background: '#616161', borderColor: '#616161', color: '#fff' },
                      rootPressed: { background: '#424242', borderColor: '#424242', color: '#fff' }
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
                    Back
                  </DefaultButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="create-ctd-folder" data-testid="create-ctd-folder-page">
      {isLoading && <Loader />}
      <RequiredFieldsDialog
        hidden={requiredDialogHidden}
        onDismiss={() => setRequiredDialogHidden(true)}
        fields={requiredFields}
      />
      <div className="page-header">
        <h1 className="mainTitle">Create CTD Folder</h1>
      </div>

      <div className="table-card" style={{ padding: 0 }}>
        <div style={{ padding: '10px 12px 10px' }}>
          <div className="breadcrumb-nav" style={{ marginBottom: 0 }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <span
                  className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}
                  onClick={() => {
                    if (crumb.id === 'root') setFolderTrail([]);
                    else {
                      const index = folderTrail.indexOf(crumb.id);
                      if (index >= 0) setFolderTrail(folderTrail.slice(0, index + 1));
                    }
                  }}
                >
                  {crumb.label}
                </span>
                {idx < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <MemoizedDataGridComponent
          items={currentLevelFolders as any[]}
          columns={folderColumns}
          reRenderComponent={true}
          isPagination={true}
          onSelectedItem={(items: any[]) => setSelectedFolder(items[0] || null)}
          onItemInvoked={(item?: any) => {
            if (!item?.id) return;
            setFolderTrail([...folderTrail, item.id]);
          }}
          isAddNew={true}
          addNewContent={
            <div className="dflex pb-1">
              <Link
                className="actionBtn iconSize btnRefresh icon-mr"
                style={{ paddingBottom: "2px" }}
                onClick={() => {
                  setSearchTerm('');
                }}
              >
                <TooltipHost content={"Reset & Refresh Grid"}>
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
              <DefaultButton
                key="import"
                className="btn btn-secondary icon-mr"
                onClick={() => { /* Import logic */ }}
              >
                <FontAwesomeIcon icon={faUpload} style={{ marginRight: 8 }} />
                Import Structure
              </DefaultButton>
              <PrimaryButton
                key="create"
                text={currentParentId ? 'Create Subfolder' : 'Create Root Module'}
                className="btn btn-primary"
                onClick={() => openFormPage('add')}
              />
            </div>
          }
          addEDButton={
            selectedFolder && (
              <div className="dflex">
                <Link
                  className="actionBtn iconSize btnView"
                  onClick={() => openFormPage('view', selectedFolder)}
                >
                  <TooltipHost content="View Detail">
                    <FontAwesomeIcon icon={faEye} />
                  </TooltipHost>
                </Link>
                <Link
                  className="actionBtn iconSize btnGreen ml-10"
                  onClick={() => {
                    setSelectedParent(selectedFolder.id);
                    setNewFolderCode(selectedFolder.code + '.');
                    openFormPage('add');
                  }}
                >
                  <TooltipHost content="Add Subfolder">
                    <FontAwesomeIcon icon={faFolderPlus} />
                  </TooltipHost>
                </Link>
                <Link
                  className="actionBtn iconSize btnEdit ml-10"
                  onClick={() => openFormPage('edit', selectedFolder)}
                >
                  <TooltipHost content="Edit Detail">
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </TooltipHost>
                </Link>
                <Link
                  className="actionBtn iconSize btnDanger ml-10"
                  onClick={() => handleDeleteClick(selectedFolder)}
                >
                  <TooltipHost content="Delete">
                    <FontAwesomeIcon icon={faTrashCan} />
                  </TooltipHost>
                </Link>
              </div>
            )
          }
        />
      </div>

      {/* Delete Confirmation */}
      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Delete CTD Folder"
        isLoading={isLoading}
        message={
          folderToDelete
            ? `Are you sure you want to delete "${folderToDelete.code} - ${folderToDelete.name}"? This will also delete all subfolders. This action cannot be undone.`
            : ''
        }
        closeButtonText="Cancel"
        yesButtonText="Delete"
        onClickOfYes={handleDeleteConfirm}
      />
    </div>
  );
};
