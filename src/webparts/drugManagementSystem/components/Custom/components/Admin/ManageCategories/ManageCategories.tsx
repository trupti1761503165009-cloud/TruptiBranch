/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { DefaultButton, PrimaryButton, TextField, Link, TooltipHost } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faEye, faFileExcel, faFolder, faPenToSquare, faPlus, faSave, faTimes, faTrashCan, faList, faCheckCircle, faFolderTree, faLayerGroup, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { Loader } from '../../../../Common/Loader/Loader';
import { ManageCategoriesData } from './ManageCategoriesData';
import type { Category } from '../../../types';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { ExcelUploadCategoriesModal } from './ExcelUploadCategoriesModal';
import { CategoryForm } from './CategoryForm';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';

type HierarchyPath = {
  documentCategory?: string;
  group?: string;
  subGroup?: string;
  artifactName?: string;
  templateName?: string;
};

import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { StatusBadge } from '../../../../Common/StatusBadge/StatusBadge';
import { getFileTypeIcon } from '../../../../Common/utils';

export const ManageCategories: React.FC<any> = (props) => {
  const {
    filteredCategories,
    searchTerm,
    statusFilter,
    selectedIds,
    isCreatePageOpen,
    isDeleteDialogOpen,
    documentCategoryOptions,
    groupOptions,
    subGroupOptions,
    artifactNameOptions,
    templateNameOptions,
    ctdModuleOptions,
    ectdSectionOptions,
    ectdSubsectionOptions,
    ectdCodeOptions,
    formData,
    fieldErrors,
    errorMessage,
    successMessage,
    isLoading,
    provider,
    setSearchTerm,
    setStatusFilter,
    setSelectedIds,
    setIsCreatePageOpen,
    setIsDeleteDialogOpen,
    setFormData,
    resetForm,
    handleAddCategory,
    handleEditCategory,
    handleDeleteClick,
    handleDeleteConfirm,
    handleBulkDelete,
    loadCategories,
    setEditingCategory
  } = ManageCategoriesData();

  const filterStatusOptions = React.useMemo(() => [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ], []);

  const statusDefault = React.useMemo(() =>
    filterStatusOptions.find(o => o.value === statusFilter) || filterStatusOptions[0],
    [statusFilter, filterStatusOptions]);

  const [isExcelUploadOpen, setIsExcelUploadOpen] = React.useState(false);

  // Unified Panel State for Add/Edit/View
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [selectedCategory, setSelectedCategory] = React.useState<(Category & any) | null>(null);
  const [hierarchyPath, setHierarchyPath] = React.useState<HierarchyPath>({});

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
    if (errorMessage) showMessage('error', 'Error', errorMessage);
  }, [errorMessage]);

  // State for Edit/View Form Page (instead of panel)
  const [editViewFormMode, setEditViewFormMode] = React.useState<'edit' | 'view' | null>(null);

  // Open form page for different modes (not panel)
  const openPanel = (mode: 'add' | 'edit' | 'view', category?: Category & any) => {
    if (mode === 'add') {
      setIsCreatePageOpen(true);
      // Pre-fill form from hierarchy path
      setFormData({
        ...formData,
        documentCategory: hierarchyPath.documentCategory || '',
        group: hierarchyPath.group || '',
        subGroup: hierarchyPath.subGroup || '',
        artifactName: hierarchyPath.artifactName || '',
        templateName: hierarchyPath.templateName || '',
        status: 'Active'
      });
      return;
    }
    // For edit and view, use form page instead of panel
    setPanelMode(mode);
    setEditViewFormMode(mode);
    if (category) {
      setSelectedCategory(category);
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        documentCategory: category.documentCategory || '',
        group: category.group || '',
        subGroup: category.subGroup || '',
        artifactName: category.artifactName || '',
        templateName: category.templateName || '',
        status: category.status || 'Active',
        documents: category.documents || 0,
        description: category.description || '',
        artifactDescription: category.artifactDescription || '',
        ctdModule: category.ctdModule || '',
        ectdSection: category.ectdSection || '',
        ectdSubsection: category.ectdSubsection || '',
        ectdCode: category.ectdCode || ''
      });
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditViewFormMode(null);
    setSelectedCategory(null);
    setEditingCategory(null);
    resetForm();
  };

  const handlePanelSave = async (_data: any) => {
    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
    let success = false;
    if (panelMode === 'add') {
      success = await handleAddCategory(fakeEvent);
    } else if (panelMode === 'edit' && selectedCategory) {
      success = await handleEditCategory(fakeEvent);
    }

    if (success) {
      closePanel();
    }
  };


  const hierarchyLevel = React.useMemo(() => {
    if (!hierarchyPath.documentCategory) return 'documentCategory';
    if (!hierarchyPath.group) return 'group';
    if (!hierarchyPath.subGroup) return 'subGroup';
    if (!hierarchyPath.artifactName) return 'artifactName';
    if (!hierarchyPath.templateName) return 'templateName';
    return 'items';
  }, [hierarchyPath]);

  const breadcrumbs = React.useMemo(() => {
    const crumbs: Array<{ key: 'root' | 'documentCategory' | 'group' | 'subGroup' | 'artifactName' | 'templateName'; label: string }> = [
      { key: 'root', label: 'Categories' }
    ];
    if (hierarchyPath.documentCategory) crumbs.push({ key: 'documentCategory', label: hierarchyPath.documentCategory });
    if (hierarchyPath.group) crumbs.push({ key: 'group', label: hierarchyPath.group });
    if (hierarchyPath.subGroup) crumbs.push({ key: 'subGroup', label: hierarchyPath.subGroup });
    if (hierarchyPath.artifactName) crumbs.push({ key: 'artifactName', label: hierarchyPath.artifactName });
    if (hierarchyPath.templateName) crumbs.push({ key: 'templateName', label: hierarchyPath.templateName });
    return crumbs;
  }, [hierarchyPath]);

  const columns: any[] = [
    {
      key: 'name',
      name: 'CATEGORY NAME',
      fieldName: 'name',
      minWidth: 260,
      maxWidth: 420,
      isSortingRequired: true,
      onRender: (category: any) => (
        <div className="doc-name-cell">
          <img
            className="doc-icon"
            src={getFileTypeIcon('folder')}
            alt=""
            style={{ width: 16, height: 16, marginRight: 8 }}
          />
          <span>{category.name}</span>
        </div>
      )
    },
    {
      key: 'createdDate',
      name: 'CREATED DATE',
      fieldName: 'createdDate',
      minWidth: 120,
      maxWidth: 160,
      isSortingRequired: true
    },
    {
      key: 'status',
      name: 'STATUS',
      fieldName: 'status',
      minWidth: 100,
      maxWidth: 130,
      isSortingRequired: true,
      onRender: (item: any) => {
        const status = item.status || 'Active';
        return <StatusBadge status={status.toLowerCase()} size="small" />;
      }
    },
  ];

  /* 
  // Old rightSideButtons - removed in favor of grid addNewContent
  const rightSideButtons = React.useMemo(() => { ... }) 
  */

  const currentItems = React.useMemo(() => {
    const normalized = (v?: string) => (v && String(v).trim().length > 0 ? String(v) : '(Blank)');

    if (hierarchyLevel === 'documentCategory') {
      const map = new Map<string, number>();
      filteredCategories.forEach((c: any) => {
        const key = normalized(c.documentCategory);
        map.set(key, (map.get(key) || 0) + 1);
      });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `dc:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name === '(Blank)' ? '' : name
      }));
    }

    if (hierarchyLevel === 'group') {
      const map = new Map<string, number>();
      filteredCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .forEach((c: any) => {
          const key = normalized(c.group);
          map.set(key, (map.get(key) || 0) + 1);
        });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `g:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name === '(Blank)' ? '' : name
      }));
    }

    if (hierarchyLevel === 'subGroup') {
      const map = new Map<string, number>();
      filteredCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .forEach((c: any) => {
          const key = normalized(c.subGroup);
          map.set(key, (map.get(key) || 0) + 1);
        });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `sg:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name === '(Blank)' ? '' : name
      }));
    }

    if (hierarchyLevel === 'artifactName') {
      const map = new Map<string, number>();
      filteredCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .filter((c: any) => normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
        .forEach((c: any) => {
          const key = normalized(c.artifactName);
          map.set(key, (map.get(key) || 0) + 1);
        });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `an:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name === '(Blank)' ? '' : name
      }));
    }

    if (hierarchyLevel === 'templateName') {
      const map = new Map<string, number>();
      filteredCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .filter((c: any) => normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
        .filter((c: any) => normalized(c.artifactName) === normalized(hierarchyPath.artifactName))
        .forEach((c: any) => {
          const key = normalized(c.templateName);
          map.set(key, (map.get(key) || 0) + 1);
        });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `tn:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name === '(Blank)' ? '' : name
      }));
    }

    return filteredCategories
      .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
      .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
      .filter((c: any) => normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
      .filter((c: any) => normalized(c.artifactName) === normalized(hierarchyPath.artifactName))
      .filter((c: any) => normalized(c.templateName) === normalized(hierarchyPath.templateName));
  }, [filteredCategories, hierarchyLevel, hierarchyPath]);

  // Define onInvokeHierarchyItem BEFORE hierarchyColumns since it's used in the render
  const onInvokeHierarchyItem = React.useCallback(
    (item?: any) => {
      if (!item) return;
      if (hierarchyLevel === 'documentCategory') {
        setHierarchyPath({ documentCategory: item._value });
        return;
      }
      if (hierarchyLevel === 'group') {
        setHierarchyPath((p) => ({ ...p, group: item._value }));
        return;
      }
      if (hierarchyLevel === 'subGroup') {
        setHierarchyPath((p) => ({ ...p, subGroup: item._value }));
        return;
      }
      if (hierarchyLevel === 'artifactName') {
        setHierarchyPath((p) => ({ ...p, artifactName: item._value }));
        return;
      }
      if (hierarchyLevel === 'templateName') {
        setHierarchyPath((p) => ({ ...p, templateName: item._value }));
        return;
      }
      // At items level, open view panel
      openPanel('view', item as any);
    },
    [hierarchyLevel]
  );

  const hierarchyColumns: any[] = React.useMemo(() => {
    if (hierarchyLevel === 'items') return columns;
    return [
      {
        key: 'name',
        name:
          hierarchyLevel === 'documentCategory'
            ? 'DOCUMENT CATEGORY'
            : hierarchyLevel === 'group'
              ? 'GROUP'
              : hierarchyLevel === 'subGroup'
                ? 'SUB-GROUP'
                : hierarchyLevel === 'artifactName'
                  ? 'ARTIFACT NAME'
                  : 'TEMPLATE NAME',
        fieldName: 'name',
        minWidth: 350,
        maxWidth: 600,
        isSortingRequired: true,
        onRender: (item: any) => (
          <div
            className="folder-row-clickable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '8px 0'
            }}
            onClick={() => onInvokeHierarchyItem(item)}
            data-testid={`category-folder-${item.id}`}
          >
            <FontAwesomeIcon
              icon={faFolder}
              style={{ fontSize: 20, color: '#FFA000' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>{item.name}</span>
              <span style={{
                marginLeft: 12,
                fontSize: 12,
                color: '#666'
              }}>
                ({item.count} {item.count === 1 ? 'item' : 'items'})
              </span>
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={{ fontSize: 14, color: '#999' }}
            />
          </div>
        )
      }
    ];
  }, [hierarchyLevel, columns, onInvokeHierarchyItem]);



  const getPanelTitle = () => {
    if (panelMode === 'add') return 'Add New Category';
    if (panelMode === 'edit') return `Edit Category${selectedCategory ? ` - ${selectedCategory.name}` : ''}`;
    return `View Category${selectedCategory ? ` - ${selectedCategory.name}` : ''}`;
  };

  // Breadcrumb for hierarchy navigation
  const renderBreadcrumb = () => {
    const crumbs: Array<{ label: string; onClick: () => void; isActive: boolean }> = [
      { label: 'Categories', onClick: () => setHierarchyPath({}), isActive: hierarchyLevel === 'documentCategory' }
    ];

    if (hierarchyPath.documentCategory) {
      crumbs.push({
        label: hierarchyPath.documentCategory,
        onClick: () => setHierarchyPath({ documentCategory: hierarchyPath.documentCategory }),
        isActive: hierarchyLevel === 'group'
      });
    }

    if (hierarchyPath.group) {
      crumbs.push({
        label: hierarchyPath.group,
        onClick: () => setHierarchyPath({ documentCategory: hierarchyPath.documentCategory, group: hierarchyPath.group }),
        isActive: hierarchyLevel === 'subGroup'
      });
    }

    if (hierarchyPath.subGroup) {
      crumbs.push({
        label: hierarchyPath.subGroup,
        onClick: () => setHierarchyPath({
          documentCategory: hierarchyPath.documentCategory,
          group: hierarchyPath.group,
          subGroup: hierarchyPath.subGroup
        }),
        isActive: hierarchyLevel === 'artifactName'
      });
    }

    if (hierarchyPath.artifactName) {
      crumbs.push({
        label: hierarchyPath.artifactName,
        onClick: () => setHierarchyPath({
          documentCategory: hierarchyPath.documentCategory,
          group: hierarchyPath.group,
          subGroup: hierarchyPath.subGroup,
          artifactName: hierarchyPath.artifactName
        }),
        isActive: hierarchyLevel === 'templateName'
      });
    }

    if (hierarchyPath.templateName) {
      crumbs.push({
        label: hierarchyPath.templateName,
        onClick: () => { },
        isActive: true
      });
    }

    return crumbs;
  };

  // Calculate summary stats
  const totalCategories = filteredCategories.length;
  // const activeCategories = filteredCategories.filter((c: any) => c.status === 'Active').length;
  // const inactiveCategories = filteredCategories.filter((c: any) => c.status === 'Inactive').length;
  // const uniqueDocCategories = new Set(filteredCategories.map((c: any) => c.documentCategory)).size;

  // Render Grid View
  return (
    <div data-testid="" className=''>
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
      {/* 
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => { } },
          { label: 'Manage Categories', isActive: true }
        ]}
      /> */}

      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h1 className="mainTitle">Manage Categories</h1>
        </div>
      </div>

      {/* Breadcrumbs under header (single row) */}
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb
          items={renderBreadcrumb().map(crumb => ({
            label: crumb.label,
            onClick: crumb.onClick,
            isActive: crumb.isActive
          }))}
        />
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-container ">
        <SummaryCard
          title="Total Categories"
          value={totalCategories}
          icon={faList}
          color="blue"
        />
        <SummaryCard
          title="Active Categories"
          value={filteredCategories.filter((c: any) => c.status === 'Active').length}
          icon={faCheckCircle}
          color="green"
        />
        <SummaryCard
          title="Document Categories"
          value={new Set(filteredCategories.map((c: any) => c.documentCategory)).size}
          icon={faFolderTree}
          color="orange"
        />
        <SummaryCard
          title="Total Groups"
          value={new Set(filteredCategories.map((c: any) => c.group)).size}
          icon={faLayerGroup}
          color="purple"
        />
      </div>

      {/* Filters row (below cards, above grid) */}
      <div className="ms-Grid mt-3">
        <div className="ms-Grid-row ptop-5">
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3">
            <div className="formControl ims-site-pad">
              <div className="formControl">
                <ReactDropdown
                  name="statusFilter"
                  options={filterStatusOptions}
                  defaultOption={statusDefault}
                  onChange={(opt: any) => setStatusFilter(opt?.value ?? 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="boxCard">
        <MemoizedDataGridComponent
          columns={hierarchyColumns}
          items={currentItems}
          onItemInvoked={onInvokeHierarchyItem}
          searchable={true}
          reRenderComponent={true}
          onSelectedItem={(items: any[]) => setSelectedIds(items.map((i: any) => i.id))}
          CustomselectionMode={true}
          // selectionMode={hierarchyLevel === 'items' ? 1 : 0} 
          // onSelectionChange={(items: any[]) => setSelectedIds(items.map((i: any) => i.id))}
          isAddNew={true}
          addNewContent={
            <div className="dflex">
              <Link
                className="actionBtn iconSize btnRefresh ml-10"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setHierarchyPath({});
                  void loadCategories();
                }}
              >
                <TooltipHost content={"Reset & Refresh"}>
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
              <DefaultButton
                key="excelUpload"
                onClick={() => setIsExcelUploadOpen(true)}
                className="btn btn-success icon-mr"
                styles={{
                  root: { background: '#217346', borderColor: '#217346', color: '#fff' },
                  rootHovered: { background: '#1a5c37', borderColor: '#1a5c37', color: '#fff' }
                }}
              >
                <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: 8 }} />
                Excel Upload
              </DefaultButton>
              <PrimaryButton
                key="add"
                text="Add Category"
                className="btn btn-primary"
                onClick={() => {
                  props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddCategory,
                    componentProps: { parentId: undefined } // or relevant parent
                  });
                }}
              />
            </div>
          }
        // addEDButton={
        //   selectedIds.length > 0 && (
        //     <div className="dflex">
        //       {selectedIds.length === 1 && (
        //         <>
        //           <Link
        //             className="actionBtn iconSize btnView"
        //             onClick={() => {
        //               const item = (currentItems as any[]).find((i: any) => i.id === selectedIds[0]);
        //               if (item) {
        //                 props.manageComponentView({
        //                   currentComponentName: ComponentNameEnum.EditCategory,
        //                   componentProps: { item, mode: 'view' }
        //                 });
        //               }
        //             }}
        //           >
        //             <TooltipHost content="View">
        //               <FontAwesomeIcon icon={faEye} />
        //             </TooltipHost>
        //           </Link>
        //           <Link
        //             className="actionBtn iconSize btnEdit ml-10"
        //             onClick={() => {
        //               const item = (currentItems as any[]).find((i: any) => i.id === selectedIds[0]);
        //               if (item) {
        //                 props.manageComponentView({
        //                   currentComponentName: ComponentNameEnum.EditCategory,
        //                   componentProps: { item, mode: 'edit' }
        //                 });
        //               }
        //             }}
        //           >
        //             <TooltipHost content="Edit">
        //               <FontAwesomeIcon icon={faPenToSquare} />
        //             </TooltipHost>
        //           </Link>
        //         </>
        //       )}
        //       <Link
        //         className="actionBtn iconSize btnDanger ml-10"
        //         onClick={handleBulkDelete}
        //       >
        //         <TooltipHost content="Delete Selected">
        //           <FontAwesomeIcon icon={faTrashCan} />
        //         </TooltipHost>
        //       </Link>
        //     </div>
        //   )
        // }
        />
      </div>

      {/* Excel Upload Modal */}
      <ExcelUploadCategoriesModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        onSuccess={() => {
          setIsExcelUploadOpen(false);
          loadCategories();
        }}
        provider={provider}
      />
    </div>
  );
};
