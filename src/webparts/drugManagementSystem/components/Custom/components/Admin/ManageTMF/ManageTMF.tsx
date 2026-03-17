import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye, faFolder, faFolderOpen, faFileLines, faArrowLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { ManageTMFData, TMF_ZONE_CHOICES, type ITMFFolder } from './ManageTMFData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

const ZONE_OPTIONS = TMF_ZONE_CHOICES.map(z => ({ value: z.value, label: z.label }));

export const ManageTMF: React.FC = () => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const {
    currentLevelItems,
    isLoading,
    errorMessage,
    successMessage,
    searchTerm,
    panelMode,
    isPanelOpen,
    formData,
    fieldErrors,
    isDeleteDialogOpen,
    itemToDelete,
    folderTrail,
    getBreadcrumb,
    currentParentId,
    setSearchTerm,
    setFormData,
    setIsDeleteDialogOpen,
    setErrorMessage,
    setSuccessMessage,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    openDeleteDialog,
    handleDeleteConfirm,
    loadItems,
    drillInto,
    navigateTo,
    navigateToRoot,
    hasChildren
  } = ManageTMFData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const panelTitle = panelMode === 'add' ? 'Add TMF Folder'
    : panelMode === 'edit' ? 'Edit TMF Folder'
    : 'View TMF Folder';

  const levelLabel = folderTrail.length === 0 ? 'Zones (Root Level)'
    : folderTrail.length === 1 ? 'Sections'
    : 'Artifacts';

  const addButtonLabel = folderTrail.length === 0 ? 'Add Zone'
    : folderTrail.length === 1 ? 'Add Section'
    : 'Add Artifact';

  return (
    <div className="manage-tmf-page">
      {isLoading && <Loader />}

      <Breadcrumb items={[
        { label: 'Home', onClick: () => {} },
        { label: 'TMF Folder Structure', isActive: true }
      ]} />

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="mainTitle" style={{ margin: 0 }}>TMF Folder Structure</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="actionBtn iconSize btnRefresh" onClick={loadItems}>
            <TooltipHost content="Refresh">
              <FontAwesomeIcon icon={faArrowsRotate} />
            </TooltipHost>
          </Link>
          <PrimaryButton
            onClick={() => openAddPanel(currentParentId || undefined)}
            styles={{ root: { background: 'var(--primry)', border: 'none' } }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
            {addButtonLabel}
          </PrimaryButton>
        </div>
      </div>

      {/* Drill-down breadcrumb trail */}
      {folderTrail.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          <Link onClick={navigateToRoot} style={{ color: 'var(--primry)', fontWeight: 600 }}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 4 }} />
            Root
          </Link>
          {getBreadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <FontAwesomeIcon icon={faChevronRight} style={{ color: '#999', fontSize: 10 }} />
              {idx < getBreadcrumb.length - 1 ? (
                <Link onClick={() => navigateTo(idx)} style={{ color: 'var(--primry)' }}>{crumb.label}</Link>
              ) : (
                <strong style={{ color: '#333' }}>{crumb.label}</strong>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <TextField
          placeholder="Search by name, folder ID, zone..."
          value={searchTerm}
          onChange={(_e, v) => setSearchTerm(v || '')}
          styles={{ root: { maxWidth: 400 } }}
        />
      </div>

      {/* Level label */}
      <div style={{ fontWeight: 600, color: '#555', marginBottom: 8, fontSize: 13 }}>
        {levelLabel}
      </div>

      {/* Folder/Item rows */}
      <div className="boxCard" style={{ padding: '8px 0' }}>
        {currentLevelItems.length === 0 && !isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
            No items found.{' '}
            <Link onClick={() => openAddPanel(currentParentId || undefined)} style={{ color: 'var(--primry)' }}>
              Add {addButtonLabel.split(' ')[1]}
            </Link>
          </div>
        )}
        {currentLevelItems.map((item: ITMFFolder) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid #f0f0f0',
              cursor: item.isFolder && hasChildren(item.folderId) ? 'pointer' : 'default'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}
              onClick={() => item.isFolder && hasChildren(item.folderId) ? drillInto(item.folderId) : undefined}
            >
              <span style={{ color: item.isFolder ? 'var(--primry)' : '#888', fontSize: 18 }}>
                <FontAwesomeIcon icon={item.isFolder ? (hasChildren(item.folderId) ? faFolderOpen : faFolder) : faFileLines} />
              </span>
              <div>
                <div style={{ fontWeight: 600, color: '#222' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <span>ID: {item.folderId}</span>
                  {item.zoneName && <span style={{ marginLeft: 12 }}>Zone: {item.zoneName}</span>}
                  {item.sectionName && <span style={{ marginLeft: 12 }}>Section: {item.sectionName}</span>}
                  {item.artifactId && <span style={{ marginLeft: 12 }}>Artifact: {item.artifactId}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {item.isFolder && (
                <TooltipHost content="Open">
                  <Link className="actionBtn iconSize" onClick={() => drillInto(item.folderId)}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </Link>
                </TooltipHost>
              )}
              <TooltipHost content="View">
                <Link className="actionBtn iconSize" onClick={() => openViewPanel(item)}>
                  <FontAwesomeIcon icon={faEye} />
                </Link>
              </TooltipHost>
              <TooltipHost content="Edit">
                <Link className="actionBtn iconSize" onClick={() => openEditPanel(item)}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </Link>
              </TooltipHost>
              <TooltipHost content="Delete">
                <Link className="actionBtn iconSize" style={{ color: '#d13438' }} onClick={() => openDeleteDialog(item)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </Link>
              </TooltipHost>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit / View Panel */}
      <Panel
        isOpen={isPanelOpen}
        onDismiss={closePanel}
        type={PanelType.medium}
        headerText={panelTitle}
        isFooterAtBottom={true}
        onRenderFooterContent={() => (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {!isReadOnly && (
              <PrimaryButton
                onClick={handleSave}
                disabled={isLoading}
                styles={{ root: { background: 'var(--primry)', border: 'none' } }}
              >
                {panelMode === 'add' ? 'Add' : 'Update'}
              </PrimaryButton>
            )}
            <DefaultButton onClick={closePanel}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </DefaultButton>
          </div>
        )}
      >
        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Zone Name — CHOICE dropdown */}
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>
              Zone <span style={{ color: 'red' }}>*</span>
            </label>
            {isReadOnly ? (
              <div style={{ padding: '6px 0', color: '#333' }}>{formData.zoneName || '-'}</div>
            ) : (
              <ReactDropdown
                name="zoneName"
                options={ZONE_OPTIONS}
                defaultOption={formData.zoneName ? { value: formData.zoneName, label: formData.zoneName } : undefined}
                onChange={(opt: any) => {
                  const choice = TMF_ZONE_CHOICES.find(z => z.value === opt?.value);
                  setFormData(prev => ({ ...prev, zoneName: opt?.value || '', zone: choice?.zone || 0 }));
                }}
                isCloseMenuOnSelect
                isSorted={false}
                isClearable={false}
                placeholder="Select Zone"
              />
            )}
            {fieldErrors.zoneName && <div style={{ color: '#d13438', fontSize: 12, marginTop: 4 }}>{fieldErrors.zoneName}</div>}
          </div>

          <TextField
            label="Title / Name"
            required={!isReadOnly}
            readOnly={isReadOnly}
            value={formData.name}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
            errorMessage={fieldErrors.name}
          />

          <TextField
            label="Folder ID"
            required={!isReadOnly}
            readOnly={isReadOnly}
            value={formData.folderId}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, folderId: v || '' }))}
            placeholder="e.g. Z1, Z1.S1.01, 01.01.01"
            errorMessage={fieldErrors.folderId}
          />

          <TextField
            label="Parent Folder ID"
            readOnly={isReadOnly}
            value={formData.parentFolderId || ''}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, parentFolderId: v || '' }))}
            placeholder="Leave empty for root zones"
          />

          {!isReadOnly && (
            <Toggle
              label="Is Folder / Section (not artifact)"
              checked={formData.isFolder}
              onChange={(_e, checked) => setFormData(prev => ({ ...prev, isFolder: !!checked }))}
            />
          )}
          {isReadOnly && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 14 }}>Type</label>
              <div style={{ padding: '6px 0', color: '#333' }}>{formData.isFolder ? 'Folder / Section' : 'Artifact'}</div>
            </div>
          )}

          <TextField
            label="Section Code"
            readOnly={isReadOnly}
            value={formData.section}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, section: v || '' }))}
            placeholder="e.g. 1.01"
          />

          <TextField
            label="Section Name"
            readOnly={isReadOnly}
            value={formData.sectionName}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, sectionName: v || '' }))}
            placeholder="e.g. Trial Oversight"
          />

          <TextField
            label="Artifact ID"
            readOnly={isReadOnly}
            value={formData.artifactId}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, artifactId: v || '' }))}
            placeholder="e.g. 01.01.01"
          />

          <TextField
            label="Artifact Name"
            readOnly={isReadOnly}
            value={formData.artifactName}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, artifactName: v || '' }))}
          />

          <TextField
            label="Reference"
            readOnly={isReadOnly}
            value={formData.reference}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, reference: v || '' }))}
            placeholder="e.g. TMF RM 3.3.1"
          />

          <TextField
            label="Sort Order"
            type="number"
            readOnly={isReadOnly}
            value={String(formData.sortOrder)}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, sortOrder: Number(v) || 0 }))}
          />
        </div>
      </Panel>

      {/* Delete Confirmation */}
      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Delete TMF Folder"
        isLoading={isLoading}
        message={
          itemToDelete
            ? <span>Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>? This action cannot be undone.</span>
            : ''
        }
        closeButtonText="Cancel"
        yesButtonText="Delete"
        onClickOfYes={handleDeleteConfirm}
        onClose={() => setIsDeleteDialogOpen(false)}
      />

      {/* Success Modal */}
      <CustomModal
        isModalOpenProps={!!successMessage}
        setModalpopUpFalse={() => setSuccessMessage('')}
        subject="Success"
        message={successMessage}
        closeButtonText="Close"
        onClose={() => setSuccessMessage('')}
      />

      {/* Error Modal */}
      <CustomModal
        isModalOpenProps={!!errorMessage}
        setModalpopUpFalse={() => setErrorMessage('')}
        subject="Error"
        message={errorMessage}
        closeButtonText="Close"
        onClose={() => setErrorMessage('')}
      />
    </div>
  );
};
