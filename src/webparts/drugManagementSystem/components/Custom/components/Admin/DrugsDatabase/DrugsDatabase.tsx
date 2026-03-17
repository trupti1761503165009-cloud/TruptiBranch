import { faArrowLeft, faEye, faPenToSquare, faPlus, faTrashCan, faCapsules, faCheckCircle, faFlask, faClock, faArrowsRotate, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import {  MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { Loader } from '../../../../Common/Loader/Loader';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import '../DrugsDatabase.css';
import { DrugsDatabaseData, type DrugItem } from './DrugsDatabaseData';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { StatusBadge } from '../../../../Common/StatusBadge/StatusBadge';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';

import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TooltipHost, Link, DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';

export const DrugsDatabase: React.FC<any> = (props) => {
  const {
    filteredDrugs,
    searchTerm,
    statusFilter,
    statusOptions,
    selectedIds,
    isDeleteDialogOpen,
    formData,
    fieldErrors,
    isLoading,
    setSearchTerm,
    setStatusFilter,
    setSelectedIds,
    setIsDeleteDialogOpen,
    setFormData,
    resetForm,
    handleAddDrug,
    openEditDrug,
    handleEditDrug,
    handleDeleteDrug,
    confirmDeleteDrug,
    handleBulkDelete,
    totalDrugs,
    activeDrugs,
    inactiveDrugs,
    inDevelopmentDrugs
  } = DrugsDatabaseData();

  // Message Dialog State
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

  const statusOptionsList: IReactDropOptionProps[] = React.useMemo(
    () => [{ label: 'All Status', value: 'All' }, ...statusOptions.map(option => ({ label: option, value: option }))],
    [statusOptions]
  );

  const statusDropdownOptions = React.useMemo(
    () =>
      (statusOptions.length > 0 ? statusOptions : ['Active', 'Inactive', 'In Development']).map(option => ({
        label: option,
        value: option
      })),
    [statusOptions]
  );

  const statusDefault = React.useMemo(
    () => statusOptionsList.find(o => o.value === statusFilter) ?? statusOptionsList[0],
    [statusFilter, statusOptionsList]
  );

  const columns: any[] = [
    {
      key: 'name',
      name: 'Drug Name',
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 280,
      isSortingRequired: true,
      onRender: (item: DrugItem) => (
        <TooltipHost content={item.name}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
        </TooltipHost>
      )
    },
    {
      key: 'category',
      name: 'CATEGORY',
      fieldName: 'category',
      minWidth: 160,
      maxWidth: 220,
      isSortingRequired: true,
      onRender: (item: DrugItem) => (
        <TooltipHost content={item.category || '-'}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.category || '-'}
          </span>
        </TooltipHost>
      )
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 120,
      maxWidth: 160,
      isSortingRequired: true,
      onRender: (item: DrugItem) => (
        <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'description',
      name: 'Description',
      fieldName: 'description',
      minWidth: 220,
      maxWidth: 320,
      isSortingRequired: false,
      onRender: (item: DrugItem) => (
        <TooltipHost content={item.description || '-'}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.description || '-'}
          </span>
        </TooltipHost>
      )
    },
    {
      key: 'actions',
      name: 'ACTIONS',
      fieldName: 'actions',
      minWidth: 140,
      maxWidth: 180,
      isSortingRequired: false,
      onRender: (item: DrugItem) => (
        <div className="dflex" style={{ gap: 6 }}>
          <Link
            className="actionBtn iconSize btnView"
            onClick={() => props.manageComponentView({ currentComponentName: ComponentNameEnum.EditDrug, componentProps: { item, mode: 'view' } })}
          >
            <TooltipHost content="View"><FontAwesomeIcon icon={faEye} /></TooltipHost>
          </Link>
          <Link
            className="actionBtn iconSize btnEdit ml-10"
            onClick={() => props.manageComponentView({ currentComponentName: ComponentNameEnum.EditDrug, componentProps: { item, mode: 'edit' } })}
          >
            <TooltipHost content="Edit"><FontAwesomeIcon icon={faPenToSquare} /></TooltipHost>
          </Link>
          <Link
            className="actionBtn iconSize btnDanger ml-10"
            onClick={() => { setSelectedIds([item.id]); setIsDeleteDialogOpen(true); }}
          >
            <TooltipHost content="Delete"><FontAwesomeIcon icon={faTrashCan} /></TooltipHost>
          </Link>
        </div>
      )
    },
  ];




  // LIST VIEW
  return (
    <div className="drugs-database" data-testid="drugs-database-page">
      {isLoading && <Loader />}

      {/* Message Dialog */}
      <MessageDialog
        hidden={messageDialog.hidden}
        onDismiss={hideMessage}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
        fields={messageDialog.fields}
      />

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>Drugs Database</h1>

      {/* ===== SECTION 1: Summary Cards ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '16px 20px',
        marginBottom: 16
      }}>
        <div className="summary-cards-container" style={{ marginBottom: 0 }}>
          <SummaryCard
            title="Total Drugs"
            value={totalDrugs}
            icon={faCapsules}
            color="blue"
          />
          <SummaryCard
            title="Active"
            value={activeDrugs}
            icon={faCheckCircle}
            color="green"
          />
          <SummaryCard
            title="In Development"
            value={inDevelopmentDrugs}
            icon={faFlask}
            color="purple"
          />
          <SummaryCard
            title="Inactive"
            value={inactiveDrugs}
            icon={faClock}
            color="orange"
          />
        </div>
      </div>

      {/* ===== SECTION 2: Filters ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '12px 20px',
        marginBottom: 16
      }}>
        <div className="ms-Grid">
          <div className="ms-Grid-row" style={{ alignItems: 'flex-end' }}>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4">
              <div className="formControl">
                <ReactDropdown
                  name="statusFilter"
                  options={statusOptionsList}
                  defaultOption={statusDefault}
                  onChange={(opt) => setStatusFilter(opt?.value ?? 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4" style={{ paddingTop: 4, display: 'flex', alignItems: 'center' }}>
              <DefaultButton
                text="Reset"
                onClick={() => { setStatusFilter('All'); setSearchTerm(''); }}
                styles={{
                  root: { background: '#d32f2f', borderColor: '#d32f2f', color: '#fff', minWidth: 100, borderRadius: 4 },
                  rootHovered: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                  rootPressed: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                  label: { color: '#fff', fontWeight: 600 },
                  icon: { color: '#fff' }
                }}
                onRenderIcon={() => <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: 6, color: '#fff' }} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3: Breadcrumb ===== */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={[{ label: 'Drugs Database', isActive: true }]} />
      </div>

      {/* ===== SECTION 4: Grid ===== */}
      <div className="boxCard" style={{ padding: 0, margin: 0, minHeight: 'auto' }}>
        <MemoizedDataGridComponent
          items={filteredDrugs}
          columns={columns}
          reRenderComponent={true}
          searchable={true}
          isPagination={true}
          onSelectedItem={(items: DrugItem[]) => setSelectedIds(items.map(i => i.id))}
          isAddNew={true}
          addNewContent={
            <div className="dflex pb-1">
              <PrimaryButton
                className="btn btn-primary"
                text="Add Drug"
                onClick={() => {
                  props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddDrug
                  });
                }}
              />
              <Link
                className="actionBtn iconSize btnRefresh ml-10"
                onClick={() => { setStatusFilter('All'); setSearchTerm(''); }}
              >
                <TooltipHost content="Refresh Grid" id="tooltip-refresh">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
            </div>
          }
          addEDButton={
            selectedIds.length > 0 && (
              <div className="dflex">
                {selectedIds.length === 1 && (
                  <>
                    <Link
                      className="actionBtn iconSize btnView"
                      onClick={() => {
                        const item = filteredDrugs.find(i => i.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditDrug,
                            componentProps: { item, mode: 'view' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="View Detail">
                        <FontAwesomeIcon icon={faEye} />
                      </TooltipHost>
                    </Link>
                    <Link
                      className="actionBtn iconSize btnEdit ml-10"
                      onClick={() => {
                        const item = filteredDrugs.find(i => i.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditDrug,
                            componentProps: { item, mode: 'edit' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="Edit Detail">
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </TooltipHost>
                    </Link>
                  </>
                )}
                <Link
                  className="actionBtn iconSize btnDanger ml-10"
                  onClick={handleBulkDelete}
                >
                  <TooltipHost content="Delete Selected">
                    <FontAwesomeIcon icon={faTrashCan} />
                  </TooltipHost>
                </Link>
              </div>
            )
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={(open) => {
          if (!open) setIsDeleteDialogOpen(false);
        }}
        subject="Delete Drug"
        isLoading={isLoading}
        message="Are you sure you want to delete this drug? This action cannot be undone."
        yesButtonText="Delete"
        onClickOfYes={confirmDeleteDrug}
        closeButtonText="Cancel"
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};
