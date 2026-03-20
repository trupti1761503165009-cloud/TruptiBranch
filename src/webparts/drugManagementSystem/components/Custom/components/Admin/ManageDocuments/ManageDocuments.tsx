import * as React from 'react';
import type { CTDFolder, Document } from '../../../types';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';

import { TextField } from '@fluentui/react/lib/TextField';

import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { getFileTypeIcon } from '../../../../Common/utils';
import { Link } from '@fluentui/react/lib/Link';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import '../ManageDocuments.css';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { ManageDocumentsData, type DateFilter } from './ManageDocumentsData';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { CustomModal } from '../../../../Common/CustomModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronRight, faClockRotateLeft, faDownload, faEye, faFileExport, faFolder, faFolderOpen, faPenToSquare, faPlus, faTrashCan, faFileLines, faClock, faCheckDouble, faFileSignature, faArrowsRotate, faArrowUpRightFromSquare, faPaperPlane, faXmark, faCheck, faComments } from '@fortawesome/free-solid-svg-icons';
import { CreateDocumentPage } from '../CreateDocumentPage/CreateDocumentPage';
import { Loader } from '../../../../Common/Loader/Loader';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { FileIconHelper } from '../../../utils/fileIconHelper';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';
import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { IColumn, Panel, PanelType, Pivot, PivotItem } from '@fluentui/react';
import { Breadcrumb as CustomBreadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const ManageDocuments: React.FC<any> = (props) => {
  const {
    drugs,
    documents,
    selectedDrugId,
    categories,
    filteredDocuments,
    activeTab,
    setActiveTab,
    subTab,
    setSubTab,
    ctdFolders,
    selectedIds,
    currentPage,
    searchTerm,
    isDocPanelOpen,
    isAddModalOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    isSignatureModalOpen,
    viewingDocument,
    editingDocument,
    versionHistory,
    compareVersion,
    editForm,
    signature,
    canApprove,
    canEdit,
    canDelete,
    ctdStructure,
    isStructureDisabled,
    filters,
    itemsPerPage,
    errorMessage,
    successMessage,
    isLoading,
    reviewerComments,
    reviewerCommentError,

    setViewingDocument,
    setSelectedIds,
    setCurrentPage,
    setSearchTerm,
    setIsDocPanelOpen,
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsDeleteDialogOpen,
    setIsSignatureModalOpen,
    setCompareVersion,
    setEditForm,
    setSignature,
    setEditingDocument,
    setFilters,
    setReviewerComments,
    setReviewerCommentError,
    setSelectedDrugId,
    isAdmin,
    tmfFolders,
    gmpFolders,
    showDeleted,
    setShowDeleted,

    handleStructureChange,
    handleViewDocument,
    openDocumentInReviewMode,
    handleApprove,
    handleFinalApprove,
    handleReject,
    confirmReject,
    handleBulkDelete,
    handleExport,
    loadData,
    initiateAdobeSign,
    openEditModal,
    handleSaveEdit,
    handleCompareVersion,
    resetFilters,
    handleSubmitForReview,
    getWorkflowSteps,
    canCreate,
    rejectReason,
    isRejectModalOpen,
    setRejectReason,
    setIsRejectModalOpen,
  } = ManageDocumentsData(props);

  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const spContext = appGlobalState?.context;
  const currentUser = appGlobalState?.currentUser;

  // Helper: check author identity for any document object
  const isAuthorForDoc = React.useCallback((doc: Document | null | undefined): boolean => {
    if (!doc || !currentUser) return false;
    const userId = Number((currentUser as any)?.userId || (currentUser as any)?.Id || (currentUser as any)?.id || 0);
    const userEmail = String(currentUser?.email || '').toLowerCase().trim();
    const displayName = String((currentUser as any)?.displayName || '').toLowerCase().trim();
    const docAuthor = String(doc.author || '').toLowerCase().trim();
    const docSentBy = String((doc as any).sentBy || '').toLowerCase().trim();
    return (
      (userId > 0 && doc.authorId === userId) ||
      (userId > 0 && (doc as any).sentById === userId) ||
      (userEmail !== '' && (docAuthor.includes(userEmail) || docSentBy.includes(userEmail))) ||
      (displayName !== '' && (docAuthor === displayName || docSentBy === displayName))
    );
  }, [currentUser]);

  // Per-document permission: is current user the document author?
  const isCurrentUserAuthor = React.useMemo(
    () => isAuthorForDoc(viewingDocument),
    [viewingDocument, isAuthorForDoc]
  );

  // Per-document permission: is current user the assigned approver?
  const isCurrentUserApprover = React.useMemo(() => {
    if (!viewingDocument || !currentUser) return false;
    const userId = Number((currentUser as any)?.userId || (currentUser as any)?.Id || (currentUser as any)?.id || 0);
    const userEmail = String(currentUser?.email || '').toLowerCase().trim();
    const displayName = String((currentUser as any)?.displayName || '').toLowerCase().trim();
    const loginName = String((currentUser as any)?.loginName || '').toLowerCase();
    const docApprover = String(viewingDocument.approver || '').toLowerCase().trim();
    const approverLoginName = String((viewingDocument as any).approverLoginName || '').toLowerCase();
    const isDocLevelApprover =
      // 1. SharePoint user ID match (most reliable)
      (userId > 0 && viewingDocument.approverId === userId) ||
      // 2. Email match against approver display or login name
      (userEmail !== '' && (docApprover.includes(userEmail) || approverLoginName === userEmail)) ||
      // 3. Display name exact match
      (displayName !== '' && docApprover === displayName) ||
      // 4. loginName claim ends-with match (handles i:0#.f|membership|user@domain format)
      (loginName !== '' && approverLoginName !== '' && loginName.endsWith(approverLoginName));
    // Allow if: explicitly assigned as approver on this document (regardless of global role)
    // OR: has global canApprove role and no specific approver is assigned
    return isDocLevelApprover || (canApprove && !viewingDocument.approverId);
  }, [viewingDocument, currentUser, canApprove]);

  // REQ 10: Word embed URL
  // Edit mode:  author on Draft/Rejected  OR  approver on Pending Approval
  // View mode:  author on Pending Approval (doc is under review), and all other cases
  const getWordEmbedUrl = (doc: Document, forceViewMode = false): string => {
    if (!spContext) return '';
    const authorCanEdit   = isCurrentUserAuthor   && (doc.status === 'Draft' || doc.status === 'Rejected');
    const approverCanEdit = isCurrentUserApprover && doc.status === 'Pending Approval';
    const canEditInline   = !forceViewMode && (authorCanEdit || approverCanEdit);
    const action = canEditInline ? 'edit' : 'embedview';

    // Use Doc.aspx with server-relative file URL
    const fileRef =  doc.fileRef || '';
    if (fileRef) {
      const serverRelative = fileRef.startsWith('http')
        ? new URL(fileRef).pathname
        : fileRef;
      const encodedUrl = encodeURIComponent(serverRelative);
      return `${spContext.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${encodedUrl}&action=${action}`;
    }

    // Last resort: Doc.aspx with UniqueId
    if (doc.uniqueId) {
      const guid = doc.uniqueId.replace(/^\{|\}$/g, '');
      return `${spContext.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=%7B${guid}%7D&action=${action}`;
    }
    return '';
  };

  // REQ 4: Confirmation dialog state for Submit and Approve
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = React.useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = React.useState(false);
  // Modal state for Comments and Version History
  const [isCommentsModalOpen, setIsCommentsModalOpen] = React.useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

  const hideFolderSidebar: boolean = !!(props.hideFolderSidebar);
  const hideAddButton: boolean = !!(props.hideAddButton);

  const isVisibleCrud = React.useRef(true);
  const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState(false);
  const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState(false);
  const [isSelectedData, setisSelectedData] = React.useState(false);
  const [updateItem, setUpdateItem] = React.useState<any[]>([]);
  // Inner view-mode for myDocuments / assignedToMe — does NOT change activeTab
  const [innerMode, setInnerMode] = React.useState<'folder' | 'document'>(hideFolderSidebar ? 'document' : 'folder');

  // If hideFolderSidebar toggled on, force document inner mode
  React.useEffect(() => {
    if (hideFolderSidebar) setInnerMode('document');
  }, [hideFolderSidebar]);

  const _onItemSelected = (item: any): void => {
    setSelectedIds(item.map((i: any) => i.id));
    if (item.length > 0) {
        if (item.length == 1) {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(true);
        } else {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(false);
        }
        setisDisplayEDbtn(true);
    } else {
        setisSelectedData(false);
        setUpdateItem([]);
        setisDisplayEDbtn(false);
    }
  };

  const onclickEdit = () => {
    if (updateItem.length > 0) {
      openEditModal(updateItem[0]);
    }
  };

  const onclickconfirmdelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const selectedDrug = React.useMemo(
    () => (selectedDrugId !== null ? drugs.find(d => d.id === selectedDrugId) : undefined),
    [drugs, selectedDrugId]
  );

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

  const categoryOptions: IReactDropOptionProps[] = React.useMemo(
    () => categories.map(cat => ({ label: cat.name, value: cat.name })),
    [categories]
  );
  const editCategoryOptions: IReactDropOptionProps[] = React.useMemo(
    () => categories.map(cat => ({ label: cat.name, value: cat.id })),
    [categories]
  );

  const statusOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'Draft', value: 'Draft' },
      { label: 'Pending Approval', value: 'Pending Approval' },
      { label: 'Pending for Signature', value: 'Pending for Signature' },
      { label: 'Signed', value: 'Signed' },
      { label: 'Final', value: 'Final' },
      { label: 'In Review', value: 'In Review' },
      { label: 'Revision', value: 'Revision' },
      { label: 'Initiate for Signature', value: 'Initiate for Signature' },
      { label: 'Approved', value: 'Approved' },
      { label: 'Rejected', value: 'Rejected' }
    ],
    []
  );

  const dateOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'Today', value: 'today' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Last 7 Days', value: 'last7days' },
      { label: 'Last 30 Days', value: 'last30days' },
      { label: 'Last Month', value: 'lastmonth' },
      { label: 'This Month', value: 'thismonth' },
      { label: 'Year To Date', value: 'yeartodate' },
      { label: 'Custom Date Range', value: 'daterange' }
    ],
    []
  );

  const structureOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'eCTD', value: 'ectd' },
      { label: 'GMP', value: 'gmp' },
      { label: 'TMF', value: 'tmf' }
    ],
    []
  );

  const categoryDefault = React.useMemo(
    () => categoryOptions.find(o => o.value === filters.category),
    [categoryOptions, filters.category]
  );
  const statusDefault = React.useMemo(
    () => statusOptions.find(o => o.value === filters.status),
    [statusOptions, filters.status]
  );
  const dateDefault = React.useMemo(
    () => dateOptions.find(o => o.value === filters.dateFilter),
    [dateOptions, filters.dateFilter]
  );
  const structureDefault = React.useMemo(
    () => structureOptions.find(o => o.value === ctdStructure) ?? structureOptions[0],
    [structureOptions, ctdStructure]
  );

  const folderLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    const traverse = (nodes: CTDFolder[]) => {
      nodes.forEach((node: any) => {
        if (node.id) map.set(String(node.id), node.name);
        if (node.folderId) map.set(String(node.folderId), node.name);
        if (node.children) traverse(node.children);
      });
    };
    traverse(ctdFolders);
    traverse(tmfFolders);
    traverse(gmpFolders);
    return map;
  }, [ctdFolders, tmfFolders, gmpFolders]);

  // Summary stats calculations
  const totalDocCount = filteredDocuments.length;
  const pendingCount = filteredDocuments.filter(d => d.status === 'Pending Approval' || d.status === 'In Review').length;
  const draftCount = filteredDocuments.filter(d => d.status === 'Draft' || d.status === 'Revision').length;
  const finalCount = filteredDocuments.filter(d => d.status === 'Final' || d.status === 'Signed' || d.status === 'Approved').length;

  // Folder-wise drilldown (grid + breadcrumb) after Drug selection
  const [folderTrail, setFolderTrail] = React.useState<string[]>([]);
  const [folderSearchTerm, setFolderSearchTerm] = React.useState('');
  const [isFolderLoading, setIsFolderLoading] = React.useState(false);

  const navigateToFolder = React.useCallback((folderId: string) => {
    setIsFolderLoading(true);
    setFolderTrail(prev => [...prev, folderId]);
    setCurrentPage(1);
    setFolderSearchTerm('');
    setTimeout(() => setIsFolderLoading(false), 400);
  }, [setCurrentPage]);

  React.useEffect(() => {
    // Reset folder navigation when changing drug
    setFolderTrail([]);
    setFolderSearchTerm('');
    setIsFolderLoading(false);
  }, [selectedDrugId]);

  const findFolderNode = React.useCallback((nodes: CTDFolder[], key: any): CTDFolder | undefined => {
    const keyStr = String(key);
    for (const n of nodes) {
      if (String(n.id) === keyStr || String(n.folderId) === keyStr) return n;
      if (n.children?.length) {
        const hit = findFolderNode(n.children, key);
        if (hit) return hit;
      }
    }
    return undefined;
  }, []);

  const activeFolderTree = React.useMemo(() => {
    if (ctdStructure === 'ectd') return ctdFolders;
    if (ctdStructure === 'gmp') return gmpFolders;
    if (ctdStructure === 'tmf' || ctdStructure === 'dossier') return tmfFolders;
    return ctdFolders;
  }, [ctdFolders, tmfFolders, gmpFolders, ctdStructure]);

  const currentFolderNode = React.useMemo(
    () => (folderTrail.length ? findFolderNode(activeFolderTree, folderTrail[folderTrail.length - 1]) : undefined),
    [activeFolderTree, folderTrail, findFolderNode]
  );

  // Only show drug folders that have at least one document (any status).
  // Uses the unfiltered `documents` list so search/status filters don't hide drug folders.
  // Strategy 1: match against the loaded drugs list (Number() cast handles string/number mismatch).
  // Strategy 2: if the drugs list is empty or yields no matches, derive drug entries directly
  //             from the documents array — this handles cases where DrugsDatabase list fails
  //             to load (wrong name, permissions) without breaking the folder view.
  const drugsWithDocs = React.useMemo(() => {
    const fromList = (drugs || []).filter(drug =>
      (documents || []).some(d => d.drugId != null && Number(d.drugId) === Number(drug.id))
    );
    if (fromList.length > 0) return fromList;

    // Fallback: build unique drug entries from documents themselves
    const seen = new Map<number, { id: number; name: string }>();
    for (const doc of (documents || [])) {
      const id = Number(doc.drugId);
      if (id > 0 && doc.drugName && !seen.has(id)) {
        seen.set(id, { id, name: doc.drugName });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [drugs, documents]);

  const normalized = (v?: string | number | null) => (v != null ? String(v) : '');
  const getDescendantKeys = React.useCallback((node: CTDFolder): string[] => {
    const keys: string[] = [];
    if (node.id != null) keys.push(String(node.id));
    if (node.folderId) keys.push(String(node.folderId));
    (node.children || []).forEach((c) => keys.push(...getDescendantKeys(c)));
    return keys;
  }, []);

  const folderHasDocuments = React.useCallback((node: CTDFolder, docs: Document[]): boolean => {
    const descendantKeys = new Set(getDescendantKeys(node));
    return docs.some(
      (d) =>
        (normalized(d.ctdFolder) && descendantKeys.has(normalized(d.ctdFolder))) ||
        (normalized(d.ctdModule) && descendantKeys.has(normalized(d.ctdModule))) ||
        (normalized(d.submodule) && descendantKeys.has(normalized(d.submodule)))
    );
  }, [getDescendantKeys]);

  const allFolderChildren = React.useMemo(() => {
    if (!folderTrail.length) return activeFolderTree;
    return currentFolderNode?.children || [];
  }, [activeFolderTree, currentFolderNode, folderTrail.length]);

  const currentFolderChildren = React.useMemo(() => {
    // Inside a drug view (Drug Structure tab): show ALL CTD/GMP/TMF folders so the full
    // hierarchy is visible even when some modules have no documents yet.
    // Outside a drug view: only show folders that have at least one document.
    if (selectedDrugId !== null) return allFolderChildren;
    return allFolderChildren.filter((f) => folderHasDocuments(f, filteredDocuments));
  }, [allFolderChildren, filteredDocuments, folderHasDocuments, selectedDrugId]);

  const isShowingFolders = currentFolderChildren.length > 0;
  const currentFolderId = folderTrail.length ? folderTrail[folderTrail.length - 1] : undefined;

  const docsForCurrentFolder = React.useMemo(() => {
    if (!currentFolderNode) return filteredDocuments;
    const folderKeys = new Set<string>();
    if (currentFolderNode.id != null) folderKeys.add(String(currentFolderNode.id));
    if (currentFolderNode.folderId) folderKeys.add(String(currentFolderNode.folderId));
    return filteredDocuments.filter((d) =>
      (normalized(d.ctdFolder) && folderKeys.has(normalized(d.ctdFolder))) ||
      (normalized(d.ctdModule) && folderKeys.has(normalized(d.ctdModule))) ||
      (normalized(d.submodule) && folderKeys.has(normalized(d.submodule)))
    );
  }, [currentFolderNode, filteredDocuments]);

  React.useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  const folderTotalPages = React.useMemo(
    () => Math.ceil(docsForCurrentFolder.length / itemsPerPage),
    [docsForCurrentFolder.length, itemsPerPage]
  );

  const folderCurrentPageData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return docsForCurrentFolder.slice(startIndex, endIndex);
  }, [currentPage, docsForCurrentFolder, itemsPerPage]);

  const folderGridItems = React.useMemo(() => {
    return currentFolderChildren.map((f) => {
      const descendantKeys = new Set(getDescendantKeys(f));
      const count = filteredDocuments.filter(
        (d) =>
          (normalized(d.ctdFolder) && descendantKeys.has(normalized(d.ctdFolder))) ||
          (normalized(d.ctdModule) && descendantKeys.has(normalized(d.ctdModule))) ||
          (normalized(d.submodule) && descendantKeys.has(normalized(d.submodule)))
      ).length;
      return { id: f.id, name: f.name, count };
    });
  }, [currentFolderChildren, filteredDocuments, getDescendantKeys]);

  const folderColumns: any[] = React.useMemo(
    () => [
      {
        key: 'name',
        name: 'FOLDER',
        fieldName: 'name',
        minWidth: 260,
        maxWidth: 520,
        isSortingRequired: true,
        onRender: (item: any) => (
          <div className="doc-name-cell">
            <img
              className="doc-icon"
              src={getFileTypeIcon('folder')}
              alt=""
              style={{ width: 16, height: 16, marginRight: 8 }}
            />
            <span>{item.name}</span>
          </div>
        )
      },
      { key: 'count', name: 'DOCUMENTS', fieldName: 'count', minWidth: 110, maxWidth: 140, isSortingRequired: true }
    ],
    []
  );

  const documentColumns: any[] = [
    {
      key: 'name',
      name: 'DOCUMENT NAME',
      fieldName: 'name',
      minWidth: 220,
      maxWidth: 340,
      isSortingRequired: true,
      onRender: (doc: Document) => {
        const iconInfo = FileIconHelper.getFileIcon(doc.fileName || doc.name);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 16,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: iconInfo.bgColor,
              borderRadius: 4,
              color: iconInfo.color
            }}>
              <FontAwesomeIcon icon={iconInfo.icon} />
            </div>
            <span>{doc.name}</span>
          </div>
        );
      }
    },
    {
      key: 'drugName',
      name: 'DRUG',
      fieldName: 'drugName',
      minWidth: 140,
      maxWidth: 200,
      isSortingRequired: true,
      onRender: (doc: Document) => (
        <span style={{ color: '#555' }}>{doc.drugName || '—'}</span>
      )
    },
    {
      key: 'category',
      name: 'CATEGORY',
      fieldName: 'category',
      minWidth: 140,
      maxWidth: 220,
      isSortingRequired: true
    },
    {
      key: 'mappingType',
      name: 'MAPPING TYPE',
      fieldName: 'mappingType',
      minWidth: 110,
      maxWidth: 150,
      isSortingRequired: true,
      onRender: (doc: Document) => <span>{doc.mappingType || '—'}</span>
    },
    {
      key: 'ectdSection',
      name: 'eCTD SECTION',
      fieldName: 'ectdSection',
      minWidth: 130,
      maxWidth: 200,
      isSortingRequired: true,
      onRender: (doc: Document) => <span>{doc.ectdSection || '—'}</span>
    },
    {
      key: 'gmpModel',
      name: 'GMP MODEL',
      fieldName: 'gmpModel',
      minWidth: 120,
      maxWidth: 180,
      isSortingRequired: true,
      onRender: (doc: Document) => <span>{doc.gmpModel || '—'}</span>
    },
    {
      key: 'tmfZone',
      name: 'TMF ZONE',
      fieldName: 'tmfZone',
      minWidth: 110,
      maxWidth: 170,
      isSortingRequired: true,
      onRender: (doc: Document) => <span>{doc.tmfZone || '—'}</span>
    },
    {
      key: 'status',
      name: 'STATUS',
      fieldName: 'status',
      minWidth: 150,
      maxWidth: 210,
      isSortingRequired: true,
      onRender: (doc: Document) => {
        const s = doc.status || 'Draft';
        const cls = s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return <span className={`status-badge status-${cls}`}>{s}</span>;
      }
    },
    {
      key: 'version',
      name: 'VERSION',
      fieldName: 'version',
      minWidth: 90,
      maxWidth: 120,
      isSortingRequired: true,
      onRender: (doc: Document) => <span>v{doc.version || 1}</span>
    },
    {
      key: 'lastModified',
      name: 'LAST MODIFIED',
      fieldName: 'lastModified',
      minWidth: 140,
      maxWidth: 180,
      isSortingRequired: true
    },
    {
      key: 'actions',
      name: 'ACTIONS',
      minWidth: 200,
      maxWidth: 280,
      onRender: (doc: Document) => {
        const userEmail = String(currentUser?.email || currentUser?.loginName || '').toLowerCase();
        const userId = currentUser?.id || 0;
        const displayName = String((currentUser as any)?.displayName || '').toLowerCase().trim();
        const docAuthor = String(doc.author || '').toLowerCase().trim();
        const docSentBy = String((doc as any).sentBy || '').toLowerCase().trim();
        const docApprover = String(doc.approver || '').toLowerCase().trim();
        const isRowAuthor =
          (userId > 0 && doc.authorId === userId) ||
          (userId > 0 && (doc as any).sentById === userId) ||
          (userEmail !== '' && (docAuthor.includes(userEmail) || docSentBy.includes(userEmail))) ||
          (displayName !== '' && (docAuthor === displayName || docSentBy === displayName));
        const isRowApprover = canApprove ||
          activeTab === 'assignedToMe' ||
          (userId > 0 && doc.approverId === userId) ||
          (userEmail !== '' && docApprover.includes(userEmail)) ||
          (displayName !== '' && docApprover === displayName);
        // Suppress all workflow actions for deleted/hidden documents
        const isDocActive = !(doc as any).isDeleted && !(doc as any).isHidden;
        // Admin can perform any workflow action; otherwise check role
        const canSubmitRow  = isDocActive && (isAdmin || isRowAuthor) && (doc.status === 'Draft' || doc.status === 'Rejected');
        const canApproveRow = isDocActive && (isAdmin || isRowApprover) && doc.status === 'Pending Approval';
        const canRejectRow  = isDocActive && (isAdmin || isRowApprover) && doc.status === 'Pending Approval';
        const canInitiateSignatureRow = isDocActive && doc.status === 'Approved' && (isAdmin || isRowAuthor || isRowApprover);
        const canSignRow = isDocActive && doc.status === 'Pending for Signature';
        return (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'nowrap' }}>
            <TooltipHost content="View Details">
              <Link onClick={() => void handleViewDocument(doc)} style={{ fontSize: 16, color: '#1E88E5' }}>
                <FontAwesomeIcon icon={faEye} />
              </Link>
            </TooltipHost>
            {doc.sharePointUrl && (
              <TooltipHost content="Open Document">
                <Link href={doc.sharePointUrl} target="_blank" style={{ fontSize: 16, color: '#43A047' }}>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </Link>
              </TooltipHost>
            )}
            {canSubmitRow && (
              <TooltipHost content={doc.status === 'Rejected' ? 'Resubmit for Approval' : 'Submit for Approval'}>
                <Link
                  onClick={() => { setViewingDocument(doc); setIsSubmitConfirmOpen(true); }}
                  style={{ fontSize: 16, color: doc.status === 'Rejected' ? '#F57C00' : '#1565C0' }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </Link>
              </TooltipHost>
            )}
            {canApproveRow && (
              <TooltipHost content="Approve">
                <Link
                  onClick={() => { setViewingDocument(doc); setIsApproveConfirmOpen(true); }}
                  style={{ fontSize: 16, color: '#2e7d32' }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </Link>
              </TooltipHost>
            )}
            {canRejectRow && (
              <TooltipHost content="Reject">
                <Link
                  onClick={() => { setViewingDocument(doc); handleReject(); }}
                  style={{ fontSize: 16, color: '#d32f2f' }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Link>
              </TooltipHost>
            )}
            {canInitiateSignatureRow && (
              <TooltipHost content="Initiate Signature">
                <Link
                  onClick={() => void handleViewDocument(doc)}
                  style={{ fontSize: 16, color: '#7B1FA2' }}
                >
                  <FontAwesomeIcon icon={faFileSignature} />
                </Link>
              </TooltipHost>
            )}
            {canSignRow && (
              <TooltipHost content="Sign Document">
                <Link
                  onClick={() => void handleViewDocument(doc)}
                  style={{ fontSize: 16, color: '#00796B' }}
                >
                  <FontAwesomeIcon icon={faFileSignature} />
                </Link>
              </TooltipHost>
            )}
            <TooltipHost content="Comments">
              <Link
                onClick={() => { void handleViewDocument(doc, false).then(() => setIsCommentsModalOpen(true)); }}
                style={{ fontSize: 16, color: '#1300a6' }}
              >
                <FontAwesomeIcon icon={faComments} />
              </Link>
            </TooltipHost>
            <TooltipHost content="Version History">
              <Link
                onClick={() => { void handleViewDocument(doc, false).then(() => setIsHistoryModalOpen(true)); }}
                style={{ fontSize: 16, color: '#546e7a' }}
              >
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </Link>
            </TooltipHost>
          </div>
        );
      }
    },
  ];

  const effectiveColumns = documentColumns;



  // DRUG SELECTED VIEW (inside a specific drug folder)
  return (
    <div className="documents-page pageContainer" data-testid="manage-documents-inner-view" style={{ paddingTop: 0 }}>
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
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>
        {activeTab === 'myDocuments' ? 'My Documents' : activeTab === 'assignedToMe' ? 'Assigned to Me' : 'Manage Documents'}
      </h1>

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
            title="Total Documents"
            value={totalDocCount}
            icon={faFileLines}
            color="blue"
          />
          <SummaryCard
            title="Pending Approval"
            value={pendingCount}
            icon={faClock}
            color="orange"
          />
          <SummaryCard
            title="Drafts"
            value={draftCount}
            icon={faPenToSquare}
            color="purple"
          />
          <SummaryCard
            title="Final / Signed"
            value={finalCount}
            icon={faCheckDouble}
            color="green"
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
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl">
                <ReactDropdown name="ctdStructure" options={structureOptions} defaultOption={structureDefault}
                  onChange={(opt) => handleStructureChange((opt?.value as 'ectd' | 'dossier' | 'gmp' | 'tmf') ?? 'ectd')}
                  isCloseMenuOnSelect={true} isSorted={false} isClearable={false} isDisabled={isStructureDisabled} />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl">
                <ReactDropdown name="category" options={categoryOptions} defaultOption={categoryDefault}
                  onChange={(opt) => setFilters({ ...filters, category: opt?.value ?? '' })}
                  isCloseMenuOnSelect={true} isSorted={true} isClearable={true} />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl">
                <ReactDropdown name="status" options={statusOptions} defaultOption={statusDefault}
                  onChange={(opt) => setFilters({ ...filters, status: opt?.value ?? 'All' })}
                  isCloseMenuOnSelect={true} isSorted={false} isClearable={true} />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl">
                <ReactDropdown name="dateFilter" options={dateOptions} defaultOption={dateDefault}
                  onChange={(opt) => setFilters({ ...filters, dateFilter: (opt?.value as DateFilter) ?? 'all', dateFrom: '', dateTo: '' })}
                  isCloseMenuOnSelect={true} isSorted={false} isClearable={true} />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ display: 'flex', alignItems: 'center', paddingTop: 1 }}>
              <DefaultButton
                text="Reset"
                onClick={() => { resetFilters(); }}
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
      <div className="customebreadcrumb" style={{ marginBottom: 16 }}>
        <CustomBreadcrumb
          items={[
            { label: 'Manage Documents', onClick: () => setSelectedDrugId(null), isActive: selectedDrugId === null && activeTab !== 'workspace' },
            ...(activeTab === 'workspace'
              ? [{ label: 'Document Folder', isActive: true }]
              : selectedDrugId !== null
                ? [{ label: selectedDrug?.name || 'Drug Folder', isActive: true }]
                : [])
          ]}
        />
      </div>

      {/* Primary Tabs: Drugs Folder | Document Folder — hidden when inside a drug or hideFolderSidebar */}
      {!hideFolderSidebar && selectedDrugId === null && (activeTab === 'all' || activeTab === 'workspace') && (
        <div style={{ marginBottom: 15 }}>
          <Pivot
            aria-label="Document Views"
            selectedKey={activeTab}
            onLinkClick={(item) => item?.props.itemKey && setActiveTab(item.props.itemKey as any)}
          >
            <PivotItem headerText="Drugs Folder" itemKey="all" />
            <PivotItem headerText="Document Folder" itemKey="workspace" />
          </Pivot>
        </div>
      )}

      {/* Sub-view selector for My Documents / Assigned to Me — hidden when hideFolderSidebar */}
      {!hideFolderSidebar && selectedDrugId === null && (activeTab === 'myDocuments' || activeTab === 'assignedToMe') && (
        <div style={{ marginBottom: 15 }}>
          <Pivot
            aria-label="View Mode"
            selectedKey={innerMode}
            onLinkClick={(item) => item?.props.itemKey && setInnerMode(item.props.itemKey as any)}
          >
            <PivotItem headerText="Drugs Folder" itemKey="folder" />
            <PivotItem headerText="Document Folder" itemKey="document" />
          </Pivot>
        </div>
      )}

      {/* Sub-Tabs: Folder Structure vs List View */}
      {selectedDrugId !== null && (
        <div style={{ marginBottom: 15 }}>
          <Pivot
            aria-label="Sub Views"
            selectedKey={subTab}
            onLinkClick={(item) => setSubTab(item?.props.itemKey as any)}
            styles={{ root: { marginBottom: 15, borderBottom: '1px solid #eee' } }}
          >
            <PivotItem headerText="DRUG Structure" itemKey="folder" itemIcon="FolderList" />
            <PivotItem headerText="Documents" itemKey="list" itemIcon="Documentation" />
          </Pivot>
        </div>
      )}

      {/* Folder Breadcrumb - compact inline trail for subfolder navigation */}
      {selectedDrug && subTab === 'folder' && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10, fontSize: 13 }}>
          <span
            onClick={() => { setIsFolderLoading(true); setFolderTrail([]); setTimeout(() => setIsFolderLoading(false), 300); }}
            style={{ cursor: 'pointer', color: '#1E88E5', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 14 }} />
            {selectedDrug.name}
          </span>
          {folderTrail.map((id, idx) => (
            <React.Fragment key={id}>
              <span style={{ color: '#bbb' }}>›</span>
              <span
                style={idx === folderTrail.length - 1
                  ? { color: '#333', fontWeight: 600 }
                  : { cursor: 'pointer', color: '#1E88E5' }}
                onClick={() => {
                  if (idx < folderTrail.length - 1) {
                    setIsFolderLoading(true);
                    setFolderTrail(folderTrail.slice(0, idx + 1));
                    setTimeout(() => setIsFolderLoading(false), 300);
                  }
                }}
              >
                {folderLabelMap.get(id) || id}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      {/* Main Content Area: Drugs Grid or Documents/Folders Grid */}
      <div className="boxCard">
        {isFolderLoading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 5 }}>
            <Loader />
          </div>
        )}
        {(activeTab === 'workspace' || ((activeTab === 'myDocuments' || activeTab === 'assignedToMe') && innerMode === 'document')) ? (
          <MemoizedDataGridComponent
            key="doc-folder-flat-list"
            items={filteredDocuments}
            columns={effectiveColumns}
            reRenderComponent={true}
            searchable={true}
            isPagination={true}
            CustomselectionMode={isVisibleCrud.current ? 2 : 0}
            onSelectedItem={_onItemSelected}
            onItemInvoked={(item?: any) => { if (item) void handleViewDocument(item as Document); }}
            isAddNew={true}
            addNewContent={
              <div className="dflex pb-1">
                {canCreate && !hideAddButton && (
                  <PrimaryButton
                    className="btn btn-primary"
                    text="Add Document"
                    onClick={() => props.manageComponentView({ currentComponentName: ComponentNameEnum.AddDocument })}
                  />
                )}
                <Link className="actionBtn iconSize btnRefresh ml-10" onClick={loadData}>
                  <TooltipHost content="Refresh Grid"><FontAwesomeIcon icon={faArrowsRotate} /></TooltipHost>
                </Link>
              </div>
            }
            addEDButton={
              isDisplayEDbtn && isVisibleCrud.current && (
                <div className="dflex">
                  {isDisplayEditButtonview && (
                    <Link className="actionBtn iconSize btnView" onClick={() => updateItem[0] && void handleViewDocument(updateItem[0])}>
                      <TooltipHost content="View"><FontAwesomeIcon icon={faEye} /></TooltipHost>
                    </Link>
                  )}
                  {canEdit && isDisplayEditButtonview && updateItem[0] && isAuthorForDoc(updateItem[0]) && (updateItem[0].status === 'Draft' || updateItem[0].status === 'Rejected') && (
                    <Link className="actionBtn iconSize btnEdit ml-10" onClick={onclickEdit}>
                      <TooltipHost content="Edit"><FontAwesomeIcon icon={faPenToSquare} /></TooltipHost>
                    </Link>
                  )}
                  {canDelete && (
                    <Link className="actionBtn iconSize btnDanger ml-10" onClick={onclickconfirmdelete}>
                      <TooltipHost content="Delete"><FontAwesomeIcon icon={faTrashCan} /></TooltipHost>
                    </Link>
                  )}
                </div>
              )
            }
          />
        ) : selectedDrugId === null ? (
          drugsWithDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <FontAwesomeIcon icon={faFolder} style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>No documents yet</p>
              <p style={{ fontSize: 13, marginBottom: 24 }}>No documents have been created for any drug. Add a document to see the drug folder structure here.</p>
              {canCreate && !hideAddButton && (
                <PrimaryButton
                  className="btn btn-primary"
                  text="Add Document"
                  onClick={() => props.manageComponentView({ currentComponentName: ComponentNameEnum.AddDocument, componentProps: {} })}
                />
              )}
            </div>
          ) : (
          <MemoizedDataGridComponent
            key="drug-selection-grid"
            items={drugsWithDocs}
            columns={[
              {
                key: 'name',
                name: 'DRUG FOLDER',
                fieldName: 'name',
                minWidth: 350,
                isSortingRequired: true,
                onRender: (drug: any) => {
                  const drugDocs = filteredDocuments.filter(d => d.drugId === drug.id);
                  return (
                    <div
                      className="folder-row-clickable"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}
                      onClick={() => setSelectedDrugId(drug.id)}
                    >
                      <FontAwesomeIcon icon={faFolder} style={{ fontSize: 22, color: '#FFA000' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{drug.name}</span>
                        <span style={{ marginLeft: 12, fontSize: 12, color: '#666' }}>({drugDocs.length} {drugDocs.length === 1 ? 'item' : 'items'})</span>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14, color: '#999' }} />
                    </div>
                  );
                }
              },
              {
                key: 'folderCount',
                name: 'DOCUMENT FOLDERS',
                fieldName: 'folderCount',
                minWidth: 160,
                onRender: (drug: any) => {
                  const drugDocs = filteredDocuments.filter(d => d.drugId === drug.id);
                  const folderCount = new Set(drugDocs.map(d => d.ctdFolder || d.ctdModule).filter(Boolean)).size;
                  return <span>{folderCount} Folders</span>;
                }
              },
              {
                key: 'category',
                name: 'CATEGORY',
                fieldName: 'category',
                minWidth: 150
              },
              {
                key: 'status',
                name: 'STATUS',
                fieldName: 'status',
                minWidth: 120,
                onRender: (drug: any) => <span className={`status-badge status-${drug.status?.toLowerCase() || 'active'}`}>{drug.status || 'Active'}</span>
              }
            ]}
            reRenderComponent={true}
            searchable={true}
            CustomselectionMode={isVisibleCrud.current ? 2 : 0}
            onSelectedItem={_onItemSelected}
            isAddNew={true}
            addNewContent={
              <div className="dflex pb-1">
                <Link className="btn-back-ml-4 dticon">
                    <TooltipHost content="Export options">
                      <DefaultButton
                        text="Export"
                        iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                        onClick={() => handleExport('excel')}
                        className="btn export-btn-primary"
                      />
                    </TooltipHost>
                  </Link>
                {canCreate && (
                    <TooltipHost content="Add New">
                      <PrimaryButton
                        className="btn btn-primary ml-10"
                        text="Add"
                        onClick={() => {
                          props.manageComponentView({
                            currentComponentName: ComponentNameEnum.AddDocument,
                            componentProps: { drugId: selectedDrugId }
                          });
                        }}
                      />
                    </TooltipHost>
                )}

                <Link
                  className="actionBtn iconSize btnRefresh ml-10"
                  onClick={loadData}
                >
                  <TooltipHost content={"Refresh Grid"}>
                    <FontAwesomeIcon icon={faArrowsRotate} />
                  </TooltipHost>
                </Link>
              </div>
            }
          />
          )
        ) : (
          subTab === 'folder' ? (
            (!isShowingFolders && folderTrail.length === 0 && filteredDocuments.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <FontAwesomeIcon icon={faFolder} style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>No documents yet</p>
              <p style={{ fontSize: 13, marginBottom: 24 }}>No documents have been created for this drug. Create a document to see the folder structure.</p>
              {canCreate && !hideAddButton && (
                <PrimaryButton
                  text="Add Document"
                  onClick={() => props.manageComponentView({ currentComponentName: ComponentNameEnum.AddDocument, componentProps: { drugId: selectedDrugId } })}
                />
              )}
            </div>
          ) : isShowingFolders ? (
            <MemoizedDataGridComponent
              key={`folder-tree-${folderTrail.join('-') || 'root'}`}
              items={folderGridItems}
              columns={folderColumns}
              reRenderComponent={true}
              searchable={true}
              isPagination={true}
              onItemInvoked={(item?: any) => {
                if (item?.id) navigateToFolder(item.id);
              }}
              isAddNew={true}
              addNewContent={
                <div className="dflex pb-1">
                  <Link
                    className="actionBtn iconSize btnRefresh icon-mr"
                    onClick={loadData}
                  >
                    <TooltipHost content={"Refresh Grid"}>
                      <FontAwesomeIcon icon={faArrowsRotate} />
                    </TooltipHost>
                  </Link>
                  {canCreate && !hideAddButton && (
                    <Link
                      className="actionBtn iconSize btnEdit ml-10"
                      onClick={() => {
                        props.manageComponentView({
                          currentComponentName: ComponentNameEnum.AddDocument,
                          componentProps: { drugId: selectedDrugId }
                        });
                      }}
                    >
                      <TooltipHost content="Add Document">
                        <FontAwesomeIcon icon={faPlus} />
                      </TooltipHost>
                    </Link>
                  )}
                </div>
              }
              onSelectedItem={() => {}}
            />
          ) : (
            <MemoizedDataGridComponent
              key={`folder-docs-${currentFolderId || 'root'}`}
              items={folderCurrentPageData}
              columns={effectiveColumns}
              reRenderComponent={true}
              searchable={true}
              isPagination={true}
              CustomselectionMode={isVisibleCrud.current ? 2 : 0}
              onSelectedItem={_onItemSelected}
              onItemInvoked={(item?: any) => { if (item) void handleViewDocument(item as Document); }}
              isAddNew={true}
              addNewContent={
                <div className="dflex pb-1">
                  <Link
                    className="actionBtn iconSize btnRefresh icon-mr"
                    onClick={loadData}
                  >
                    <TooltipHost content={"Refresh Grid"}>
                      <FontAwesomeIcon icon={faArrowsRotate} />
                    </TooltipHost>
                  </Link>
                  {canCreate && !hideAddButton && (
                    <Link
                        className="actionBtn iconSize btnEdit ml-10"
                        onClick={() => {
                        props.manageComponentView({
                            currentComponentName: ComponentNameEnum.AddDocument,
                            componentProps: { drugId: selectedDrugId }
                        });
                        }}
                    >
                        <TooltipHost content="Add Document">
                        <FontAwesomeIcon icon={faPlus} />
                        </TooltipHost>
                    </Link>
                  )}
                </div>
              }
              addEDButton={
                isDisplayEDbtn && isVisibleCrud.current && (
                  <div className="dflex">
                    {isDisplayEditButtonview && (
                      <>
                        <Link
                          className="actionBtn iconSize btnView"
                          onClick={() => {
                            if (updateItem.length > 0) void handleViewDocument(updateItem[0]);
                          }}
                        >
                          <TooltipHost content={"View Detail"}>
                            <FontAwesomeIcon icon={faEye} />
                          </TooltipHost>
                        </Link>
                        {canEdit && updateItem[0] && isAuthorForDoc(updateItem[0]) && (updateItem[0].status === 'Draft' || updateItem[0].status === 'Rejected') && (
                          <Link
                            className="actionBtn iconSize btnEdit ml-10"
                            onClick={onclickEdit}
                          >
                            <TooltipHost content={"Edit Detail"}>
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </TooltipHost>
                          </Link>
                        )}
                      </>
                    )}
                    {canDelete && (
                      <Link
                        className="actionBtn iconSize btnDanger ml-10"
                        onClick={onclickconfirmdelete}
                      >
                        <TooltipHost content={"Delete"}>
                          <FontAwesomeIcon icon={faTrashCan} />
                        </TooltipHost>
                      </Link>
                    )}
                    <Link
                      className="actionBtn iconSize btnGreen ml-10"
                      onClick={() => handleExport('pdf')}
                    >
                      <TooltipHost content={"Export"}>
                        <FontAwesomeIcon icon={faFileExport} />
                      </TooltipHost>
                    </Link>
                  </div>
                )
              }
            />
          )) : (
            <MemoizedDataGridComponent
              key={`list-view-${activeTab}`}
              items={filteredDocuments}
              columns={effectiveColumns}
              reRenderComponent={true}
              searchable={true}
              isPagination={true}
              CustomselectionMode={isVisibleCrud.current ? 2 : 0}
              onSelectedItem={_onItemSelected}
              onItemInvoked={(item?: any) => { if (item) void handleViewDocument(item as Document); }}
              isAddNew={true}
              addNewContent={
                <div className="dflex pb-1">
                  {canCreate && !hideAddButton && (
                    <Link
                      className="actionBtn iconSize btnEdit ml-10"
                      onClick={() => {
                        props.manageComponentView({
                          currentComponentName: ComponentNameEnum.AddDocument,
                          componentProps: { drugId: selectedDrugId }
                        });
                      }}
                    >
                      <TooltipHost content="Add Document">
                        <FontAwesomeIcon icon={faPlus} />
                      </TooltipHost>
                    </Link>
                  )}

                  <Link
                    className="actionBtn iconSize btnRefresh ml-10"
                    onClick={loadData}
                  >
                    <TooltipHost content={"Refresh Grid"}>
                      <FontAwesomeIcon icon={faArrowsRotate} />
                    </TooltipHost>
                  </Link>
                </div>
              }
            />
          )
        )}
      </div>
      {!isShowingFolders && folderCurrentPageData.length === 0 && (
        <div className="empty-state-modern" style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          <p>No documents found. Try adjusting your filters or add a new document.</p>
        </div>
      )}

      {/* Document View Panel — REQ 9: Full-width */}
      <Panel
        isOpen={isDocPanelOpen}
        onDismiss={() => {
          // Guard: do not close panel while any child modal is open.
          // Fluent UI Modal's FocusTrapZone steals focus from the Panel when
          // a modal opens, which triggers onDismiss. Block it here.
          if (
            isCommentsModalOpen ||
            isHistoryModalOpen ||
            isSubmitConfirmOpen ||
            isApproveConfirmOpen ||
            isRejectModalOpen ||
            isSignatureModalOpen ||
            !!compareVersion
          ) return;
          setIsDocPanelOpen(false);
          setReviewerComments([]);
          setReviewerCommentError('');
        }}
        type={PanelType.custom}
        customWidth="100%"
        headerText={viewingDocument ? `Document: ${viewingDocument.name}` : 'Document Details'}
        closeButtonAriaLabel="Close"
        isLightDismiss={false}
        layerProps={{ eventBubblingEnabled: true }}
        data-testid="document-view-panel"
      >
        {isLoading && <Loader />}
        {viewingDocument && (
          <div style={{ padding: '16px 0' }}>
            {/* REQ 3: Action Buttons at TOP */}
            <div style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
              padding: '12px 0 16px', borderBottom: '2px solid #eef2ff', marginBottom: 16
            }}>
              {/* Close */}
              <DefaultButton
                onClick={() => { setIsDocPanelOpen(false); setReviewerComments([]); setReviewerCommentError(''); }}
              >
                Close
              </DefaultButton>

              {/* View Document externally */}
              {viewingDocument.sharePointUrl && (
                <DefaultButton
                  href={viewingDocument.sharePointUrl}
                  target="_blank"
                  styles={{ root: { borderColor: '#1E88E5', color: '#1E88E5' }, rootHovered: { background: '#E3F2FD' } }}
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginRight: 6 }} />
                  Open in SharePoint
                </DefaultButton>
              )}

              {/* REQ 2+4: AUTHOR — Submit (Draft only, creator only, with confirm) */}
              {isCurrentUserAuthor && viewingDocument.status === 'Draft' && (
                <PrimaryButton
                  onClick={() => setIsSubmitConfirmOpen(true)}
                  styles={{ root: { background: '#1E88E5', borderColor: '#1E88E5' }, rootHovered: { background: '#1565C0' } }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: 6 }} />
                  Submit for Approval
                </PrimaryButton>
              )}

              {/* REQ 2+4: AUTHOR — Resubmit after Rejection */}
              {isCurrentUserAuthor && viewingDocument.status === 'Rejected' && (
                <PrimaryButton
                  onClick={() => setIsSubmitConfirmOpen(true)}
                  styles={{ root: { background: '#F57C00', borderColor: '#F57C00' }, rootHovered: { background: '#E65100' } }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: 6 }} />
                  Resubmit for Approval
                </PrimaryButton>
              )}

              {/* REQ 2+4: APPROVER — Reject (Pending Approval, assigned approver only, with confirm) */}
              {isCurrentUserApprover && viewingDocument.status === 'Pending Approval' && (
                <DefaultButton
                  onClick={handleReject}
                  styles={{ root: { background: '#d32f2f', borderColor: '#d32f2f', color: '#fff' }, rootHovered: { background: '#c62828', color: '#fff' } }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ marginRight: 6 }} />
                  Reject
                </DefaultButton>
              )}

              {/* REQ 2+4: APPROVER — Approve (Pending Approval, assigned approver only, with confirm) */}
              {isCurrentUserApprover && viewingDocument.status === 'Pending Approval' && (
                <PrimaryButton
                  onClick={() => setIsApproveConfirmOpen(true)}
                  styles={{ root: { background: '#2e7d32', borderColor: '#2e7d32' }, rootHovered: { background: '#1b5e20' } }}
                >
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
                  Approve
                </PrimaryButton>
              )}

              {/* Initiate Adobe Sign — shown to author (or admin) when document is Approved */}
              {viewingDocument.status === 'Approved' && (isCurrentUserAuthor || canApprove) && (
                <PrimaryButton
                  onClick={() => initiateAdobeSign(viewingDocument)}
                  styles={{ root: { background: '#6200EE', borderColor: '#6200EE', color: '#fff' }, rootHovered: { background: '#3700B3', color: '#fff' } }}
                >
                  <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 6 }} />
                  Initiate Signature
                </PrimaryButton>
              )}

              {/* Sign Document when Pending for Signature */}
              {viewingDocument.status === 'Pending for Signature' && (
                <PrimaryButton
                  onClick={() => setIsSignatureModalOpen(true)}
                  styles={{ root: { background: '#6200EE', borderColor: '#6200EE', color: '#fff' }, rootHovered: { background: '#3700B3', color: '#fff' } }}
                >
                  <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 6 }} />
                  Sign Document
                </PrimaryButton>
              )}

              {/* Comments modal button */}
              <DefaultButton
                onClick={() => setIsCommentsModalOpen(true)}
                styles={{ root: { borderColor: '#1300a6', color: '#1300a6' } }}
              >
                <FontAwesomeIcon icon={faComments} style={{ marginRight: 6 }} />
                Comments
              </DefaultButton>

              {/* Version History modal button */}
              <DefaultButton
                onClick={() => setIsHistoryModalOpen(true)}
                styles={{ root: { borderColor: '#546e7a', color: '#546e7a' } }}
              >
                <FontAwesomeIcon icon={faClockRotateLeft} style={{ marginRight: 6 }} />
                Version History
              </DefaultButton>
            </div>

            {/* Workflow Status */}
            <div className="workflow-breadcrumb" style={{ marginBottom: 24 }}>
              {getWorkflowSteps(viewingDocument.status).map((step, index) => (
                <React.Fragment key={step.label}>
                  <div className={`workflow-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                    {step.completed && <span className="step-check">✓</span>}
                    <span className="step-label">{step.label}</span>
                  </div>
                  {index < getWorkflowSteps(viewingDocument.status).length - 1 && <div className="workflow-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>

            {/* Document Details using ms-Grid */}
            <div className="ms-Grid">
              {/* <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12">
                  <div className="form-section-header">Document Information</div>
                </div>
              </div>

              <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Document Name</div>
                    <div className="detail-value" style={{ fontWeight: 600, color: '#1300a6' }}>{viewingDocument.name}</div>
                  </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Drug</div>
                    <div className="detail-value" style={{ fontWeight: 600, color: '#00695c' }}>{viewingDocument.drugName || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Category</div>
                    <div className="detail-value">{viewingDocument.category || 'N/A'}</div>
                  </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      {(() => {
                        const s = viewingDocument.status || 'Draft';
                        const cls = s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        return <span className={`status-badge status-${cls}`}>{s}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">CTD Folder</div>
                    <div className="detail-value">{folderLabelMap.get(viewingDocument.ctdFolder || '') || viewingDocument.ctdFolder || 'N/A'}</div>
                  </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Version</div>
                    <div className="detail-value">v{viewingDocument.version || 1}</div>
                  </div>
                </div>
              </div>

              <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Author</div>
                    <div className="detail-value">{viewingDocument.author || 'N/A'}</div>
                  </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Approver</div>
                    <div className="detail-value">{viewingDocument.approver || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                  <div className="detail-item">
                    <div className="detail-label">Last Modified</div>
                    <div className="detail-value">{viewingDocument.lastModified}</div>
                  </div>
                </div>
              </div> */}

              {/* Mapping Type Details */}
              {viewingDocument.mappingType && viewingDocument.mappingType !== 'None' && (
                <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                  <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <div className="detail-item">
                      <div className="detail-label">Mapping Type</div>
                      <div className="detail-value">{viewingDocument.mappingType}</div>
                    </div>
                  </div>
                  <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    {viewingDocument.mappingType === 'eCTD' && (
                      <div className="detail-item">
                        <div className="detail-label">eCTD Section</div>
                        <div className="detail-value">{viewingDocument.ectdSection || '—'}</div>
                      </div>
                    )}
                    {viewingDocument.mappingType === 'GMP' && (
                      <div className="detail-item">
                        <div className="detail-label">GMP Model</div>
                        <div className="detail-value">{viewingDocument.gmpModel || '—'}</div>
                      </div>
                    )}
                    {viewingDocument.mappingType === 'TMF' && (
                      <div className="detail-item">
                        <div className="detail-label">TMF Zone</div>
                        <div className="detail-value">{viewingDocument.tmfZone || '—'}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document File — clickable row like View Template */}
              {(viewingDocument.fileName || viewingDocument.fileRef || viewingDocument.sharePointUrl) && (
                <div className="ms-Grid-row" style={{ marginTop: 20 }}>
                  <div className="ms-Grid-col ms-sm12 ms-md6">
                    <div className="formLabel" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Document File</div>
                    <a
                      href={viewingDocument.sharePointUrl || viewingDocument.fileRef || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', background: '#f4f6fb',
                        borderRadius: 6, border: '1px solid #d0d7e5', cursor: 'pointer'
                      }}>
                        <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 20, color: '#1300a6' }} />
                        <span style={{ flex: 1, fontSize: 13, color: '#222', wordBreak: 'break-all' }}>
                          {viewingDocument.fileName || viewingDocument.name}
                        </span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 13, color: '#1300a6' }} />
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Word Document Embed with error fallback */}
              {viewingDocument.fileRef && (
                <>
                  <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12">
                      <div className="form-section-header">Document Preview</div>
                    </div>
                  </div>
                  <div className="ms-Grid-row" style={{ marginTop: 12 }}>
                    <div className="ms-Grid-col ms-sm12">
                      {getWordEmbedUrl(viewingDocument) ? (
                        <div style={{ position: 'relative' }}>
                          <iframe
                            key={viewingDocument.id}
                            src={getWordEmbedUrl(viewingDocument)}
                            style={{ width: '100%', height: '70vh', border: '1px solid #E0E0E0', borderRadius: 4 }}
                            title={`Preview: ${viewingDocument.name}`}
                            allowFullScreen
                          />
                          <div style={{ marginTop: 8, textAlign: 'right' }}>
                            <DefaultButton
                              href={`${spContext?.pageContext?.web?.absoluteUrl}${viewingDocument.fileRef.startsWith('/') ? viewingDocument.fileRef : '/' + viewingDocument.fileRef}`}
                              target="_blank"
                              styles={{ root: { fontSize: 13, borderColor: '#1300a6', color: '#1300a6' } }}
                            >
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ marginRight: 6 }} />
                              Open in SharePoint (if preview fails)
                            </DefaultButton>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          padding: 32, textAlign: 'center', background: '#f5f5f5',
                          borderRadius: 8, border: '1px dashed #ccc', color: '#666'
                        }}>
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 24, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                          <p style={{ margin: '0 0 12px', fontSize: 14 }}>Document preview is not available in this context.</p>
                          <DefaultButton
                            href={viewingDocument.sharePointUrl || viewingDocument.fileRef}
                            target="_blank"
                            styles={{ root: { borderColor: '#1300a6', color: '#1300a6' } }}
                          >
                            Open Document in SharePoint
                          </DefaultButton>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </Panel>

      {/* Comments Modal */}
      {viewingDocument && (
        <CustomModal
          isModalOpenProps={isCommentsModalOpen}
          setModalpopUpFalse={() => setIsCommentsModalOpen(false)}
          subject="Comments"
          dialogWidth="680px"
          isBlocking={false}
          message={
            <div style={{ padding: '8px 0', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: 24 }}>
                <div className="form-section-header" style={{ marginBottom: 12 }}>DMS Comments</div>
                {(() => {
                  const userComments = (viewingDocument.comments || []).filter(
                    c => c.author && c.author.toLowerCase() !== 'system'
                  );
                  return userComments.length > 0 ? (
                    <div>
                      {userComments.map((comment) => (
                        <div key={comment.id} style={{
                          background: '#f5f7ff', borderRadius: 8, padding: '10px 14px',
                          marginBottom: 10, borderLeft: '4px solid #1300a6'
                        }}>
                          <div style={{ fontWeight: 600, color: '#1300a6', marginBottom: 4 }}>
                            {comment.author}
                            {comment.timestamp && (
                              <span style={{ fontWeight: 400, fontSize: 12, color: '#888', marginLeft: 10 }}>
                                {new Date(comment.timestamp).toLocaleString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#333', fontSize: 14 }}>{comment.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No DMS comments yet</span>
                  );
                })()}
              </div>
              <div>
                <div className="form-section-header" style={{ marginBottom: 12 }}>
                  Reviewer Comments (from Word document)
                </div>
                {reviewerCommentError && <div className="field-error" style={{ marginBottom: 8 }}>{reviewerCommentError}</div>}
                {reviewerComments.length > 0 ? (
                  <div>
                    {reviewerComments.map((comment) => (
                      <div key={comment.id} style={{
                        background: '#fff8e1', borderRadius: 8, padding: '10px 14px',
                        marginBottom: 10, borderLeft: '4px solid #f9a825'
                      }}>
                        <div style={{ fontWeight: 600, color: '#e65100', marginBottom: 4 }}>
                          {comment.author}
                          {comment.timestamp && (
                            <span style={{ fontWeight: 400, fontSize: 12, color: '#888', marginLeft: 10 }}>
                              {new Date(comment.timestamp).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#333', fontSize: 14 }}>{comment.text}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>No reviewer comments in document</span>
                )}
              </div>
            </div>
          }
        />
      )}

      {/* Version History Modal */}
      {viewingDocument && (
        <CustomModal
          isModalOpenProps={isHistoryModalOpen}
          setModalpopUpFalse={() => setIsHistoryModalOpen(false)}
          subject="Version History"
          dialogWidth="820px"
          isBlocking={false}
          message={
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {versionHistory.length === 0 ? (
                <span style={{ color: '#999', fontStyle: 'italic' }}>No version history available</span>
              ) : (
                <div className="table-wrapper">
                  <table className="version-table">
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>Modified By</th>
                        <th>Modified Date</th>
                        <th>Changes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versionHistory.map(version => (
                        <tr key={version.id ?? version.version}>
                          <td>v{version.version}</td>
                          <td>{version.modifiedBy}</td>
                          <td>{version.modifiedDate}</td>
                          <td>{version.changes}</td>
                          <td>
                            <DefaultButton onClick={() => version.id !== undefined && handleCompareVersion(version.id)}>
                              <FontAwesomeIcon icon={faEye} style={{ marginRight: 6 }} />
                              Compare
                            </DefaultButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          }
        />
      )}

      {/* REQ 4: Submit Confirmation Dialog */}
      <CustomModal
        isModalOpenProps={isSubmitConfirmOpen}
        setModalpopUpFalse={setIsSubmitConfirmOpen}
        subject="Confirm Submission"
        isLoading={isLoading}
        message={
          <p>
            Are you sure you want to submit <strong>"{viewingDocument?.name}"</strong> for approval?
            Once submitted, you will not be able to edit the document until it is approved or rejected.
          </p>
        }
        yesButtonText="Yes, Submit"
        onClickOfYes={() => {
          setIsSubmitConfirmOpen(false);
          void handleSubmitForReview();
        }}
        closeButtonText="No, Cancel"
      />

      {/* REQ 4: Approve Confirmation Dialog */}
      <CustomModal
        isModalOpenProps={isApproveConfirmOpen}
        setModalpopUpFalse={setIsApproveConfirmOpen}
        subject="Confirm Approval"
        isLoading={isLoading}
        message={
          <p>
            Are you sure you want to approve <strong>"{viewingDocument?.name}"</strong>?
            This will move the document to the next stage in the workflow.
          </p>
        }
        yesButtonText="Yes, Approve"
        onClickOfYes={() => {
          setIsApproveConfirmOpen(false);
          void handleApprove();
        }}
        closeButtonText="No, Cancel"
      />

      <CustomModal
        isModalOpenProps={isRejectModalOpen}
        setModalpopUpFalse={setIsRejectModalOpen}
        subject="Rejection Reason"
        isLoading={isLoading}
        message={
          <div className="form-group">
            <label className="form-label">Please provide a reason for rejecting this document:</label>
            <TextField
              multiline
              rows={4}
              value={rejectReason}
              onChange={(_, val) => setRejectReason(val || '')}
              placeholder="Enter rejection reason here..."
            />
          </div>
        }
        yesButtonText="Confirm Reject"
        onClickOfYes={confirmReject}
        closeButtonText="Cancel"
      />

      <CustomModal
        isModalOpenProps={isDeleteDialogOpen}
        setModalpopUpFalse={setIsDeleteDialogOpen}
        subject="Confirm Delete"
        isLoading={isLoading}
        message={`Are you sure you want to delete ${selectedIds.length} document(s)? This action cannot be undone.`}
        yesButtonText="Delete"
        onClickOfYes={handleBulkDelete}
        closeButtonText="Cancel"
      />

      <CustomModal
        isModalOpenProps={isEditModalOpen}
        setModalpopUpFalse={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditingDocument(null);
            setEditForm({
              name: '',
              categoryId: 0,
              status: 'Draft',
              ctdModule: '',
              submodule: '',
              approverId: 0
            });
          }
        }}
        subject={`Edit Document${editingDocument ? ` - ${editingDocument.name}` : ''}`}
        closeButtonText="Cancel"
        isLoading={isLoading}
        message={
          <div>
            <div className="form-group">
              <TextField
                label="Document Name"
                value={editForm.name}
                onChange={(_e, v) => setEditForm({ ...editForm, name: v ?? '' })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <ReactDropdown
                key={`editCat-${editingDocument?.id ?? 0}`}
                name="editCategory"
                options={editCategoryOptions}
                defaultOption={editCategoryOptions.find(o => o.value === editForm.categoryId) || null}
                onChange={(opt) => setEditForm({ ...editForm, categoryId: Number(opt?.value) || 0 })}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <ReactDropdown
                key={`editStatus-${editingDocument?.id ?? 0}`}
                name="status"
                options={statusOptions.filter(opt => opt.value !== 'All')}
                defaultOption={statusOptions.find(o => o.value === editForm.status) ?? statusOptions[1]}
                onChange={(opt) => setEditForm({ ...editForm, status: (opt?.value as any) ?? 'Draft' })}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>
            <div className="form-group">
              <TextField
                label="CTD Module"
                value={editForm.ctdModule}
                onChange={(_e, v) => setEditForm({ ...editForm, ctdModule: v ?? '' })}
              />
            </div>
            <div className="form-group">
              <TextField
                label="Submodule"
                value={editForm.submodule}
                onChange={(_e, v) => setEditForm({ ...editForm, submodule: v ?? '' })}
              />
            </div>
          </div>
        }
        yesButtonText="Save Changes"
        onClickOfYes={handleSaveEdit}
      />

      <CustomModal
        isModalOpenProps={isSignatureModalOpen}
        setModalpopUpFalse={setIsSignatureModalOpen}
        subject="Adobe Signature"
        isLoading={isLoading}
        message={
          <div>
            <TextField
              label="Signature"
              placeholder="Type your name to sign"
              value={signature}
              onChange={(_e, v) => setSignature(v ?? '')}
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Applying signature will create Commented and Final Signed documents.
            </p>
          </div>
        }
        yesButtonText="Apply Signature"
        onClickOfYes={handleFinalApprove}
        isYesButtonDisbale={!signature.trim()}
        closeButtonText="Cancel"
      />

      <CustomModal
        isModalOpenProps={!!compareVersion}
        setModalpopUpFalse={(open) => {
          if (!open) setCompareVersion(null);
        }}
        subject="Compare Metadata"
        closeButtonText="Close"
        isLoading={isLoading}
        message={
          compareVersion && viewingDocument ? (
            <div className="document-details">
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <div>Current: {viewingDocument.status}</div>
                  <div>Previous: {compareVersion.Status || '-'}</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Category</div>
                <div className="detail-value">
                  <div>Current: {viewingDocument.category || '-'}</div>
                  <div>Previous: {compareVersion.Category || '-'}</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">CTD Module</div>
                <div className="detail-value">
                  <div>Current: {viewingDocument.ctdModule || '-'}</div>
                  <div>Previous: {compareVersion.CTDModule || '-'}</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Submodule</div>
                <div className="detail-value">
                  <div>Current: {viewingDocument.submodule || '-'}</div>
                  <div>Previous: {compareVersion.Submodule || '-'}</div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )
        }
      />

    </div >
  );
};

