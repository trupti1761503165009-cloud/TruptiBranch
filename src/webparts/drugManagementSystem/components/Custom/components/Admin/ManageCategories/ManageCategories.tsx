/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { DefaultButton, PrimaryButton, TextField, Link, TooltipHost, Label } from '@fluentui/react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight, faEye, faFileExcel, faFolder, faFolderOpen,
  faPenToSquare, faPlus, faSave, faTimes, faTrashCan,
  faList, faCheckCircle, faFolderTree, faLayerGroup, faArrowsRotate,
  faFileWord, faFilePdf, faFile, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
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
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

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
  const { context } = useAtomValue(appGlobalStateAtom);

  const {
    categories,
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
    handleAddNode,
    handleRenameNode,
    handleDeleteNode,
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

  // Quick-add dialog (level-aware)
  const [quickAddDialog, setQuickAddDialog] = React.useState<{
    open: boolean;
    level: 'documentCategory' | 'group' | 'subGroup' | 'artifactName' | 'templateName';
    label: string;
    value: string;
    linkedTemplate: string;
  }>({ open: false, level: 'documentCategory', label: '', value: '', linkedTemplate: '' });

  // Rename dialog
  const [renameDialog, setRenameDialog] = React.useState<{
    open: boolean;
    level: 'documentCategory' | 'group' | 'subGroup' | 'artifactName' | 'templateName';
    oldValue: string;
    newValue: string;
    path: HierarchyPath;
  }>({ open: false, level: 'documentCategory', oldValue: '', newValue: '', path: {} });

  // Node-level delete confirmation
  const [nodeDeleteDialog, setNodeDeleteDialog] = React.useState<{
    open: boolean;
    level: 'documentCategory' | 'group' | 'subGroup' | 'artifactName' | 'templateName';
    nodeValue: string;
    path: HierarchyPath;
    count: number;
  }>({ open: false, level: 'documentCategory', nodeValue: '', path: {}, count: 0 });

  // View/Preview panel for artifact/leaf items
  const [viewPanelItem, setViewPanelItem] = React.useState<any>(null);

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

  const columnHeaderByLevel: Record<string, string> = {
    documentCategory: 'DOCUMENT CATEGORY',
    group: 'GROUP',
    subGroup: 'SUB GROUP',
    artifactName: 'ARTIFACT NAME',
    templateName: 'TEMPLATE NAME',
    items: 'NAME'
  };

  const columns: any[] = [
    {
      key: 'name',
      name: columnHeaderByLevel[hierarchyLevel] || 'CATEGORY NAME',
      fieldName: 'name',
      minWidth: 260,
      maxWidth: 420,
      isSortingRequired: true,
      onRender: (category: any) => {
        const isLeaf = hierarchyLevel === 'artifactName' || hierarchyLevel === 'templateName' || hierarchyLevel === 'items';
        let iconSrc = getFileTypeIcon('folder');
        if (isLeaf) {
          const name: string = (category.name || '').toLowerCase();
          if (name.endsWith('.pdf')) iconSrc = getFileTypeIcon('pdf');
          else if (name.endsWith('.doc') || name.endsWith('.docx')) iconSrc = getFileTypeIcon('docx');
          else if (name.endsWith('.xls') || name.endsWith('.xlsx')) iconSrc = getFileTypeIcon('xlsx');
          else if (name.endsWith('.ppt') || name.endsWith('.pptx')) iconSrc = getFileTypeIcon('pptx');
          else iconSrc = getFileTypeIcon('docx');
        }
        return (
          <div className="doc-name-cell">
            <img
              className="doc-icon"
              src={iconSrc}
              alt=""
              style={{ width: 16, height: 16, marginRight: 8 }}
            />
            <span>{category.name}</span>
          </div>
        );
      }
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
      // At items level, open preview panel
      setViewPanelItem(item);
    },
    [hierarchyLevel]
  );

  const levelToField = (level: string): 'documentCategory' | 'group' | 'subGroup' | 'artifactName' | 'templateName' => {
    const map: Record<string, any> = {
      documentCategory: 'documentCategory', group: 'group',
      subGroup: 'subGroup', artifactName: 'artifactName', templateName: 'templateName'
    };
    return map[level] || 'documentCategory';
  };

  const getNodeCount = (level: string, value: string): number => {
    const n = (v?: string) => (v || '').trim();
    return categories.filter(cat => {
      if (level === 'documentCategory') return n(cat.documentCategory) === n(value);
      if (level === 'group') return n(cat.documentCategory) === n(hierarchyPath.documentCategory) && n(cat.group) === n(value);
      if (level === 'subGroup') return n(cat.documentCategory) === n(hierarchyPath.documentCategory) && n(cat.group) === n(hierarchyPath.group) && n(cat.subGroup) === n(value);
      if (level === 'artifactName') return n(cat.documentCategory) === n(hierarchyPath.documentCategory) && n(cat.group) === n(hierarchyPath.group) && n(cat.artifactName) === n(value);
      if (level === 'templateName') return n(cat.documentCategory) === n(hierarchyPath.documentCategory) && n(cat.group) === n(hierarchyPath.group) && n(cat.artifactName) === n(hierarchyPath.artifactName) && n(cat.templateName) === n(value);
      return false;
    }).length;
  };

  const getDocIcon = (name: string): any => {
    const lower = (name || '').toLowerCase();
    if (lower.endsWith('.pdf')) return faFilePdf;
    if (lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.rtf')) return faFileWord;
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return faFileExcel;
    return faFileAlt;
  };

  const getDocIconColor = (name: string): string => {
    const lower = (name || '').toLowerCase();
    if (lower.endsWith('.pdf')) return '#e53935';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return '#1565c0';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return '#2e7d32';
    return '#546e7a';
  };

  const hierarchyColumns: any[] = React.useMemo(() => {
    const isLeaf = hierarchyLevel === 'artifactName' || hierarchyLevel === 'templateName';

    if (hierarchyLevel === 'items') return columns;

    return [
      {
        key: 'name',
        name:
          hierarchyLevel === 'documentCategory' ? 'DOCUMENT CATEGORY'
            : hierarchyLevel === 'group' ? 'GROUP'
              : hierarchyLevel === 'subGroup' ? 'SUB-GROUP'
                : hierarchyLevel === 'artifactName' ? 'ARTIFACT NAME / DOCUMENT'
                  : 'TEMPLATE NAME',
        fieldName: 'name',
        minWidth: 350,
        maxWidth: 620,
        isSortingRequired: true,
        onRender: (item: any) => (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', width: '100%' }}
          >
            {/* Clickable folder/doc area */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer', minWidth: 0 }}
              onClick={() => onInvokeHierarchyItem(item)}
            >
              {isLeaf ? (
                <FontAwesomeIcon icon={getDocIcon(item.name)} style={{ fontSize: 18, color: getDocIconColor(item.name), flexShrink: 0 }} />
              ) : (
                <FontAwesomeIcon icon={faFolder} style={{ fontSize: 20, color: '#FFA000', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: '#1300a6', cursor: 'pointer' }}>{item.name}</span>
                {item.count !== undefined && (
                  <span style={{ marginLeft: 10, fontSize: 12, color: '#888' }}>
                    ({item.count} {item.count === 1 ? 'record' : 'records'})
                  </span>
                )}
              </div>
              {!isLeaf && <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 13, color: '#bbb', flexShrink: 0 }} />}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {isLeaf && (
                <TooltipHost content="Preview">
                  <span
                    style={{ padding: '4px 7px', borderRadius: 4, cursor: 'pointer', color: '#1300a6', fontSize: 13 }}
                    onClick={() => setViewPanelItem(item)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </span>
                </TooltipHost>
              )}
              <TooltipHost content="Rename">
                <span
                  style={{ padding: '4px 7px', borderRadius: 4, cursor: 'pointer', color: '#0066cc', fontSize: 13 }}
                  onClick={() => setRenameDialog({
                    open: true,
                    level: levelToField(hierarchyLevel),
                    oldValue: item.name,
                    newValue: item.name,
                    path: { ...hierarchyPath }
                  })}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </span>
              </TooltipHost>
              <TooltipHost content="Delete">
                <span
                  style={{ padding: '4px 7px', borderRadius: 4, cursor: 'pointer', color: '#d32f2f', fontSize: 13 }}
                  onClick={() => setNodeDeleteDialog({
                    open: true,
                    level: levelToField(hierarchyLevel),
                    nodeValue: item.name,
                    path: { ...hierarchyPath },
                    count: getNodeCount(hierarchyLevel, item.name)
                  })}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
              </TooltipHost>
            </div>
          </div>
        )
      }
    ];
  }, [hierarchyLevel, columns, onInvokeHierarchyItem, hierarchyPath, categories]);



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
                className="btn btn-primary"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  if (hierarchyLevel === 'items') {
                    props.manageComponentView({
                      currentComponentName: ComponentNameEnum.AddCategory,
                      componentProps: { parentId: undefined }
                    });
                  } else {
                    const labelMap: Record<string, string> = {
                      documentCategory: 'Document Category',
                      group: 'Group',
                      subGroup: 'Sub Group',
                      artifactName: 'Artifact / Document Name',
                      templateName: 'Template Name'
                    };
                    setQuickAddDialog({
                      open: true,
                      level: levelToField(hierarchyLevel),
                      label: labelMap[hierarchyLevel] || 'Name',
                      value: '',
                      linkedTemplate: ''
                    });
                  }
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
                {hierarchyLevel === 'documentCategory' ? 'Add Document Category'
                  : hierarchyLevel === 'group' ? 'Add Group'
                    : hierarchyLevel === 'subGroup' ? 'Add Sub Group'
                      : hierarchyLevel === 'artifactName' ? 'Add Artifact'
                        : hierarchyLevel === 'templateName' ? 'Add Template'
                          : 'Add Category'}
              </PrimaryButton>
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

      {/* ===== Quick Add Dialog ===== */}
      {quickAddDialog.open && (
        <Panel
          isOpen={quickAddDialog.open}
          onDismiss={() => setQuickAddDialog(prev => ({ ...prev, open: false, value: '', linkedTemplate: '' }))}
          type={PanelType.medium}
          headerText={`Add ${quickAddDialog.label}`}
          closeButtonAriaLabel="Close"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <Label style={{ fontWeight: 600 }}>{quickAddDialog.label} Name <span style={{ color: 'red' }}>*</span></Label>
              <TextField
                placeholder={`Enter ${quickAddDialog.label} name`}
                value={quickAddDialog.value}
                onChange={(_e, v) => setQuickAddDialog(prev => ({ ...prev, value: v || '' }))}
                autoFocus
              />
            </div>
            {(quickAddDialog.level === 'artifactName' || quickAddDialog.level === 'templateName') && (
              <div style={{ marginBottom: 16 }}>
                <Label style={{ fontWeight: 600 }}>Linked Template (Optional)</Label>
                <ReactDropdown
                  name="linkedTemplate"
                  options={templateNameOptions.filter(o => o.value !== '')}
                  defaultOption={null}
                  placeholder="-- Select a template --"
                  onChange={(opt) => setQuickAddDialog(prev => ({ ...prev, linkedTemplate: opt?.value as string || '' }))}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={true}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <PrimaryButton
                className="btn btn-primary"
                disabled={isLoading || !quickAddDialog.value.trim()}
                onClick={async () => {
                  const ok = await handleAddNode(
                    quickAddDialog.level,
                    quickAddDialog.value,
                    { ...hierarchyPath },
                    quickAddDialog.linkedTemplate || undefined
                  );
                  if (ok) setQuickAddDialog(prev => ({ ...prev, open: false, value: '', linkedTemplate: '' }));
                }}
              >
                <FontAwesomeIcon icon={faSave} style={{ marginRight: 6 }} />
                {isLoading ? 'Saving...' : 'Save'}
              </PrimaryButton>
              <DefaultButton
                className="btn btn-danger"
                onClick={() => setQuickAddDialog(prev => ({ ...prev, open: false, value: '', linkedTemplate: '' }))}
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 6 }} />
                Cancel
              </DefaultButton>
            </div>
          </div>
        </Panel>
      )}

      {/* ===== Rename Dialog ===== */}
      {renameDialog.open && (
        <Panel
          isOpen={renameDialog.open}
          onDismiss={() => setRenameDialog(prev => ({ ...prev, open: false }))}
          type={PanelType.medium}
          headerText={`Rename: ${renameDialog.oldValue}`}
          closeButtonAriaLabel="Close"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <Label style={{ fontWeight: 600 }}>New Name <span style={{ color: 'red' }}>*</span></Label>
              <TextField
                value={renameDialog.newValue}
                onChange={(_e, v) => setRenameDialog(prev => ({ ...prev, newValue: v || '' }))}
                autoFocus
              />
            </div>
            <div style={{ padding: '10px 12px', background: '#fff8e1', borderRadius: 4, border: '1px solid #ffe082', fontSize: 13, color: '#795548', marginBottom: 16 }}>
              Renaming will update all records under this folder. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <PrimaryButton
                className="btn btn-primary"
                disabled={isLoading || !renameDialog.newValue.trim() || renameDialog.newValue === renameDialog.oldValue}
                onClick={async () => {
                  const ok = await handleRenameNode(
                    renameDialog.level, renameDialog.oldValue, renameDialog.newValue, renameDialog.path
                  );
                  if (ok) setRenameDialog(prev => ({ ...prev, open: false }));
                }}
              >
                <FontAwesomeIcon icon={faSave} style={{ marginRight: 6 }} />
                {isLoading ? 'Saving...' : 'Rename'}
              </PrimaryButton>
              <DefaultButton className="btn btn-danger" onClick={() => setRenameDialog(prev => ({ ...prev, open: false }))}>
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 6 }} />
                Cancel
              </DefaultButton>
            </div>
          </div>
        </Panel>
      )}

      {/* ===== Node Delete Confirmation ===== */}
      <CustomModal
        isModalOpenProps={nodeDeleteDialog.open}
        setModalpopUpFalse={() => setNodeDeleteDialog(prev => ({ ...prev, open: false }))}
        onClose={() => setNodeDeleteDialog(prev => ({ ...prev, open: false }))}
        subject="Confirm Delete"
        message={
          <p>
            Are you sure you want to delete <strong>"{nodeDeleteDialog.nodeValue}"</strong>?
            This will delete <strong>{nodeDeleteDialog.count} record(s)</strong> under this folder. This action cannot be undone.
          </p>
        }
        yesButtonText="Delete"
        closeButtonText="Cancel"
        onClickOfYes={async () => {
          setNodeDeleteDialog(prev => ({ ...prev, open: false }));
          await handleDeleteNode(nodeDeleteDialog.level, nodeDeleteDialog.nodeValue, nodeDeleteDialog.path);
        }}
      />

      {/* ===== View / Preview Panel ===== */}
      <Panel
        isOpen={!!viewPanelItem}
        onDismiss={() => setViewPanelItem(null)}
        type={PanelType.extraLarge}
        headerText={viewPanelItem ? `Preview: ${viewPanelItem.name}` : 'Preview'}
        closeButtonAriaLabel="Close"
        isLightDismiss
      >
        {viewPanelItem && (() => {
          const fullCat = categories.find(c =>
            (c.artifactName || '').trim() === (viewPanelItem.name || '').trim() ||
            (c.templateName || '').trim() === (viewPanelItem.name || '').trim() ||
            c.id === viewPanelItem.id
          );
          const fileRef: string = (viewPanelItem.fileRef || viewPanelItem.serverRelativeUrl || fullCat?.['fileRef'] || '');
          const webUrl = context?.pageContext?.web?.absoluteUrl || '';
          const fileExt = fileRef.split('.').pop()?.toLowerCase() || '';
          const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf'].indexOf(fileExt) >= 0;
          const embedUrl = fileRef
            ? (isOffice
              ? `${webUrl}/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(fileRef)}&action=embedview`
              : (viewPanelItem.serverRedirectedEmbedUrl || (window.location.origin + fileRef)))
            : '';

          return (
            <div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, padding: '12px 0', borderBottom: '1px solid #eee' }}>
                {fullCat?.documentCategory && <div><span style={{ color: '#888', fontSize: 12 }}>Document Category</span><div style={{ fontWeight: 600, fontSize: 13 }}>{fullCat.documentCategory}</div></div>}
                {fullCat?.group && <div><span style={{ color: '#888', fontSize: 12 }}>Group</span><div style={{ fontWeight: 600, fontSize: 13 }}>{fullCat.group}</div></div>}
                {fullCat?.subGroup && <div><span style={{ color: '#888', fontSize: 12 }}>Sub Group</span><div style={{ fontWeight: 600, fontSize: 13 }}>{fullCat.subGroup}</div></div>}
                {fullCat?.artifactName && <div><span style={{ color: '#888', fontSize: 12 }}>Artifact Name</span><div style={{ fontWeight: 600, fontSize: 13 }}>{fullCat.artifactName}</div></div>}
                {fullCat?.templateName && <div><span style={{ color: '#888', fontSize: 12 }}>Template</span><div style={{ fontWeight: 600, fontSize: 13 }}>{fullCat.templateName}</div></div>}
                {fullCat?.status && <div><span style={{ color: '#888', fontSize: 12 }}>Status</span><div><StatusBadge status={(fullCat.status || 'active').toLowerCase()} size="small" /></div></div>}
              </div>
              {embedUrl ? (
                <iframe
                  title={viewPanelItem.name}
                  src={embedUrl}
                  style={{ width: '100%', height: '75vh', border: '1px solid #e5e5e5', borderRadius: 4 }}
                />
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: 6 }}>
                  <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: 40, color: '#ccc', marginBottom: 12, display: 'block' }} />
                  <p>No file preview available for this item.</p>
                  <p style={{ fontSize: 12 }}>If a document exists, it will appear here once a file reference is linked.</p>
                </div>
              )}
            </div>
          );
        })()}
      </Panel>

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
