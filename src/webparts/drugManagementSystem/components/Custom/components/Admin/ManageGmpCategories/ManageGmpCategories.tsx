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
import { ManageGmpCategoriesData, type IGmpCategory } from './ManageGmpCategoriesData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const ManageGmpCategories: React.FC = () => {
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
  } = ManageGmpCategoriesData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const formTitle = panelMode === 'add' ? 'Add GMP Category'
    : panelMode === 'edit' ? 'Edit GMP Category'
    : 'View GMP Category';

  const columns: any[] = [
    {
      key: 'name', name: 'CATEGORY NAME', fieldName: 'name', minWidth: 300, isSortingRequired: true,
      onRender: (item: IGmpCategory) => <strong style={{ color: 'var(--primry)' }}>{item.name}</strong>
    },
    { key: 'sortOrder', name: 'SORT ORDER', fieldName: 'sortOrder', minWidth: 120, isSortingRequired: true },
    {
      key: 'actions', name: 'ACTIONS', minWidth: 120,
      onRender: (item: IGmpCategory) => (
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
      <div className="pageContainer" data-testid="gmp-category-form-page">
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
                    { label: 'GMP Categories', onClick: closePanel },
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
                      <div className="ms-Grid-col ms-sm12 ms-md8">
                        <div className="formControl">
                          <TextField
                            label="Category Name"
                            required={!isReadOnly}
                            readOnly={isReadOnly}
                            value={formData.name}
                            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
                            errorMessage={fieldErrors.name}
                            placeholder="e.g. Governance and Procedures"
                            styles={{ root: { background: '#fff' }, fieldGroup: { background: '#fff' } }}
                          />
                        </div>
                      </div>
                      <div className="ms-Grid-col ms-sm12 ms-md4">
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
                        {panelMode === 'add' ? 'Add GMP Category' : 'Update GMP Category'}
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
    <div className="pageContainer" data-testid="manage-gmp-categories-page">
      {isLoading && <Loader />}

      <h1 className="mainTitle" style={{ marginBottom: 8 }}>GMP Categories Master</h1>

      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <Breadcrumb items={[
          { label: 'Home', onClick: () => {} },
          { label: 'GMP Categories', isActive: true }
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
                Add GMP Category
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
        subject="Delete GMP Category"
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
