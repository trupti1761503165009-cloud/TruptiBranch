import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Label } from '@fluentui/react/lib/Label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye, faFileAlt, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import { StatusBadge } from '../../../../Common';
import { ManageTemplateUploadData, type ITemplateUploadItem } from './ManageTemplateUploadData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import DragandDropFilePicker from '../../../../Common/dragandDrop/DragandDropFilePicker';
import { FileIconHelper } from '../../../utils/fileIconHelper';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
];

export const ManageTemplateUpload: React.FC = () => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const {
    items,
    isLoading,
    errorMessage,
    successMessage,
    panelMode,
    isPanelOpen,
    editingItem,
    formData,
    fieldErrors,
    selectedFiles,
    existingFileDeleted,
    isDeleteDialogOpen,
    itemToDelete,
    setFormData,
    setIsDeleteDialogOpen,
    setErrorMessage,
    setSuccessMessage,
    setExistingFileDeleted,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    handleFileSelection,
    openDeleteDialog,
    handleDeleteConfirm,
    loadItems
  } = ManageTemplateUploadData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const formTitle = panelMode === 'add' ? 'Upload Template'
    : panelMode === 'edit' ? 'Edit Template'
    : 'View Template';

  const columns: any[] = [
    {
      key: 'name', name: 'TEMPLATE NAME', fieldName: 'name', minWidth: 250, maxWidth: 400, isSortingRequired: true,
      onRender: (item: ITemplateUploadItem) => {
        const iconInfo = FileIconHelper.getFileIcon(item.name);
        return (
          <TooltipHost content={item.name}>
            <div className="dflex" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{
                fontSize: 16, width: 30, height: 30, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: iconInfo.bgColor, borderRadius: 4, color: iconInfo.color, flexShrink: 0
              }}>
                <FontAwesomeIcon icon={iconInfo.icon} />
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>
          </TooltipHost>
        );
      }
    },
    { key: 'version', name: 'VERSION', fieldName: 'version', minWidth: 80, maxWidth: 100, isSortingRequired: true },
    {
      key: 'status', name: 'STATUS', fieldName: 'status', minWidth: 90, maxWidth: 110, isSortingRequired: true,
      onRender: (item: ITemplateUploadItem) => <StatusBadge status={(item.status || 'Active').toLowerCase()} size="small" />
    },
    { key: 'uploadDate', name: 'UPLOAD DATE', fieldName: 'uploadDate', minWidth: 110, maxWidth: 140, isSortingRequired: true },
    {
      key: 'actions', name: 'ACTIONS', minWidth: 120,
      onRender: (item: ITemplateUploadItem) => (
        <div style={{ display: 'flex', gap: 8 }}>
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
      )
    }
  ];

  if (isPanelOpen) {
    return (
      <div className="pageContainer" data-testid="template-upload-form-page">
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
                    { label: 'Template Upload', onClick: closePanel },
                    { label: formTitle, isActive: true }
                  ]} />
                </div>
              </div>
            </div>

            <div className="ms-Grid-row" style={{ marginTop: 20 }}>
              <div className="ms-Grid-col ms-sm12">
                <div className="boxCard" style={{ background: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="ms-Grid">
                    <div className="ms-Grid-row">
                      <div className="ms-Grid-col ms-sm12 ms-md4">
                        <div className="formControl">
                          <TextField
                            label="Template Name"
                            required={!isReadOnly && panelMode === 'add'}
                            readOnly={isReadOnly || panelMode === 'edit'}
                            value={formData.name}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
                            errorMessage={fieldErrors.name}
                            placeholder="e.g., Clinical Trial Protocol v3.0"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4">
                        <div className="formControl">
                          <TextField
                            label="Version"
                            readOnly={isReadOnly}
                            value={formData.version}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, version: v || '' }))}
                            placeholder="e.g., 1.0"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4">
                        <div className="formControl">
                          <Label className="formLabel">Status</Label>
                          {isReadOnly ? (
                            <StatusBadge status={(formData.status || 'Active').toLowerCase()} size="small" />
                          ) : (
                            <ReactDropdown
                              name="templateStatus"
                              options={STATUS_OPTIONS}
                              defaultOption={STATUS_OPTIONS.find(o => o.value === formData.status) ?? STATUS_OPTIONS[0]}
                              onChange={(opt: any) => setFormData(prev => ({ ...prev, status: (opt?.value as 'Active' | 'Inactive') ?? 'Active' }))}
                              isCloseMenuOnSelect={true}
                              isSorted={false}
                              isClearable={false}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {!isReadOnly && panelMode === 'add' && (
                      <div className="ms-Grid-row" style={{ marginTop: 20 }}>
                        <div className="ms-Grid-col ms-sm12 ms-md6">
                          <Label className="formLabel">Upload File<span className="required">*</span></Label>
                          <DragandDropFilePicker setFilesToState={handleFileSelection} isMultiple={false} />
                          {selectedFiles.length > 0 && (
                            <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
                              <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: 6, color: '#1300a6' }} />
                              <strong>{selectedFiles[0].name}</strong> ({(selectedFiles[0].size / 1024).toFixed(2)} KB)
                            </div>
                          )}
                          {fieldErrors.file && (
                            <div style={{ color: '#d13438', fontSize: 12, marginTop: 4 }}>{fieldErrors.file}</div>
                          )}
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                            Accepted: DOC, DOCX, PDF, XLS, XLSX
                          </p>
                        </div>
                      </div>
                    )}

                    {!isReadOnly && panelMode === 'edit' && (
                      <div className="ms-Grid-row" style={{ marginTop: 20 }}>
                        <div className="ms-Grid-col ms-sm12 ms-md6">
                          <Label className="formLabel">Template File</Label>
                          {!existingFileDeleted && editingItem?.fileRef ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 14px', background: '#f4f6fb',
                              borderRadius: 6, border: '1px solid #d0d7e5'
                            }}>
                              <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: 20, color: '#1300a6' }} />
                              <span style={{ flex: 1, fontSize: 13, color: '#222', wordBreak: 'break-all' }}>
                                {editingItem.fileName || editingItem.name}
                              </span>
                              <DefaultButton
                                title="Remove existing file and upload a new one"
                                className="btn btn-danger"
                                style={{ minWidth: 'unset', padding: '0 10px', height: 30 }}
                                onClick={() => setExistingFileDeleted(true)}
                              >
                                <FontAwesomeIcon icon={faTrashCan} style={{ marginRight: 4 }} />
                                Replace
                              </DefaultButton>
                            </div>
                          ) : (
                            <div>
                              {existingFileDeleted && (
                                <div style={{ marginBottom: 6, fontSize: 12, color: '#c0392b' }}>
                                  Existing file will be replaced. Upload a new file below.
                                </div>
                              )}
                              <DragandDropFilePicker setFilesToState={handleFileSelection} isMultiple={false} />
                              {selectedFiles.length > 0 && (
                                <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
                                  <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: 6, color: '#1300a6' }} />
                                  <strong>{selectedFiles[0].name}</strong> ({(selectedFiles[0].size / 1024).toFixed(2)} KB)
                                </div>
                              )}
                              {fieldErrors.file && (
                                <div style={{ color: '#d13438', fontSize: 12, marginTop: 4 }}>{fieldErrors.file}</div>
                              )}
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                                Accepted: DOC, DOCX, PDF, XLS, XLSX
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isReadOnly && editingItem && (
                      <div className="ms-Grid-row" style={{ marginTop: 20 }}>
                        <div className="ms-Grid-col ms-sm12 ms-md6">
                          <Label className="formLabel">Template File</Label>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', background: '#f4f6fb',
                            borderRadius: 6, border: '1px solid #d0d7e5'
                          }}>
                            <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: 20, color: '#1300a6' }} />
                            <span style={{ flex: 1, fontSize: 13, color: '#222', wordBreak: 'break-all' }}>
                              {editingItem.fileName || editingItem.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isReadOnly && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
                      <PrimaryButton
                        onClick={handleSave}
                        disabled={isLoading}
                        styles={{ root: { background: 'var(--primry)', border: 'none' } }}
                      >
                        <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
                        {panelMode === 'add' ? 'Upload Template' : 'Update Template'}
                      </PrimaryButton>
                      <DefaultButton onClick={closePanel}>
                        <FontAwesomeIcon icon={faTimes} style={{ marginRight: 8 }} />
                        Cancel
                      </DefaultButton>
                    </div>
                  )}
                  {isReadOnly && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
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
    <div className="pageContainer" data-testid="manage-template-upload-page">
      {isLoading && <Loader />}

      <h1 className="mainTitle" style={{ marginBottom: 8 }}>Template Upload Master</h1>

      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Template Upload', isActive: true }
        ]} />
      </div>

      <div className="boxCard">
        <MemoizedDataGridComponent
          items={items}
          columns={columns}
          reRenderComponent={true}
          searchable={true}
          isPagination={true}
          CustomselectionMode={0}
          onSelectedItem={() => {}}
          isAddNew={true}
          addNewContent={
            <div className="dflex pb-1">
              <PrimaryButton
                className="btn btn-primary"
                onClick={openAddPanel}
                styles={{ root: { background: 'var(--primry)', border: 'none' } }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
                Upload Template
              </PrimaryButton>
              <Link className="actionBtn iconSize btnRefresh ml-10" onClick={loadItems}>
                <TooltipHost content="Refresh">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
            </div>
          }
          addEDButton={undefined}
        />
      </div>

      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Delete Template"
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
