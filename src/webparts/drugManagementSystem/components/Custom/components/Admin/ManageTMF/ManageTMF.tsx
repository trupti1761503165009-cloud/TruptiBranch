import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye, faFolder, faFolderOpen, faFileLines, faArrowLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { ManageTMFData, TMF_ZONE_CHOICES, fetchTmfZonesFromList, type ITMFFolder, type ITmfZoneOption } from './ManageTMFData';
import { useSetAtom, useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const ManageTMF: React.FC = () => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const { provider } = useAtomValue(appGlobalStateAtom);
  const [zoneChoices, setZoneChoices] = React.useState<ITmfZoneOption[]>(TMF_ZONE_CHOICES);

  React.useEffect(() => {
    void fetchTmfZonesFromList(provider).then(zones => {
      setZoneChoices(zones);
    });
  }, [provider]);

  const ZONE_OPTIONS = zoneChoices.map(z => ({ value: z.value, label: z.label }));
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

  const formTitle = panelMode === 'add' ? 'Add TMF Folder'
    : panelMode === 'edit' ? 'Edit TMF Folder'
    : 'View TMF Folder';

  const levelLabel = folderTrail.length === 0 ? 'Zones (Root Level)'
    : folderTrail.length === 1 ? 'Sections'
    : 'Artifacts';

  const addButtonLabel = folderTrail.length === 0 ? 'Add Zone'
    : folderTrail.length === 1 ? 'Add Section'
    : 'Add Artifact';

  if (isPanelOpen) {
    return (
      <div className="pageContainer" data-testid="tmf-form-page">
        {isLoading && <Loader />}

        <div className="boxCard">
          <div className="ms-Grid">
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12 dFlex justifyContentBetween alignItemsCenter">
                <h1 className="mainTitle">{formTitle}</h1>
                <DefaultButton onClick={closePanel} styles={{ root: { borderColor: '#d13438', color: '#d13438' } }}>
                  Close
                </DefaultButton>
              </div>
            </div>

            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-sm12">
                <div className="customebreadcrumb">
                  <Breadcrumb items={[
                    { label: 'Home', onClick: () => {} },
                    { label: 'TMF Folder Structure', onClick: closePanel },
                    { label: formTitle, isActive: true }
                  ]} />
                </div>
              </div>
            </div>

            <div className="ms-Grid-row" style={{ marginTop: 20 }}>
              <div className="ms-Grid-col ms-sm12">
                <div className="boxCard" style={{ background: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  <div className="ms-Grid">
                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>
                            Zone {!isReadOnly && <span style={{ color: 'red' }}>*</span>}
                          </label>
                          {isReadOnly ? (
                            <div style={{ padding: '8px 0', color: '#333', fontSize: 14 }}>{formData.zoneName || '-'}</div>
                          ) : (
                            <ReactDropdown
                              name="zoneName"
                              options={ZONE_OPTIONS}
                              defaultOption={formData.zoneName ? { value: formData.zoneName, label: formData.zoneName } : undefined}
                              onChange={(opt: any) => {
                                const choice = zoneChoices.find(z => z.value === opt?.value);
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
                      </div>

                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Title / Name"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.name}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
                            errorMessage={fieldErrors.name}
                            placeholder="e.g. Trial Master File"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Folder ID"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.folderId}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, folderId: v || '' }))}
                            placeholder="e.g. Z1, Z1.S1.01, 01.01.01"
                            errorMessage={fieldErrors.folderId}
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>

                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Parent Folder ID"
                            readOnly={isReadOnly}
                            value={formData.parentFolderId || ''}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, parentFolderId: v || '' }))}
                            placeholder="Leave empty for root zones"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Section Code"
                            readOnly={isReadOnly}
                            value={formData.section}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, section: v || '' }))}
                            placeholder="e.g. 1.01"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Section Name"
                            readOnly={isReadOnly}
                            value={formData.sectionName}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, sectionName: v || '' }))}
                            placeholder="e.g. Trial Oversight"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Artifact ID"
                            readOnly={isReadOnly}
                            value={formData.artifactId}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, artifactId: v || '' }))}
                            placeholder="e.g. 01.01.01"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Artifact Name"
                            readOnly={isReadOnly}
                            value={formData.artifactName}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, artifactName: v || '' }))}
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Reference"
                            readOnly={isReadOnly}
                            value={formData.reference}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, reference: v || '' }))}
                            placeholder="e.g. TMF RM 3.3.1"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          <TextField
                            label="Sort Order"
                            type="number"
                            readOnly={isReadOnly}
                            value={String(formData.sortOrder)}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, sortOrder: Number(v) || 0 }))}
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ marginBottom: 16 }}>
                          {!isReadOnly ? (
                            <Toggle
                              label="Is Folder / Section (not artifact)"
                              checked={formData.isFolder}
                              onChange={(_e, checked) => setFormData(prev => ({ ...prev, isFolder: !!checked }))}
                            />
                          ) : (
                            <div>
                              <label style={{ fontWeight: 600, fontSize: 14 }}>Type</label>
                              <div style={{ padding: '6px 0', color: '#333' }}>{formData.isFolder ? 'Folder / Section' : 'Artifact'}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E0E0E0', marginTop: 8 }}>
                      <PrimaryButton
                        onClick={handleSave}
                        disabled={isLoading}
                        styles={{ root: { background: 'var(--primry)', border: 'none' } }}
                      >
                        {panelMode === 'add' ? 'Add TMF Folder' : 'Update TMF Folder'}
                      </PrimaryButton>
                      <DefaultButton onClick={closePanel}>Cancel</DefaultButton>
                    </div>
                  )}
                  {isReadOnly && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E0E0E0', marginTop: 8 }}>
                      <DefaultButton onClick={closePanel}>Close</DefaultButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <CustomModal
          isModalOpenProps={!!successMessage}
          setModalpopUpFalse={() => setSuccessMessage('')}
          subject="Success"
          message={successMessage}
          closeButtonText="Close"
          onClose={() => setSuccessMessage('')}
        />
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
  }

  return (
    <div className="pageContainer" data-testid="manage-tmf-page">
      {isLoading && <Loader />}

      <h1 className="mainTitle" style={{ marginBottom: 8 }}>TMF Folder Structure</h1>

      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'TMF Folder Structure', isActive: true }
        ]} />
      </div>

      {/* Folder drill-down trail */}
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

      {/* Search + level label */}
      <div style={{ fontWeight: 600, color: '#555', marginBottom: 8, fontSize: 13 }}>{levelLabel}</div>

      <div className="boxCard" style={{ padding: 0 }}>
        {/* Toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <TextField
            placeholder="Search by name, folder ID, zone..."
            value={searchTerm}
            onChange={(_e, v) => setSearchTerm(v || '')}
            styles={{ root: { width: 300 } }}
          />
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
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
              {addButtonLabel}
            </PrimaryButton>
          </div>
        </div>

        {/* Items */}
        {currentLevelItems.length === 0 && !isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>
            No items found.{' '}
            <Link onClick={() => openAddPanel(currentParentId || undefined)} style={{ color: 'var(--primry)' }}>
              {addButtonLabel}
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
                <Link className="actionBtn iconSize btnView" onClick={() => openViewPanel(item)}>
                  <FontAwesomeIcon icon={faEye} />
                </Link>
              </TooltipHost>
              <TooltipHost content="Edit">
                <Link className="actionBtn iconSize btnEdit" onClick={() => openEditPanel(item)}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </Link>
              </TooltipHost>
              <TooltipHost content="Delete">
                <Link className="actionBtn iconSize btnDanger" onClick={() => openDeleteDialog(item)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </Link>
              </TooltipHost>
            </div>
          </div>
        ))}
      </div>

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
      <CustomModal
        isModalOpenProps={!!successMessage}
        setModalpopUpFalse={() => setSuccessMessage('')}
        subject="Success"
        message={successMessage}
        closeButtonText="Close"
        onClose={() => setSuccessMessage('')}
      />
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
