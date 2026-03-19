import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import { ManageCountriesData, type ICountry } from './ManageCountriesData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const ManageCountries: React.FC = () => {
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
  } = ManageCountriesData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const formTitle = panelMode === 'add' ? 'Add Country'
    : panelMode === 'edit' ? 'Edit Country'
    : 'View Country';

  const columns: any[] = [
    {
      key: 'name', name: 'COUNTRY NAME', fieldName: 'name', minWidth: 200, isSortingRequired: true,
      onRender: (item: ICountry) => <strong style={{ color: 'var(--primry)' }}>{item.name}</strong>
    },
    { key: 'countryCode', name: 'COUNTRY CODE', fieldName: 'countryCode', minWidth: 120, isSortingRequired: true },
    { key: 'region', name: 'REGION', fieldName: 'region', minWidth: 150, isSortingRequired: true },
    {
      key: 'isActive', name: 'STATUS', fieldName: 'isActive', minWidth: 100,
      onRender: (item: ICountry) => (
        <span style={{
          background: item.isActive ? '#e8f5e9' : '#fbe9e7',
          color: item.isActive ? '#2e7d32' : '#c62828',
          padding: '3px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions', name: 'ACTIONS', minWidth: 120,
      onRender: (item: ICountry) => (
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
      <div className="pageContainer" data-testid="country-form-page">
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
                    { label: 'Countries', onClick: closePanel },
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
                            label="Country Name"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.name}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
                            errorMessage={fieldErrors.name}
                            placeholder="e.g. United Kingdom"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl">
                          <TextField
                            label="Country Code"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.countryCode}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, countryCode: v || '' }))}
                            errorMessage={fieldErrors.countryCode}
                            placeholder="e.g. GB"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl">
                          <TextField
                            label="Region"
                            readOnly={isReadOnly}
                            value={formData.region}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, region: v || '' }))}
                            placeholder="e.g. Europe"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md6">
                        <div className="formControl" style={{ paddingTop: 4 }}>
                          {!isReadOnly ? (
                            <Toggle
                              label="Is Active"
                              checked={formData.isActive}
                              onChange={(_e, checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                            />
                          ) : (
                            <div>
                              <label style={{ fontWeight: 600, fontSize: 14 }}>Is Active</label>
                              <div style={{ padding: '6px 0', color: '#333' }}>{formData.isActive ? 'Yes' : 'No'}</div>
                            </div>
                          )}
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
                        {panelMode === 'add' ? 'Add Country' : 'Update Country'}
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
    <div className="pageContainer" data-testid="manage-countries-page">
      {isLoading && <Loader />}

      <h1 className="mainTitle" style={{ marginBottom: 8 }}>Country Master</h1>

      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Countries', isActive: true }
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
                Add Country
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
        subject="Delete Country"
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
