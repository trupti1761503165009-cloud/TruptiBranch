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
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ], []);

  const statusDefault = React.useMemo(() =>
    filterStatusOptions.find(o => o.value === statusFilter) || filterStatusOptions[0],
    [statusFilter, filterStatusOptions]);

  const [isExcelUploadOpen, setIsExcelUploadOpen] = React.useState(false);

  // Extra filter state
  const [docCatFilter, setDocCatFilter] = React.useState('All');
  const [groupFilter, setGroupFilter] = React.useState('All');

  // Derived filter dropdown options (named with prefix to avoid conflict with ManageCategoriesData)
  const filterDocCatOptions = React.useMemo(() => {
    const unique = Array.from(new Set(filteredCategories.map((c: any) => c.documentCategory).filter(Boolean)));
    return unique.map((v: string) => ({ label: v, value: v }));
  }, [filteredCategories]);

  const filterGroupOptions = React.useMemo(() => {
    const base = docCatFilter === 'All' ? filteredCategories : filteredCategories.filter((c: any) => c.documentCategory === docCatFilter);
    const unique = Array.from(new Set(base.map((c: any) => c.group).filter(Boolean)));
    return unique.map((v: string) => ({ label: v, value: v }));
  }, [filteredCategories, docCatFilter]);

  // displayCategories applies docCat + group filters on top of filteredCategories
  const displayCategories = React.useMemo(() => {
    return filteredCategories
      .filter((c: any) => docCatFilter === 'All' || c.documentCategory === docCatFilter)
      .filter((c: any) => groupFilter === 'All' || c.group === groupFilter);
  }, [filteredCategories, docCatFilter, groupFilter]);

  const filterDocCatDefault = React.useMemo(() =>
    filterDocCatOptions.find(o => o.value === docCatFilter) || filterDocCatOptions[0],
    [docCatFilter, filterDocCatOptions]);

  const filterGroupDefault = React.useMemo(() =>
    filterGroupOptions.find(o => o.value === groupFilter) || filterGroupOptions[0],
    [groupFilter, filterGroupOptions]);

  // Unified Panel State for Add/Edit/View
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [selectedCategory, setSelectedCategory] = React.useState<(Category & any) | null>(null);
  const [hierarchyPath, setHierarchyPath] = React.useState<HierarchyPath>({});

  // Delete confirmation dialog state
  const [hideDeleteDialog, setHideDeleteDialog] = React.useState(true);

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
    const hasValue = (v?: string) => v && String(v).trim().length > 0;
    const norm = (v?: string) => (v && String(v).trim().length > 0 ? String(v).trim() : '');

    if (!hierarchyPath.documentCategory) return 'documentCategory';
    if (!hierarchyPath.group) return 'group';

    if (!hierarchyPath.subGroup) {
      const hasSubGroups = displayCategories
        .filter((c: any) => norm(c.documentCategory) === norm(hierarchyPath.documentCategory))
        .filter((c: any) => norm(c.group) === norm(hierarchyPath.group))
        .some((c: any) => hasValue(c.subGroup));
      if (!hasSubGroups) {
        const hasArtifacts = displayCategories
          .filter((c: any) => norm(c.documentCategory) === norm(hierarchyPath.documentCategory))
          .filter((c: any) => norm(c.group) === norm(hierarchyPath.group))
          .some((c: any) => hasValue(c.artifactName));
        return hasArtifacts ? 'artifactName' : 'items';
      }
      return 'subGroup';
    }

    if (!hierarchyPath.artifactName) {
      const hasArtifacts = displayCategories
        .filter((c: any) => norm(c.documentCategory) === norm(hierarchyPath.documentCategory))
        .filter((c: any) => norm(c.group) === norm(hierarchyPath.group))
        .filter((c: any) => !hasValue(hierarchyPath.subGroup) || norm(c.subGroup) === norm(hierarchyPath.subGroup))
        .some((c: any) => hasValue(c.artifactName));
      if (!hasArtifacts) {
        const hasTemplates = displayCategories
          .filter((c: any) => norm(c.documentCategory) === norm(hierarchyPath.documentCategory))
          .filter((c: any) => norm(c.group) === norm(hierarchyPath.group))
          .some((c: any) => hasValue(c.templateName));
        return hasTemplates ? 'templateName' : 'items';
      }
      return 'artifactName';
    }

    if (!hierarchyPath.templateName) {
      const hasTemplates = displayCategories
        .filter((c: any) => norm(c.documentCategory) === norm(hierarchyPath.documentCategory))
        .filter((c: any) => norm(c.group) === norm(hierarchyPath.group))
        .filter((c: any) => !hasValue(hierarchyPath.subGroup) || norm(c.subGroup) === norm(hierarchyPath.subGroup))
        .filter((c: any) => !hasValue(hierarchyPath.artifactName) || norm(c.artifactName) === norm(hierarchyPath.artifactName))
        .some((c: any) => hasValue(c.templateName));
      if (!hasTemplates) return 'items';
      return 'templateName';
    }

    return 'items';
  }, [hierarchyPath, displayCategories]);

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
    const normalized = (v?: string) => (v && String(v).trim().length > 0 ? String(v).trim() : '');
    const isBlank = (v?: string) => !v || String(v).trim().length === 0;

    if (hierarchyLevel === 'documentCategory') {
      const map = new Map<string, number>();
      displayCategories.forEach((c: any) => {
        const key = normalized(c.documentCategory);
        if (!key) return;
        map.set(key, (map.get(key) || 0) + 1);
      });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `dc:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name
      }));
    }

    if (hierarchyLevel === 'group') {
      const map = new Map<string, number>();
      displayCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .forEach((c: any) => {
          const key = normalized(c.group);
          if (!key) return;
          map.set(key, (map.get(key) || 0) + 1);
        });
      return Array.from(map.entries()).map(([name, count]) => ({
        id: `g:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name
      }));
    }

    if (hierarchyLevel === 'subGroup') {
      const map = new Map<string, number>();
      displayCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .forEach((c: any) => {
          const key = normalized(c.subGroup);
          if (!key) return;
          map.set(key, (map.get(key) || 0) + 1);
        });
      const subGroupItems = Array.from(map.entries()).map(([name, count]) => ({
        id: `sg:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name
      }));
      if (subGroupItems.length === 0) {
        return displayCategories
          .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
          .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group));
      }
      return subGroupItems;
    }

    if (hierarchyLevel === 'artifactName') {
      const map = new Map<string, number>();
      displayCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .filter((c: any) => isBlank(hierarchyPath.subGroup) || normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
        .forEach((c: any) => {
          const key = normalized(c.artifactName);
          if (!key) return;
          map.set(key, (map.get(key) || 0) + 1);
        });
      const artifactItems = Array.from(map.entries()).map(([name, count]) => ({
        id: `an:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name
      }));
      if (artifactItems.length === 0) {
        return displayCategories
          .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
          .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
          .filter((c: any) => isBlank(hierarchyPath.subGroup) || normalized(c.subGroup) === normalized(hierarchyPath.subGroup));
      }
      return artifactItems;
    }

    if (hierarchyLevel === 'templateName') {
      const map = new Map<string, number>();
      displayCategories
        .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
        .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
        .filter((c: any) => isBlank(hierarchyPath.subGroup) || normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
        .filter((c: any) => isBlank(hierarchyPath.artifactName) || normalized(c.artifactName) === normalized(hierarchyPath.artifactName))
        .forEach((c: any) => {
          const key = normalized(c.templateName);
          if (!key) return;
          map.set(key, (map.get(key) || 0) + 1);
        });
      const templateItems = Array.from(map.entries()).map(([name, count]) => ({
        id: `tn:${name}`,
        name,
        count,
        _kind: 'node' as const,
        _value: name
      }));
      if (templateItems.length === 0) {
        return displayCategories
          .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
          .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
          .filter((c: any) => isBlank(hierarchyPath.subGroup) || normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
          .filter((c: any) => isBlank(hierarchyPath.artifactName) || normalized(c.artifactName) === normalized(hierarchyPath.artifactName));
      }
      return templateItems;
    }

    return displayCategories
      .filter((c: any) => normalized(c.documentCategory) === normalized(hierarchyPath.documentCategory))
      .filter((c: any) => normalized(c.group) === normalized(hierarchyPath.group))
      .filter((c: any) => isBlank(hierarchyPath.subGroup) || normalized(c.subGroup) === normalized(hierarchyPath.subGroup))
      .filter((c: any) => isBlank(hierarchyPath.artifactName) || normalized(c.artifactName) === normalized(hierarchyPath.artifactName))
      .filter((c: any) => isBlank(hierarchyPath.templateName) || normalized(c.templateName) === normalized(hierarchyPath.templateName));
  }, [displayCategories, hierarchyLevel, hierarchyPath]);

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
                  ? 'ARTIFACT NAME / DOCUMENT NAME'
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
    <div className="pageContainer" style={{ paddingTop: 0 }}>
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

      {/* Delete Confirmation Modal */}
      <CustomModal
        isModalOpenProps={!hideDeleteDialog}
        setModalpopUpFalse={() => setHideDeleteDialog(true)}
        onClose={() => setHideDeleteDialog(true)}
        subject="Confirm Delete"
        message={
          <p>Are you sure you want to delete the selected <strong>{selectedIds.length > 1 ? `${selectedIds.length} categories` : 'category'}</strong>? This action cannot be undone.</p>
        }
        yesButtonText="Delete"
        closeButtonText="Cancel"
        onClickOfYes={async () => {
          setHideDeleteDialog(true);
          await handleBulkDelete();
        }}
      />

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>Manage Categories</h1>

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
            title="Inactive"
            value={filteredCategories.filter((c: any) => c.status === 'Inactive').length}
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
        <div className="ms-Grid-row ptop-5">
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
            <div className="formControl ims-site-pad">
              <ReactDropdown
                name="statusFilter"
                options={filterStatusOptions}
                defaultOption={filterStatusOptions.find(o => o.value === statusFilter)}
                onChange={(opt: any) => setStatusFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={true}
              />
            </div>
          </div>
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
            <div className="formControl ims-site-pad">
              <ReactDropdown
                name="docCatFilter"
                options={filterDocCatOptions}
                defaultOption={filterDocCatOptions.find(o => o.value === docCatFilter)}
                onChange={(opt: any) => { setDocCatFilter(opt?.value ?? 'All'); setGroupFilter('All'); }}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={true}
              />
            </div>
          </div>
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
            <div className="formControl ims-site-pad">
              <ReactDropdown
                name="filterGroupFilter"
                options={filterGroupOptions}
                defaultOption={filterGroupOptions.find(o => o.value === groupFilter)}
                onChange={(opt: any) => setGroupFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={true}
              />
            </div>
          </div>
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ display: 'flex', alignItems: 'center', paddingTop: 1 }}>
            <DefaultButton
              text="Reset"
              onClick={() => { setStatusFilter('All'); setDocCatFilter('All'); setGroupFilter('All'); }}
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
        <Breadcrumb
          items={renderBreadcrumb().map(crumb => ({
            label: crumb.label,
            onClick: crumb.onClick,
            isActive: crumb.isActive
          }))}
        />
      </div>

      {/* ===== SECTION 4: Grid ===== */}
      <div>
        <MemoizedDataGridComponent
          columns={hierarchyColumns}
          items={currentItems}
          onItemInvoked={onInvokeHierarchyItem}
          searchable={true}
          isPagination={true}
          reRenderComponent={true}
          onSelectedItem={(items: any[]) => setSelectedIds(items.map((i: any) => i.id))}
          CustomselectionMode={2}
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
                  root: { background: '#217346', borderColor: '#217346', color: '#fff', marginLeft: 8 },
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
                style={{ marginLeft: 8 }}
                onClick={() => {
                  props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddCategory,
                    componentProps: { parentId: undefined } // or relevant parent
                  });
                }}
              />
            </div>
          }
          addEDButton={
            selectedIds.length > 0 && (
              <div className="dflex">
                {selectedIds.length === 1 && hierarchyLevel === 'items' && (
                  <>
                    <Link
                      className="actionBtn iconSize btnView"
                      onClick={() => {
                        const item = (currentItems as any[]).find((i: any) => i.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditCategory,
                            componentProps: { item, mode: 'view' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="View">
                        <FontAwesomeIcon icon={faEye} />
                      </TooltipHost>
                    </Link>
                    <Link
                      className="actionBtn iconSize btnEdit ml-10"
                      onClick={() => {
                        const item = (currentItems as any[]).find((i: any) => i.id === selectedIds[0]);
                        if (item) {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.EditCategory,
                            componentProps: { item, mode: 'edit' }
                          });
                        }
                      }}
                    >
                      <TooltipHost content="Edit">
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </TooltipHost>
                    </Link>
                  </>
                )}
                <Link
                  className="actionBtn iconSize btnDanger ml-10"
                  onClick={() => setHideDeleteDialog(false)}
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
