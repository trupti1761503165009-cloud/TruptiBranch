import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import { ManageTmfZonesData, type ITmfZone } from './ManageTmfZonesData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const ManageTmfZones: React.FC = () => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const {
    filteredItems,
    isLoading,
    errorMessage,
    successMessage,
    panelMode,
    isPanelOpen,
    formData,
    fieldErrors,
    isDeleteDialogOpen,
    itemToDelete,
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
    loadItems
  } = ManageTmfZonesData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const formTitle = panelMode === 'add' ? 'Add TMF Zone'
    : panelMode === 'edit' ? 'Edit TMF Zone'
    : 'View TMF Zone';

  const columns: any[] = [
    {
      key: 'name', name: 'ZONE NAME', fieldName: 'name', minWidth: 300, isSortingRequired: true,
      onRender: (item: ITmfZone) => <strong style={{ color: 'var(--primry)' }}>{item.name}</strong>
    },
    { key: 'zoneNumber', name: 'ZONE NUMBER', fieldName: 'zoneNumber', minWidth: 120, isSortingRequired: true },
    { key: 'sortOrder', name: 'SORT ORDER', fieldName: 'sortOrder', minWidth: 120, isSortingRequired: true },
    {
      key: 'actions', name: 'ACTIONS', minWidth: 120,
      onRender: (item: ITmfZone) => (
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
      <div className="pageContainer" data-testid="tmf-zone-form-page">
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
                    { label: 'TMF Zones', onClick: closePanel },
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
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl">
                          <TextField
                            label="Zone Name"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.name}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
                            errorMessage={fieldErrors.name}
                            placeholder="e.g. Zone 1 - Trial Management"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md3">
                        <div className="formControl">
                          <TextField
                            label="Zone Number"
                            type="number"
                            readOnly={isReadOnly}
                            value={String(formData.zoneNumber)}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, zoneNumber: Number(v) || 0 }))}
                            placeholder="e.g. 1"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md3">
                        <div className="formControl">
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
                  </div>

                  {!isReadOnly && (
                    <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
                      <PrimaryButton
                        onClick={handleSave}
                        disabled={isLoading}
                        styles={{ root: { background: 'var(--primry)', border: 'none' } }}
                      >
                        {panelMode === 'add' ? 'Add TMF Zone' : 'Update TMF Zone'}
                      </PrimaryButton>
                      <DefaultButton onClick={closePanel}>Cancel</DefaultButton>
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
    <div className="pageContainer" data-testid="manage-tmf-zones-page">
      {isLoading && <Loader />}

      <h1 className="mainTitle" style={{ marginBottom: 8 }}>TMF Zones Master</h1>

      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'TMF Zones', isActive: true }
        ]} />
      </div>

      <div className="boxCard">
        <MemoizedDataGridComponent
          items={filteredItems}
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
                Add TMF Zone
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
        subject="Delete TMF Zone"
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
