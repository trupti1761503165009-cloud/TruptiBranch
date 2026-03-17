import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Link, TooltipHost } from '@fluentui/react';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faFolderPlus, faPenToSquare, faTrashCan,
  faArrowsRotate, faPlus, faSave, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { CreateCTDFolderData } from './CreateCTDFolderData';
import { Loader } from '../../../../Common/Loader/Loader';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
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
    successMessage,
    errorMessage,
    isLoading,
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

  /* ── Success / Error modals ─────────────────────────── */
  const [successModal, setSuccessModal] = React.useState(false);
  const [errorModal, setErrorModal] = React.useState(false);
  const [modalMsg, setModalMsg] = React.useState('');

  React.useEffect(() => {
    if (successMessage) { setModalMsg(successMessage); setSuccessModal(true); }
  }, [successMessage]);

  React.useEffect(() => {
    if (errorMessage) { setModalMsg(errorMessage); setErrorModal(true); }
  }, [errorMessage]);

  /* ── Form mode ──────────────────────────────────────── */
  const [formMode, setFormMode] = React.useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedFolder, setSelectedFolder] = React.useState<any | null>(null);

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: formMode !== 'list' }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [formMode, setAppGlobalState]);

  /* ── Folder navigation trail ────────────────────────── */
  const [folderTrail, setFolderTrail] = React.useState<string[]>([]);
  const folderById = React.useMemo(() => new Map(folders.map(f => [String(f.id), f])), [folders]);
  const currentParentId = folderTrail.length ? folderTrail[folderTrail.length - 1] : undefined;

  const currentLevelFolders = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return folders
      .filter(f => (currentParentId ? f.parentId === currentParentId : !f.parentId))
      .filter(f => {
        if (!q) return true;
        return (
          (f.code || '').toLowerCase().includes(q) ||
          (f.name || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) ||
        (a.code || '').localeCompare(b.code || '')
      );
  }, [currentParentId, folders, searchTerm]);

  /* ── Open / close form ──────────────────────────────── */
  const openForm = (mode: 'add' | 'edit' | 'view', folder?: any) => {
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

  const closeForm = () => {
    setFormMode('list');
    setSelectedFolder(null);
    setNewFolderCode('');
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderSortOrder('');
  };

  const handleSave = async () => {
    let ok = false;
    if (formMode === 'add') ok = await handleCreateFolder();
    else if (formMode === 'edit' && selectedFolder) ok = await handleEditConfirm();
    if (ok) closeForm();
  };

  const isReadOnly = formMode === 'view';

  /* ── Breadcrumb items for folder trail ──────────────── */
  const breadcrumbItems = React.useMemo(() => {
    const crumbs: Array<{ label: string; onClick: () => void; isActive?: boolean }> = [
      {
        label: 'CTD/eCTD Folders',
        onClick: () => setFolderTrail([]),
        isActive: folderTrail.length === 0
      }
    ];
    folderTrail.forEach((id, idx) => {
      const f = folderById.get(id);
      crumbs[crumbs.length - 1].isActive = false;
      crumbs.push({
        label: f ? `${f.code}` : id,
        onClick: () => setFolderTrail(prev => prev.slice(0, idx + 1)),
        isActive: idx === folderTrail.length - 1
      });
    });
    return crumbs;
  }, [folderById, folderTrail]);

  /* ── Grid columns ────────────────────────────────────── */
  const folderColumns: any[] = React.useMemo(() => [
    {
      key: 'code',
      name: 'CODE',
      fieldName: 'code',
      minWidth: 100,
      maxWidth: 140,
      isSortingRequired: true,
      onRender: (item: any) => (
        <strong style={{ color: 'var(--primry)', fontSize: 13 }}>{item.code}</strong>
      )
    },
    {
      key: 'name',
      name: 'FOLDER NAME',
      fieldName: 'name',
      minWidth: 240,
      isSortingRequired: true,
      onRender: (item: any) => (
        <span
          style={{ cursor: 'pointer', color: '#1565C0', fontWeight: 500 }}
          onClick={() => setFolderTrail(prev => [...prev, String(item.id)])}
        >
          {item.name}
        </span>
      )
    },
    {
      key: 'description',
      name: 'DESCRIPTION',
      fieldName: 'description',
      minWidth: 200,
      onRender: (item: any) => (
        <span style={{ color: '#666', fontSize: 12 }}>{item.description || '—'}</span>
      )
    },
    {
      key: 'sortOrder',
      name: 'SORT ORDER',
      fieldName: 'sortOrder',
      minWidth: 90,
      maxWidth: 110,
      onRender: (item: any) => (
        <span style={{ color: '#888' }}>{item.sortOrder ?? '—'}</span>
      )
    },
    {
      key: 'actions',
      name: 'ACTIONS',
      fieldName: '',
      minWidth: 120,
      maxWidth: 140,
      onRender: (item: any) => (
        <div className="dflex" style={{ gap: 6 }}>
          <Link className="actionBtn iconSize btnView" onClick={() => openForm('view', item)}>
            <TooltipHost content="View">
              <FontAwesomeIcon icon={faEye} />
            </TooltipHost>
          </Link>
          <Link className="actionBtn iconSize btnGreen" onClick={() => {
            setSelectedParent(String(item.id));
            setNewFolderCode((item.code || '') + '.');
            openForm('add');
          }}>
            <TooltipHost content="Add Subfolder">
              <FontAwesomeIcon icon={faFolderPlus} />
            </TooltipHost>
          </Link>
          <Link className="actionBtn iconSize btnEdit" onClick={() => openForm('edit', item)}>
            <TooltipHost content="Edit">
              <FontAwesomeIcon icon={faPenToSquare} />
            </TooltipHost>
          </Link>
          <Link className="actionBtn iconSize btnDanger" onClick={() => handleDeleteClick(item)}>
            <TooltipHost content="Delete">
              <FontAwesomeIcon icon={faTrashCan} />
            </TooltipHost>
          </Link>
        </div>
      )
    }
  ], [folderTrail, folderById]);

  /* ══════════════════════════════════════════════════════
     FORM PAGE VIEW (Add / Edit / View)
  ══════════════════════════════════════════════════════ */
  if (formMode !== 'list') {
    const formTitle =
      formMode === 'add'
        ? currentParentId ? 'Create Subfolder' : 'Create Root Module'
        : formMode === 'edit'
          ? `Edit Folder — ${selectedFolder?.code || ''}`
          : `View Folder — ${selectedFolder?.code || ''}`;

    const formBreadcrumb = [
      { label: 'CTD/eCTD Folders', onClick: closeForm },
      { label: formTitle, isActive: true }
    ];

    return (
      <div className="manage-templates-wrapper" data-testid="ctd-folder-form">
        {isLoading && <Loader />}

        {/* Breadcrumb */}
        <div className="customebreadcrumb" style={{ marginBottom: 12 }}>
          <Breadcrumb items={formBreadcrumb} />
        </div>

        {/* Page Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 className="mainTitle" style={{ margin: 0 }}>{formTitle}</h1>
            <p style={{ margin: '4px 0 0', color: '#757575', fontSize: 13 }}>
              {formMode === 'add'
                ? 'Fill in the details to create a new CTD folder or module.'
                : formMode === 'edit'
                  ? 'Update the folder information below.'
                  : 'Folder details (read-only).'}
            </p>
          </div>
          <DefaultButton onClick={closeForm} style={{ marginTop: 4 }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
            Back to List
          </DefaultButton>
        </div>

        {/* ── SECTION: Folder Information ─────────────────── */}
        <div className="white-card-section" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primry)', marginBottom: 20 }}>
            Folder Information
          </div>

          <div className="ms-Grid">
            {/* Parent Folder */}
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                    Parent Folder <span style={{ color: '#999', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <ReactDropdown
                    name="parentFolder"
                    options={parentOptions}
                    defaultOption={parentOptions.find(o => o.value === selectedParent) ?? null}
                    onChange={(opt) => {
                      const nextParentId = opt?.value ?? '';
                      setSelectedParent(nextParentId);
                      if (nextParentId && formMode === 'add') {
                        const parent = folders.find(f => String(f.id) === nextParentId || f.folderId === nextParentId);
                        setNewFolderCode(parent ? (parent.code || '') + '.' : '');
                      }
                    }}
                    isCloseMenuOnSelect={true}
                    isSorted={false}
                    isClearable={true}
                    isDisabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Code + Name */}
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <TextField
                    label="Folder Code"
                    required={!isReadOnly}
                    placeholder="e.g. 1.1, 2.3.1"
                    value={newFolderCode}
                    onChange={(_e, v) => setNewFolderCode(v ?? '')}
                    errorMessage={fieldErrors.code}
                    disabled={isReadOnly}
                    description="Use standard CTD numbering (e.g. 1.1.1, 2.3, Module 5)"
                  />
                </div>
              </div>
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <TextField
                    label="Folder Name"
                    required={!isReadOnly}
                    placeholder="e.g. Administrative Information"
                    value={newFolderName}
                    onChange={(_e, v) => setNewFolderName(v ?? '')}
                    errorMessage={fieldErrors.name}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Sort Order */}
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <TextField
                    label="Sort Order"
                    type="number"
                    placeholder="e.g. 1"
                    value={newFolderSortOrder}
                    onChange={(_e, v) => setNewFolderSortOrder(v || '')}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <TextField
                    label="Description"
                    multiline
                    rows={4}
                    placeholder="Enter folder description..."
                    value={newFolderDescription}
                    onChange={(_e, v) => setNewFolderDescription(v ?? '')}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ───────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'flex-end',
          paddingTop: 16, borderTop: '1px solid #E0E0E0'
        }}>
          <DefaultButton onClick={closeForm} disabled={isLoading} text="Cancel" />
          {!isReadOnly && (
            <PrimaryButton
              onClick={handleSave}
              disabled={isLoading}
              styles={{ root: { minWidth: 140, background: 'var(--primry)', border: 'none' } }}
            >
              <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
              {isLoading ? 'Saving...' : formMode === 'add' ? 'Create Folder' : 'Update Folder'}
            </PrimaryButton>
          )}
        </div>

        {/* Success Modal */}
        <CustomModal
          isModalOpenProps={successModal}
          setModalpopUpFalse={setSuccessModal}
          subject="Success"
          message={modalMsg}
          closeButtonText="Close"
          onClose={() => setSuccessModal(false)}
        />

        {/* Error Modal */}
        <CustomModal
          isModalOpenProps={errorModal}
          setModalpopUpFalse={setErrorModal}
          subject="Error"
          message={modalMsg}
          closeButtonText="Close"
          onClose={() => setErrorModal(false)}
        />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     LIST VIEW
  ══════════════════════════════════════════════════════ */
  return (
    <div className="manage-templates-wrapper" data-testid="create-ctd-folder-page">
      {isLoading && <Loader />}

      {/* Page Title */}
      <h1 className="mainTitle" style={{ marginBottom: 8 }}>CTD / eCTD Folders</h1>

      {/* Breadcrumb Trail (folder drilldown) */}
      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Grid */}
      <div className="white-card-section" style={{ padding: 0 }}>
        <MemoizedDataGridComponent
          items={currentLevelFolders as any[]}
          columns={folderColumns}
          reRenderComponent={true}
          isPagination={true}
          searchable={true}
          CustomselectionMode={0}
          onSelectedItem={(items: any[]) => setSelectedFolder(items[0] || null)}
          onItemInvoked={(item?: any) => {
            if (!item?.id) return;
            setFolderTrail(prev => [...prev, String(item.id)]);
          }}
          isAddNew={true}
          addNewContent={
            <div className="dflex" style={{ gap: 8 }}>
              <Link
                className="actionBtn iconSize btnRefresh"
                onClick={() => { setSearchTerm(''); setFolderTrail([]); }}
              >
                <TooltipHost content="Reset & Refresh">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
              <PrimaryButton
                className="btn btn-primary"
                onClick={() => openForm('add')}
                styles={{ root: { background: 'var(--primry)', border: 'none' } }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
                {currentParentId ? 'Add Subfolder' : 'Add Root Module'}
              </PrimaryButton>
            </div>
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Delete CTD Folder"
        isLoading={isLoading}
        message={
          folderToDelete
            ? <span>Are you sure you want to delete <strong>"{folderToDelete.code} — {folderToDelete.name}"</strong>?<br />This will also remove all subfolders. This action cannot be undone.</span>
            : ''
        }
        closeButtonText="Cancel"
        yesButtonText="Delete"
        onClickOfYes={handleDeleteConfirm}
        onClose={() => setIsDeleteDialogOpen(false)}
      />

      {/* Success Modal */}
      <CustomModal
        isModalOpenProps={successModal}
        setModalpopUpFalse={setSuccessModal}
        subject="Success"
        message={modalMsg}
        closeButtonText="Close"
        onClose={() => setSuccessModal(false)}
      />

      {/* Error Modal */}
      <CustomModal
        isModalOpenProps={errorModal}
        setModalpopUpFalse={setErrorModal}
        subject="Error"
        message={modalMsg}
        closeButtonText="Close"
        onClose={() => setErrorModal(false)}
      />
    </div>
  );
};
