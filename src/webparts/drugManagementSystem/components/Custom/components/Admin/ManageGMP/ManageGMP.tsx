import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrashCan, faArrowsRotate, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link, TooltipHost } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { CustomModal } from '../../../../Common/CustomModal';
import { Loader } from '../../../../Common/Loader/Loader';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { ManageGMPData, GMP_CATEGORIES, type IGMPModel } from './ManageGMPData';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

const CATEGORY_OPTIONS = GMP_CATEGORIES.map(c => ({ value: c, label: c }));

export const ManageGMP: React.FC = () => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const {
    filteredItems,
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
    loadItems
  } = ManageGMPData();

  React.useEffect(() => {
    setAppGlobalState(prev => ({ ...prev, isSidebarHidden: isPanelOpen }));
    return () => setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
  }, [isPanelOpen, setAppGlobalState]);

  const isReadOnly = panelMode === 'view';

  const columns: any[] = [
    {
      key: 'name', name: 'MODEL NAME', fieldName: 'name', minWidth: 200, isSortingRequired: true,
      onRender: (item: IGMPModel) => <strong style={{ color: 'var(--primry)' }}>{item.name}</strong>
    },
    { key: 'category', name: 'CATEGORY', fieldName: 'category', minWidth: 200, isSortingRequired: true },
    { key: 'subGroup', name: 'SUB GROUP', fieldName: 'subGroup', minWidth: 180, isSortingRequired: true },
    { key: 'sortOrder', name: 'SORT ORDER', fieldName: 'sortOrder', minWidth: 100 },
    {
      key: 'actions', name: 'ACTIONS', minWidth: 120,
      onRender: (item: IGMPModel) => (
        <div style={{ display: 'flex', gap: 8 }}>
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
      )
    }
  ];

  const panelTitle = panelMode === 'add' ? 'Add GMP Model'
    : panelMode === 'edit' ? 'Edit GMP Model'
    : 'View GMP Model';

  return (
    <div className="manage-gmp-page">
      {isLoading && <Loader />}

      <Breadcrumb items={[
        { label: 'Home', onClick: () => {} },
        { label: 'GMP Models', isActive: true }
      ]} />

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="mainTitle" style={{ margin: 0 }}>GMP Models Master</h1>
        <PrimaryButton
          onClick={openAddPanel}
          styles={{ root: { background: 'var(--primry)', border: 'none' } }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
          Add GMP Model
        </PrimaryButton>
      </div>

      <div className="boxCard" style={{ padding: 0 }}>
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
              <Link className="actionBtn iconSize btnRefresh icon-mr" onClick={loadItems}>
                <TooltipHost content="Refresh">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
            </div>
          }
        />
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
          <TextField
            label="Model Name"
            required={!isReadOnly}
            readOnly={isReadOnly}
            value={formData.name}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, name: v || '' }))}
            errorMessage={fieldErrors.name}
          />
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 4 }}>
              Category <span style={{ color: 'red' }}>*</span>
            </label>
            {isReadOnly ? (
              <div style={{ padding: '6px 0', color: '#333' }}>{formData.category || '-'}</div>
            ) : (
              <ReactDropdown
                name="category"
                options={CATEGORY_OPTIONS}
                defaultOption={formData.category ? { value: formData.category, label: formData.category } : undefined}
                onChange={(opt: any) => setFormData(prev => ({ ...prev, category: opt?.value || '' }))}
                isCloseMenuOnSelect
                isSorted={false}
                isClearable={false}
                placeholder="Select Category"
              />
            )}
            {fieldErrors.category && <div style={{ color: '#d13438', fontSize: 12, marginTop: 4 }}>{fieldErrors.category}</div>}
          </div>
          <TextField
            label="Sub Group"
            readOnly={isReadOnly}
            value={formData.subGroup}
            onChange={(_e, v) => setFormData(prev => ({ ...prev, subGroup: v || '' }))}
            placeholder="e.g. Directive, Guideline, Policy..."
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
        subject="Delete GMP Model"
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
