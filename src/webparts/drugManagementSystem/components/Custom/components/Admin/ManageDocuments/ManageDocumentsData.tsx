import * as React from 'react';
import * as CamlBuilder from 'camljs';
import * as JSZip from 'jszip';
import { useAtom, useAtomValue } from 'jotai';
import type { Category, Comment, CTDFolder, Document, VersionHistory } from '../../../types';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { roleMappingAtom, siteAdminAtom } from '../../../../../jotai/adminAtoms';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';
import { showToast } from '../../../../Common/Toast/toastBus';

export type DateFilter =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thismonth'
  | 'lastmonth'
  | 'yeartodate'
  | 'daterange';

export interface ManageDocumentsFilters {
  category: string;
  status: string;
  dateFilter: DateFilter;
  dateFrom: string;
  dateTo: string;
}

export function ManageDocumentsData(options?: { filterByCurrentUser?: boolean; filterByPending?: boolean }) {
  const filterByCurrentUser = !!options?.filterByCurrentUser;
  const filterByPending = !!options?.filterByPending;
  const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
  const roleMapping = useAtomValue(roleMappingAtom);
  const siteAdmin = useAtomValue(siteAdminAtom);
  const { provider, context, currentUser } = appGlobalState;

  const defaultTab = filterByPending ? 'assignedToMe' : filterByCurrentUser ? 'myDocuments' : 'all';
  const [activeTab, setActiveTab] = React.useState<'all' | 'myDocuments' | 'assignedToMe' | 'workspace'>(defaultTab);
  const [subTab, setSubTab] = React.useState<'folder' | 'list'>('folder');

  const [documents, setDocuments] = React.useState<Document[]>([]);
  // Filter based on activeTab
  const docsByTab = React.useMemo(() => {
    let list = documents;
    const currentUserId = Number(
      (currentUser as any)?.userId ||
      (currentUser as any)?.Id ||
      (currentUser as any)?.id ||
      0
    ) || 0;
    const userEmail = String(currentUser?.email || '').toLowerCase().trim();

    if (activeTab === 'myDocuments') {
      const currentDisplayName = String((currentUser as any)?.displayName || '').toLowerCase().trim();
      list = list.filter(d => {
        const authorDisplay = String(d.author || '').toLowerCase().trim();
        const sentByDisplay = String(d.sentBy || '').toLowerCase().trim();
        return (
          // 1. SP system "Created By" user ID match
          (currentUserId > 0 && d.authorId === currentUserId) ||
          // 2. SentBy person field ID match (explicitly saved on create)
          (currentUserId > 0 && d.sentById === currentUserId) ||
          // 3. Display name exact match on Author (e.g. "Users" === "Users")
          (currentDisplayName !== '' && authorDisplay === currentDisplayName) ||
          // 4. Display name exact match on SentBy
          (currentDisplayName !== '' && sentByDisplay === currentDisplayName) ||
          // 5. Email substring fallback
          (userEmail !== '' && (authorDisplay.includes(userEmail) || sentByDisplay.includes(userEmail)))
        );
      });
    } else if (activeTab === 'assignedToMe') {
      const currentLoginName = String((currentUser as any)?.loginName || '').toLowerCase();
      const currentDisplayName = String((currentUser as any)?.displayName || '').toLowerCase().trim();
      const approverStatuses = new Set([
        'pending approval',
        'approved',
        'pending for signature',
        'initiate for signature',
        'signed',
      ]);
      list = list.filter(d => {
        const status = String(d.status || '').toLowerCase().trim();
        if (!approverStatuses.has(status)) return false;
        const approverDisplay = String(d.approver || '').toLowerCase().trim();
        return (
          // 1. SharePoint user ID match (most reliable)
          (currentUserId > 0 && d.approverId === currentUserId) ||
          // 2. Display name exact match — d.approver = Title from person field (e.g. "Users")
          (currentDisplayName !== '' && approverDisplay === currentDisplayName) ||
          // 3. Email extracted from person field's LoginName claim
          (userEmail !== '' && d.approverLoginName === userEmail) ||
          // 4. loginName claim ends-with match
          (currentLoginName !== '' && d.approverLoginName !== '' &&
            currentLoginName.endsWith(d.approverLoginName || '')) ||
          // 5. Display name contains email (legacy fallback)
          (userEmail !== '' && approverDisplay.includes(userEmail))
        );
      });
    }
    return list;
  }, [documents, activeTab, currentUser]);

  const [filteredDocuments, setFilteredDocuments] = React.useState<Document[]>([]);
  const [drugs, setDrugs] = React.useState<Array<{ id: number; name: string; category?: string; status?: string; ctdStructure?: 'ectd' | 'dossier' | 'gmp' | 'tmf' }>>([]);
  const [selectedDrugId, setSelectedDrugId] = React.useState<number | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [ctdFolders, setCtdFolders] = React.useState<CTDFolder[]>([]);
  const [tmfFolders, setTmfFolders] = React.useState<CTDFolder[]>([]);
  const [gmpFolders, setGmpFolders] = React.useState<CTDFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = React.useState<string>('All');
  const [selectedSubfolder, setSelectedSubfolder] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDocPanelOpen, setIsDocPanelOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false);
  const [viewingDocument, setViewingDocument] = React.useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = React.useState<Document | null>(null);
  const [versionHistory, setVersionHistory] = React.useState<VersionHistory[]>([]);
  const [versionHistoryRaw, setVersionHistoryRaw] = React.useState<any[]>([]);
  const [compareVersion, setCompareVersion] = React.useState<any | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '',
    categoryId: 0,
    status: 'Draft',
    ctdModule: '',
    submodule: '',
    approverId: 0
  });
  const [signature, setSignature] = React.useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [ctdStructure, setCtdStructure] = React.useState<'ectd' | 'dossier' | 'gmp' | 'tmf'>('ectd');
  const isStructureDisabled = selectedDrugId !== null;
  const [filters, setFilters] = React.useState<ManageDocumentsFilters>({
    category: '',
    status: 'All',
    dateFilter: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [reviewerComments, setReviewerComments] = React.useState<Comment[]>([]);
  const [reviewerCommentError, setReviewerCommentError] = React.useState('');
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const isAdmin = !!(siteAdmin || roleMapping?.isAdmin);

  React.useEffect(() => {
    setAppGlobalState((prev: any) => ({ ...prev, isSidebarHidden: isAddModalOpen || isEditModalOpen }));
  }, [isAddModalOpen, isEditModalOpen, setAppGlobalState]);

  const itemsPerPage = 10;
  const canApprove = !!(siteAdmin || roleMapping?.isApprover || roleMapping?.isAdmin);
  const canEdit = !!(siteAdmin || roleMapping?.isAdmin);
  const canDelete = !!(siteAdmin || roleMapping?.isAdmin);
  const canCreate = !!(siteAdmin || roleMapping?.isAuthor || roleMapping?.isAdmin);

  const handleStructureChange = (value: 'ectd' | 'dossier' | 'gmp' | 'tmf') => {
    setCtdStructure(value);
  };

  const parseComments = (value?: string) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  };

  const parseLookupText = (value: any): string => {
    if (!value) return '';
    if (Array.isArray(value) && value.length > 0) {
      return value[0]?.lookupValue ?? value[0]?.Title ?? value[0]?.title ?? value[0]?.Name ?? '';
    }
    if (typeof value === 'string') {
      const parts = value.split(';#').filter(Boolean);
      return (parts.length > 1 ? parts[1] : parts[0]) ?? value;
    }
    if (typeof value === 'object') {
      return value.lookupValue ?? value.Title ?? value.title ?? value.Name ?? '';
    }
    return String(value);
  };

  const parseLookupId = (value: any): number | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value) && value.length > 0) {
      const id = value[0]?.lookupId ?? value[0]?.ID ?? value[0]?.Id ?? value[0]?.id;
      const parsed = Number(id);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parts = value.split(';#').filter(Boolean);
      const parsed = Number(parts[0]);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'object') {
      const id = value.lookupId ?? value.ID ?? value.Id ?? value.id;
      const parsed = Number(id);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const parseUrlValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.split(',')[0] ?? value;
    }
    if (typeof value === 'object') {
      return value.Url ?? value.url ?? '';
    }
    return '';
  };

  const parseUrlDescription = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.Description ?? value.description ?? '';
    }
    if (typeof value === 'string') {
      const parts = value.split(',');
      return parts.length > 1 ? parts.slice(1).join(',').trim() : '';
    }
    return '';
  };

  const parseWordComments = async (buffer: ArrayBuffer): Promise<Comment[]> => {
    const comments: Comment[] = [];
    const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    try {
      const zip = await JSZip.loadAsync(buffer);
      const commentFile = zip.file('word/comments.xml');
      if (!commentFile) return comments;
      const xml = await commentFile.async('string');
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const nodes = Array.from(doc.getElementsByTagNameNS(ns, 'comment'));
      nodes.forEach((node, index) => {
        const author = node.getAttribute('w:author') || node.getAttribute('author') || 'Reviewer';
        const timestamp = node.getAttribute('w:date') || node.getAttribute('date') || new Date().toISOString();
        const text = Array.from(node.getElementsByTagNameNS(ns, 't'))
          .map(el => el.textContent || '')
          .join('')
          .trim();
        if (text) {
          comments.push({
            id: Number(node.getAttribute('w:id') || node.getAttribute('id') || index + 1),
            author,
            text,
            timestamp
          });
        }
      });
    } catch (error) {
      console.error('Failed to parse Word comments:', error);
    }
    return comments;
  };

  const sanitizeFolderName = (value: string): string =>
    value.replace(/[\\/:*?"<>|]/g, '-').trim();

  const ensureFolderPath = async (basePath: string, segments: string[]): Promise<string> => {
    let currentPath = basePath;
    for (const segment of segments) {
      if (!segment) continue;
      currentPath = `${currentPath}/${sanitizeFolderName(segment)}`;
      try {
        await provider?.createFolder(currentPath);
      } catch (error) {
        // ignore if folder already exists
      }
    }
    return currentPath;
  };

  const stripExt = (s: string) => s.replace(/\.[^/.]+$/, '') || s;

  // Strip all trailing extensions — handles double extension like .docx_20260317135114.docx
  const stripAllExts = (s: string): string => {
    if (!s) return s;
    const parts = s.split('.');
    if (parts.length <= 1) return s;
    // Keep stripping while the last segment looks like an extension or a timestamp
    let result = s;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const idx = result.lastIndexOf('.');
      if (idx <= 0) break;
      const ext = result.substring(idx + 1);
      // Stop if the remaining name before the dot would be empty
      if (!result.substring(0, idx)) break;
      result = result.substring(0, idx);
      // Stop when we've removed a known doc extension
      if (/^(docx?|xlsx?|pptx?|pdf|txt|rtf|csv)$/i.test(ext)) break;
    }
    return result || s;
  };

  const mapDocumentItem = (item: any): Document => {
    // Document name: always use the actual file name (FileLeafRef stripped of all extensions).
    // Title is unreliable — SharePoint sets it to the drug folder name on upload.
    const fileLeafStripped = stripAllExts(item.FileLeafRef || '');
    const resolvedName = fileLeafStripped || stripExt(item.Title || 'Untitled');

    return ({
    id: item.ID,
    name: resolvedName,
    fileName: item.FileLeafRef || '',
    fileRef: item.FileRef || '',
    category: parseLookupText(item.Category),
    categoryId: parseLookupId(item.CategoryId ?? item.Category),
    drugName: parseLookupText(item.Drug),
    drugId: parseLookupId(item.DrugId ?? item.Drug),
    status: item.Status || 'Draft',
    lastModified: item.Modified ? new Date(item.Modified).toISOString().split('T')[0] : '',
    author: parseLookupText(item.Author),
    authorId: parseLookupId(item.AuthorId ?? item.Author),
    reviewer: parseLookupText(item.Reviewer),
    reviewerId: parseLookupId(item.ReviewerId ?? item.Reviewer),
    approver: parseLookupText(item.Approver),
    approverId: parseLookupId(item.ApproverId ?? item.Approver),
    // Extract email from LoginName (e.g. "i:0#.f|membership|admin@tenant.com" → "admin@tenant.com")
    approverLoginName: (() => {
      const raw = item.Approver?.LoginName || item.Approver?.EMail || item.Approver?.Email || '';
      if (!raw) return '';
      const parts = raw.split('|');
      return parts[parts.length - 1]?.toLowerCase() || '';
    })(),
    comments: parseComments(item.Comments),
    ctdFolder: item.CTDFolder || '',
    ctdModule: item.CTDModule || '',
    submodule: item.Submodule || '',
    mappingType: item.MappingType || '',
    ectdSection: item.ECTDSection || '',
    ectdSubsection: item.ECTDSubsection || '',
    gmpModel: item.GMPModel || '',
    tmfZone: item.TMFZone || '',
    tmfSection: item.TMFSection || '',
    template: '',
    templateId: Number(item.TemplateId) || 0,
    content: item.Content || '',
    version: Number(item.DocumentVersion || item.OData__UIVersionString || 1),
    createdDate: item.Created ? new Date(item.Created).toISOString().split('T')[0] : '',
    sentBy: parseLookupText(item.SentBy),
    sentById: parseLookupId(item.SentById ?? item.SentBy),
    sharePointUrl: parseUrlValue(item.SharePointURL) || item.FileRef,
    isDeleted: item.IsDelete === 'Yes' || item.IsDelete === true || item['IsDelete.value'] === '1',
    uniqueId: item.UniqueId ? String(item.UniqueId).replace(/^\{|\}$/g, '') : undefined
  });
  };

  const buildCTDFolderTree = (items: any[]): CTDFolder[] => {
    const nodes: CTDFolder[] = items.map((item: any) => ({
      id: item.ID || 0,
      folderId: item.FolderId || String(item.ID),
      name: item.Title,
      parentFolderId: item.ParentFolderId,
      sortOrder: item.SortOrder || 0,
      isFolder: true,
      code: item.Code,
      description: item.Description,
      parentId: item.ParentFolderId || undefined,
      children: [] as CTDFolder[],
      icon: '📁',
      documentCount: 0
    }));
    const lookup = new Map(nodes.map(node => [node.folderId, node]));
    nodes.forEach(node => {
      if (node.parentId && lookup.has(node.parentId)) {
        lookup.get(node.parentId)!.children!.push(node);
      }
    });
    return nodes.filter(node => !node.parentId);
  };

  // Flatten a CTDFolder tree to a single array (for building ID sets)
  const flattenCTDFolders = (nodes: CTDFolder[]): CTDFolder[] => {
    const result: CTDFolder[] = [];
    const stack = [...nodes];
    while (stack.length) {
      const node = stack.pop()!;
      result.push(node);
      if (node.children?.length) stack.push(...node.children);
    }
    return result;
  };

  const loadData = async () => {
    if (!provider) {
      // No provider available - return empty data
      setDocuments([]);
      setCtdFolders([]);
      setCategories([]);
      setDrugs([]);
      return;
    }
    setIsLoading(true);
    try {
      const docsQuery = new CamlBuilder()
        .View([
          'ID',
          'Title',
          'FileLeafRef',
          'FileRef',
          'Modified',
          'Created',
          'Status',
          'DocumentVersion',
          'Comments',
          'CTDFolder',
          'CTDModule',
          'Submodule',
          'MappingType',
          'ECTDSection',
          'ECTDSubsection',
          'GMPModel',
          'TMFZone',
          'TMFSection',
          'Content',
          'SharePointURL',
          'Author',
          'AuthorId',
          'Reviewer',
          'ReviewerId',
          'Approver',
          'ApproverId',
          'SentBy',
          'SentById',
          'Category',
          'CategoryId',
          'Drug',
          'DrugId',
          'TemplateId',
          'IsDelete',
          'UniqueId'
        ])
        .RowLimit(5000, true)
        .Query()
        .Where()
        .NumberField('FSObjType').EqualTo(0)
        .OrderByDesc('Modified');
      const tmfQuery = new CamlBuilder()
        .View(['ID', 'Title', 'FolderId', 'ParentFolderId', 'SortOrder'])
        .RowLimit(5000, true)
        .Query();
      tmfQuery.OrderBy('SortOrder');

      const gmpQuery = new CamlBuilder()
        .View(['ID', 'Title', 'FolderId', 'ParentFolderId', 'SortOrder'])
        .RowLimit(5000, true)
        .Query();
      gmpQuery.OrderBy('SortOrder');
 
      const foldersQuery = new CamlBuilder()
        .View(['ID', 'Title', 'FolderId', 'ParentFolderId', 'SortOrder', 'Description', 'Code'])
        .RowLimit(5000, true)
        .Query();
      foldersQuery.OrderBy('SortOrder');

      const categoriesQuery = new CamlBuilder()
        .View(['ID', 'Title', 'Description', 'Documents', 'Status', 'Level'])
        .RowLimit(5000, true)
        .Query();

      // Only select columns that exist on the Drugs/Drugs Database list.
      // 'Category' and 'Status' may not exist — querying them causes a 400.
      const drugsQuery = new CamlBuilder()
        .View(['ID', 'Title'])
        .RowLimit(1000, true)
        .Query();
      drugsQuery.OrderBy('Title');

      const [docs, folders, cats, gmp] = await Promise.all([
        provider.getItemsByCAMLQuery(ListNames.DMSDocuments, docsQuery.ToString().replace('<View>', '<View Scope="RecursiveAll">')),
        provider.getItemsByCAMLQuery(ListNames.CTDFolders, foldersQuery.ToString()).catch(() => []),
        provider.getItemsByCAMLQuery(ListNames.Categories, categoriesQuery.ToString()).catch(() => []),
        provider.getItemsByCAMLQuery(ListNames.GmpModels, gmpQuery.ToString()).catch(() => [])
      ]);

      let tmf: any[] = [];
      try {
        tmf = await provider.getItemsByCAMLQuery(ListNames.TMFFolders, tmfQuery.ToString());
      } catch (error) {
        console.warn(`List "${ListNames.TMFFolders}" not found or inaccessible:`, error);
        tmf = [];
      }
      let drugsItems: any[] = [];
      try {
        drugsItems = await provider.getItemsByCAMLQuery(ListNames.DrugsDatabase, drugsQuery.ToString()) || [];
      } catch {
        console.warn(`List "${ListNames.DrugsDatabase}" could not be loaded.`);
      }
      const mappedDocs = (docs || []).map(mapDocumentItem);
      setDocuments(mappedDocs);
      setCtdFolders(buildCTDFolderTree(folders || []));
      setTmfFolders(buildCTDFolderTree(tmf || []));
      // GMP models have no FolderId column — use Title as key so it matches
      // the modelName stored in ctdFolder/ctdModule on GMP documents.
      setGmpFolders(buildCTDFolderTree((gmp || []).map((item: any) => ({ ...item, FolderId: item.Title }))));
      setCategories(
        (cats || []).map((item: any) => ({
          id: item.ID,
          name: item.Title,
          description: item.Description,
          documents: Number(item.Documents || 0),
          status: (item.Status as 'Active' | 'Inactive') || 'Active',
          level: item.Level || 1
        }))
      );
      setDrugs(
        (drugsItems || []).map((item: any) => {
          // Derive the dominant mapping type from this drug's already-mapped documents
          const drugDocs = mappedDocs.filter(d => Number(d.drugId) === Number(item.ID));
          const counts: Record<string, number> = { ectd: 0, gmp: 0, tmf: 0 };
          for (const doc of drugDocs) {
            const mt = (doc.mappingType || '').toLowerCase();
            if (mt === 'ectd') counts.ectd++;
            else if (mt === 'gmp') counts.gmp++;
            else if (mt === 'tmf') counts.tmf++;
          }
          const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          const ctdStructure: 'ectd' | 'gmp' | 'tmf' =
            dominant && dominant[1] > 0 ? (dominant[0] as 'ectd' | 'gmp' | 'tmf') : 'ectd';
          return {
            id: item.ID,
            name: item.Title,
            category: item.Category || undefined,
            status: item.Status || undefined,
            ctdStructure
          };
        })
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load documents:', error);
      setErrorMessage('Unable to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDocumentInReviewMode = (doc: Document) => {
    const baseUrl =
      doc.sharePointUrl ||
      (doc.fileRef && context?.pageContext?.web?.absoluteUrl ? `${context.pageContext.web.absoluteUrl}${doc.fileRef}` : '');
    if (!baseUrl) return;
    const separator = baseUrl.includes('?') ? '&' : '?';
    // `web=1` opens Office files in the browser (best-effort "review" experience).
    window.open(`${baseUrl}${separator}web=1`, '_blank', 'noopener,noreferrer');
  };

  const getDateRange = (filterType: DateFilter, customFrom?: string, customTo?: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterType) {
      case 'today':
        return { from: today, to: new Date() };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: today };
      }
      case 'last7days': {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        return { from: last7, to: new Date() };
      }
      case 'last30days': {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        return { from: last30, to: new Date() };
      }
      case 'thismonth': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: monthStart, to: new Date() };
      }
      case 'lastmonth': {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { from: lastMonthStart, to: lastMonthEnd };
      }
      case 'yeartodate': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { from: yearStart, to: new Date() };
      }
      case 'daterange':
        if (customFrom && customTo) {
          return { from: new Date(customFrom as string), to: new Date(customTo as string) };
        }
        return null;
      default:
        return null;
    }
  };

  const applyFilters = () => {
    let filtered = [...docsByTab];

    // Global view filters (Search, Folder, Drug, etc.)
    // We already filtered by Tab in docsByTab memo.

    // Soft-delete filter
    if (!showDeleted) {
      filtered = filtered.filter(d => !(d as any).isDeleted);
    }

    if (selectedDrugId !== null) {
      filtered = filtered.filter(d => d.drugId != null && Number(d.drugId) === Number(selectedDrugId));
    }

    if (selectedFolder !== 'All') {
      if (selectedSubfolder) filtered = filtered.filter(d => d.submodule === selectedSubfolder);
      else filtered = filtered.filter(d => d.ctdModule === selectedFolder || d.ctdFolder === selectedFolder);
    }

    if (searchTerm) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filters.category) {
      filtered = filtered.filter(d => d.category === filters.category);
    }

    if (filters.status !== 'All') {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    const dateRange = getDateRange(filters.dateFilter, filters.dateFrom, filters.dateTo);
    if (dateRange) {
      filtered = filtered.filter(d => {
        if (!d.lastModified) return false;
        const docDate = new Date(d.lastModified);
        return docDate >= dateRange.from && docDate <= dateRange.to;
      });
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1);
  };

  React.useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  React.useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, selectedFolder, selectedSubfolder, docsByTab, searchTerm, selectedDrugId, activeTab, currentUser, showDeleted]);

  const selectDrug = (drugId: number | null) => {
    setSelectedDrugId(drugId);
    setSelectedFolder('All');
    setSelectedSubfolder(null);
    setCurrentPage(1);
    setSearchTerm('');
    if (!drugId) return;
    // Auto-detect structure type from documents belonging to this drug.
    // GMP folder node folderId = model name; TMF folderId = FolderId code.
    const drugDocs = documents.filter(d => d.drugId === drugId);
    const gmpIds = new Set(flattenCTDFolders(gmpFolders).map(f => f.folderId));
    const tmfIds = new Set(flattenCTDFolders(tmfFolders).map(f => f.folderId));
    const hasGmp = drugDocs.some(d =>
      (d.ctdFolder && gmpIds.has(d.ctdFolder)) ||
      (d.ctdModule && gmpIds.has(d.ctdModule))
    );
    const hasTmf = !hasGmp && drugDocs.some(d =>
      (d.ctdFolder && tmfIds.has(d.ctdFolder)) ||
      (d.ctdModule && tmfIds.has(d.ctdModule))
    );
    setCtdStructure(hasGmp ? 'gmp' : hasTmf ? 'tmf' : 'ectd');
  };

  const handleViewDocument = async (doc: Document, openPanel = true) => {
    setViewingDocument(doc);
    setReviewerComments([]);
    setReviewerCommentError('');
    if (provider) {
      setIsLoading(true);
      try {
        const history = await provider.getVersionHistoryById(ListNames.DMSDocuments, doc.id);
        setVersionHistoryRaw(history || []);
        setVersionHistory(
          (history || []).map((version: any) => ({
            id: version.ID || version.VersionId,
            version: Number(version.VersionLabel || version.VersionId || 1),
            modifiedBy: version.Editor?.Title || version.CreatedBy?.Title || 'Unknown',
            modifiedDate: version.Created ? new Date(version.Created).toISOString().split('T')[0] : '',
            changes: version.CheckInComment || 'Metadata updated'
          }))
        );

        const fileRef = doc.fileRef || doc.sharePointUrl;
        const fileName = doc.fileName || fileRef?.split('/').pop() || '';
        if (fileRef && fileName.toLowerCase().endsWith('.docx')) {
          const serverRelative = fileRef.startsWith('http') ? new URL(fileRef).pathname : fileRef;
          const buffer = await provider.getFileContents(serverRelative);
          const comments = await parseWordComments(buffer);
          setReviewerComments(comments);
        }
      } catch (error) {
        console.error('Failed to load document history/comments:', error);
        setReviewerCommentError('Unable to load reviewer comments.');
      } finally {
        setIsLoading(false);
      }
    }
    if (openPanel) setIsDocPanelOpen(true);
  };

  const getNextStatus = (currentStatus: string): string => {
    const flow = ['Draft', 'Pending Approval', 'Approved', 'Pending for Signature', 'Signed', 'Final'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex < 0 || currentIndex === flow.length - 1) return currentStatus;
    return flow[currentIndex + 1];
  };

  const handleApprove = async () => {
    if (!viewingDocument) { setErrorMessage('No document selected.'); return; }
    if (!provider) { setErrorMessage('SharePoint connection not available.'); return; }

    // Approver action: move 'Pending Approval' → 'Approved'
    // After approval, author sees document with 'Approved' status and can Initiate Signature.
    if (viewingDocument.status !== 'Pending Approval' && viewingDocument.status !== 'In Review') {
      setErrorMessage('Only documents with "Pending Approval" status can be approved here.');
      return;
    }

    setIsLoading(true);
    try {
      const auditLog = {
        id: (viewingDocument.comments?.length || 0) + 1,
        author: currentUser?.displayName || 'Approver',
        text: `Document approved by ${currentUser?.displayName || 'Approver'}. Status changed from ${viewingDocument.status} to Approved.`,
        timestamp: new Date().toISOString()
      };
      const nextComments = [...(viewingDocument.comments || []), auditLog];

      await provider.updateItem(
        {
          Status: 'Approved',
          IsEmailSend: true,
          Comments: JSON.stringify(nextComments)
        },
        ListNames.DMSDocuments,
        viewingDocument.id
      );
      await loadData();
      setIsDocPanelOpen(false);
      setSuccessMessage('Document has been approved. The author can now initiate the signature process.');
    } catch (error: any) {
      console.error('Failed to approve document:', error);
      if (error?.status === 423 || (error?.message || '').includes('423')) {
        setErrorMessage('The file is currently open in Word Online. Please close it and try again.');
      } else {
        setErrorMessage('Unable to approve document. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignatureStatus = async (doc: Document, status: string, signatureNote: string) => {
    if (!provider) return;
    const auditLog = {
      id: (doc.comments?.length || 0) + 1,
      author: 'System',
      text: `Document ${status} by ${signatureNote}`,
      timestamp: new Date().toISOString()
    };
    const nextComments = [...(doc.comments || []), auditLog];
    await provider.updateItem(
      {
        Status: status,
        IsEmailSend: true,
        Comments: JSON.stringify(nextComments)
      },
      ListNames.DMSDocuments,
      doc.id
    );
  };

  /**
   * Q3/Q4/Q8/Q9: Create signed document copy
   * - Q8: Only ONE file saved — the signed/final PDF (no "Commented" copy)
   * - Q3/Q4: Saved in SignedDocuments/[DocumentType]/[DrugName]/[CTDFolder]/
   *   • eCTD: SignedDocuments/eCTD/[DrugName]/Module X/[filename]-Signed.ext
   *   • TMF:  SignedDocuments/TMF/[DrugName]/Zone X/[filename]-Signed.ext
   *   • GMP:  SignedDocuments/GMP/[DrugName]/[ModelName]/[filename]-Signed.ext
   */
  const createSignedCopies = async (doc: Document, signatureNote: string) => {
    if (!provider || !context) return;
    const fileRef = doc.fileRef || doc.sharePointUrl;
    if (!fileRef) return;
    const serverRelative = fileRef.startsWith('http')
      ? new URL(fileRef).pathname
      : fileRef;
    const baseName = doc.fileName || serverRelative.split('/').pop() || doc.name;
    const dotIndex = baseName.lastIndexOf('.');
    const base = dotIndex > -1 ? baseName.substring(0, dotIndex) : baseName;
    const ext = dotIndex > -1 ? baseName.substring(dotIndex) : '';

    const buffer = await provider.getFileContents(serverRelative);

    // Q8: Only ONE signed file — no "Commented" copy
    const signedFileName = `${base}-Signed${ext}`;

    // Q3/Q4: Resolve document type from folder ID sets (not fragile name prefixes)
    const _gmpIds = new Set(flattenCTDFolders(gmpFolders).map(f => f.folderId));
    const _tmfIds = new Set(flattenCTDFolders(tmfFolders).map(f => f.folderId));
    const _inGmp = (v?: string) => !!(v && _gmpIds.has(v));
    const _inTmf = (v?: string) => !!(v && _tmfIds.has(v));
    const documentType =
      _inTmf(doc.ctdFolder) || _inTmf(doc.ctdModule) ? 'TMF' :
      _inGmp(doc.ctdFolder) || _inGmp(doc.ctdModule) ? 'GMP' : 'eCTD';

    // Q4/Q9: Build type-specific folder segments
    // eCTD: [Module]/[SubSection]  |  TMF: [Zone]/[Section]  |  GMP: [ModelName]
    const drugFolder = doc.drugName
      ? doc.drugName.replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)
      : 'Unknown Drug';
    const moduleSegment = doc.ctdModule || doc.ctdFolder || 'Uncategorized';
    const submoduleSegment = doc.submodule || '';

    const serverRelativeUrl = String(context.pageContext.web.serverRelativeUrl || '');
    const libraryRoot = `${serverRelativeUrl.replace(/\/$/, '')}/${ListNames.SignedDocuments}`;

    // Folder path: SignedDocuments/[Type]/[DrugName]/[Module]/[Submodule]
    const folderSegments = [documentType, drugFolder, moduleSegment, submoduleSegment].filter(Boolean);
    const targetFolder = await ensureFolderPath(libraryRoot, folderSegments);

    // Upload the single signed copy
    await provider.uploadFiles(`${targetFolder}/${signedFileName}`, buffer, 'application/octet-stream');

    // Update metadata on the uploaded file
    const camlQuery = new CamlBuilder()
      .View(['ID', 'FileLeafRef', 'FileRef', 'SharePointURL'])
      .RowLimit(1, true)
      .Query()
      .Where()
      .TextField('FileLeafRef')
      .EqualTo(signedFileName);
    const items = await provider.getItemsByCAMLQuery(ListNames.SignedDocuments, camlQuery.ToString());
    if (items && items[0]) {
      const fileUrl = `${context.pageContext.web.absoluteUrl}${items[0].FileRef || ''}`;
      await provider.updateItem(
        {
          Title: doc.name,
          CategoryId: doc.categoryId,
          TemplateId: doc.templateId,
          CTDFolder: doc.ctdFolder,
          CTDModule: doc.ctdModule,
          Submodule: doc.submodule,
          DocumentType: documentType,
          DrugId: doc.drugId,
          Status: 'Final',
          ApproverId: doc.approverId,
          IsEmailSend: true,
          Comments: JSON.stringify(doc.comments || []),
          SharePointURL: { Url: fileUrl, Description: signedFileName },
          SignedBy: signatureNote,
          SignedDate: new Date().toISOString()
        },
        ListNames.SignedDocuments,
        items[0].ID
      );
    }
  };

  const isFileLocked = (err: any): { locked: boolean; lockedBy?: string } => {
    const status = err?.status || err?.response?.status || 0;
    const msg: string = err?.message || err?.data?.responseBody || '';
    if (status === 423 || msg.includes('[423]') || msg.toLowerCase().includes('locked for shared use')) {
      const match = msg.match(/locked for shared use by ([^\."]+)/i);
      return { locked: true, lockedBy: match?.[1]?.trim() };
    }
    return { locked: false };
  };

  const handleSubmitForReview = async () => {
    if (!viewingDocument || !provider) return;
    setIsLoading(true);
    try {
      const auditLog = {
        id: (viewingDocument.comments?.length || 0) + 1,
        author: 'System',
        text: `Document submitted for review by ${currentUser?.displayName || 'Unknown'}`,
        timestamp: new Date().toISOString()
      };
      const nextComments = [...(viewingDocument.comments || []), auditLog];
      await provider.updateItem(
        {
          Status: 'Pending Approval',
          IsEmailSend: true,
          Comments: JSON.stringify(nextComments)
        },
        ListNames.DMSDocuments,
        viewingDocument.id
      );
      await loadData();
      setIsDocPanelOpen(false);
      setSuccessMessage('Document submitted for approval.');
    } catch (error: any) {
      console.error('Failed to submit document:', error);
      const lock = isFileLocked(error);
      if (lock.locked) {
        setErrorMessage(
          lock.lockedBy
            ? `"${viewingDocument.name}" is currently open in Word Online by ${lock.lockedBy}. Please close the document and try submitting again.`
            : `"${viewingDocument.name}" is currently open in Word Online. Please close the document and try submitting again.`
        );
      } else {
        setErrorMessage('Unable to submit document for review. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalApprove = async () => {
    if (!viewingDocument || !signature) return;
    setIsLoading(true);
    try {
      // Step 1: Mark document as Signed in DMSDocuments
      await updateSignatureStatus(viewingDocument, 'Signed', signature);

      // Step 2: Update the EXISTING eSignature entry (created in initiateAdobeSign)
      // Do NOT create a new one — avoid duplicates (Q8)
      if (provider) {
        try {
          const camlQuery = new CamlBuilder()
            .View(['ID', 'SignatureStatus'])
            .RowLimit(1, true)
            .Query()
            .Where()
            .NumberField('DocumentId')
            .EqualTo(viewingDocument.id);
          const eSignItems = await provider.getItemsByCAMLQuery(ListNames.eSignature, camlQuery.ToString());
          if (eSignItems && eSignItems[0]) {
            await provider.updateItem(
              {
                SignatureStatus: 'Signed',
                SignatureCompletedOn: new Date().toISOString(),
                SignedBy: signature
              },
              ListNames.eSignature,
              eSignItems[0].ID
            );
          }
        } catch (eSignError) {
          console.warn('Failed to update eSignature entry (non-fatal):', eSignError);
        }
      }

      // Step 3: Q8 — Save ONLY the signed document (not a comments copy)
      await createSignedCopies(viewingDocument, signature);

      // Step 4: Move to Final status
      await updateSignatureStatus(viewingDocument, 'Final', signature);

      await loadData();
      setIsSignatureModalOpen(false);
      setSignature('');
      setIsDocPanelOpen(false);
      setSuccessMessage('Document signed and finalized successfully. The signed copy has been saved.');
    } catch (error) {
      console.error('Failed to finalize signature:', error);
      setErrorMessage('Unable to finalize document signature.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    if (!viewingDocument) return;
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!viewingDocument || !provider) return;
    if (!rejectReason.trim()) {
      setErrorMessage('Please provide a reason for rejection.');
      return;
    }

    setIsLoading(true);
    try {
      const auditLog = {
        id: (viewingDocument.comments?.length || 0) + 1,
        author: currentUser?.displayName || 'Approver',
        text: `REJECTED: ${rejectReason}`,
        timestamp: new Date().toISOString()
      };
      const nextComments = [...(viewingDocument.comments || []), auditLog];
      await provider.updateItem(
        {
          Status: 'Rejected',
          IsEmailSend: true,
          Comments: JSON.stringify(nextComments)
        },
        ListNames.DMSDocuments,
        viewingDocument.id
      );
      await loadData();
      setIsRejectModalOpen(false);
      setIsDocPanelOpen(false);
      setSuccessMessage('Document has been rejected.');
    } catch (error: any) {
      console.error('Failed to reject document:', error);
      if (error?.status === 423 || (error?.message || '').includes('423')) {
        setErrorMessage('The file is currently open in Word Online. Please close it and try again.');
      } else {
        setErrorMessage('Unable to reject document. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setEditForm({
      name: doc.name,
      categoryId: doc.categoryId || 0,
      status: doc.status,
      ctdModule: doc.ctdModule || '',
      submodule: doc.submodule || '',
      approverId: doc.approverId || 0
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!provider || !editingDocument) return;

    if (!editForm.name?.trim()) {
      setErrorMessage('Document name is required.');
      return;
    }

    setIsLoading(true);
    try {
      await provider.updateItem(
        {
          Title: editForm.name,
          CategoryId: editForm.categoryId || null,
          Status: editForm.status,
          CTDModule: editForm.ctdModule,
          Submodule: editForm.submodule,
          ApproverId: editForm.approverId || null
        },
        ListNames.DMSDocuments,
        editingDocument.id
      );
      await loadData();
      setIsEditModalOpen(false);
      setEditingDocument(null);
      setSuccessMessage('Document updated successfully.');
    } catch (error) {
      console.error('Failed to update document:', error);
      setErrorMessage('Unable to update document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareVersion = (versionId: number) => {
    const match = versionHistoryRaw.find((version: any) => (version.ID || version.VersionId) === versionId);
    setCompareVersion(match || null);
  };

  const handleBulkDelete = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      // Perform soft-delete
      await Promise.all(selectedIds.map(id => 
        provider.updateItem({ IsDelete: true }, ListNames.DMSDocuments, id)
      ));
      await loadData();
      setSelectedIds([]);
      setIsDeleteDialogOpen(false);
      setSuccessMessage('Selected documents moved to recycle bin.');
    } catch (error) {
      console.error('Failed to delete documents:', error);
      setErrorMessage('Unable to delete selected documents.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Q1/Q2/Q5: eSignature Workflow
   * Triggered when: user clicks "Initiate Adobe Sign" on an Approved document.
   * Creates eSignature list entry → Power Automate Flow 1 picks it up
   * → Adobe Sign sends agreement to Signer and Approver
   * → When all sign, Power Automate Flow 2 saves signed PDF to SignedDocuments library
   * → DMS polls or webhook updates document status to Signed → Final
   *
   * Q2: eSignature List Fields:
   *   Title, FilePath (server-relative), FileName (with ext), SignerEmail, ApproverEmail,
   *   SignatureStatus ('Pending' triggers PA Flow 1), DocumentId, DocumentType (GMP/TMF/eCTD),
   *   CTDFolder, DrugName, DrugId
   */
  const initiateAdobeSign = async (doc: Document) => {
    if (!provider || !doc) return;
    setIsLoading(true);
    try {
      // Resolve server-relative file path
      const fileRef = doc.fileRef || doc.sharePointUrl || '';
      const serverRelative = fileRef.startsWith('http')
        ? new URL(fileRef).pathname
        : fileRef;
      const fileName = doc.fileName || serverRelative.split('/').pop() || `${doc.name}.docx`;

      // Q2: Full eSignature list payload with all required fields
      const eSignPayload = {
        Title: doc.name,
        FilePath: serverRelative,            // server-relative URL — PA Flow uses this to get file content
        FileName: fileName,                  // actual filename with extension
        SignerEmail: doc.reviewer || '',     // primary signer (reviewer)
        ApproverEmail: doc.approver || '',   // approver who approved the document
        SignatureStatus: 'Pending',          // 'Pending' triggers Power Automate Flow 1
        DocumentId: doc.id,                  // SP item ID in DMSDocuments list
        DocumentType: (() => {            // resolves mapping type using folder ID sets
          const gmpSet = new Set(flattenCTDFolders(gmpFolders).map(f => f.folderId));
          const tmfSet = new Set(flattenCTDFolders(tmfFolders).map(f => f.folderId));
          const cf = doc.ctdFolder || '';
          const cm = doc.ctdModule || '';
          if ((cf && tmfSet.has(cf)) || (cm && tmfSet.has(cm))) return 'TMF';
          if ((cf && gmpSet.has(cf)) || (cm && gmpSet.has(cm))) return 'GMP';
          return 'eCTD';
        })(),
        CTDFolder: doc.ctdFolder || '',      // folder path for signed doc storage
        CTDModule: doc.ctdModule || '',
        DrugName: doc.drugName || '',
        DrugId: doc.drugId || null,
        InitiatedBy: currentUser?.displayName || '',
        InitiatedDate: new Date().toISOString()
      };

      await provider.createItem(eSignPayload, ListNames.eSignature);

      // Update original document status → 'Pending for Signature'
      const auditLog = {
        id: (doc.comments?.length || 0) + 1,
        author: 'System',
        text: `Adobe Sign process initiated by ${currentUser?.displayName || 'Unknown'}. Awaiting signatures from: ${eSignPayload.SignerEmail || '(not set)'}.`,
        timestamp: new Date().toISOString()
      };
      const nextComments = [...(doc.comments || []), auditLog];

      await provider.updateItem(
        {
          Status: 'Pending for Signature',
          IsEmailSend: true,
          Comments: JSON.stringify(nextComments)
        },
        ListNames.DMSDocuments,
        doc.id
      );

      await loadData();
      setIsDocPanelOpen(false);
      setSuccessMessage('Adobe Sign process initiated. Signers will receive an email shortly.');
    } catch (error) {
      console.error('Failed to initiate Adobe Sign:', error);
      setErrorMessage('Unable to initiate Adobe Sign process.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReinitializeSignature = async (doc: Document) => {
    if (!provider || !doc) return;
    setIsLoading(true);
    try {
      const auditLog = {
        id: (doc.comments?.length || 0) + 1,
        author: 'System',
        text: `Document re-initialized for signature by ${currentUser?.displayName || 'Unknown'}`,
        timestamp: new Date().toISOString()
      };
      const nextComments = [...(doc.comments || []), auditLog];
      await provider.updateItem(
        { 
          Status: 'Approved',
          IsEmailSend: true,
          Comments: JSON.stringify(nextComments)
        },
        ListNames.DMSDocuments,
        doc.id
      );
      await loadData();
      setSuccessMessage('Document re-initialized for signature.');
    } catch (error) {
      console.error('Failed to re-initialize signature:', error);
      setErrorMessage('Unable to re-initialize document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    showToast({
      type: 'info',
      title: 'Export',
      message: `Exporting ${selectedIds.length} document(s) to ${format.toUpperCase()} (demo).`
    });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      status: 'All',
      dateFilter: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedSubfolder(null);
  };

  const handleSubfolderClick = (subfolderId: string, parentId: string) => {
    setSelectedFolder(parentId);
    setSelectedSubfolder(subfolderId);
  };

  const getWorkflowSteps = (currentStatus: string) => {
    if (currentStatus === 'Rejected') {
      return [
        { label: 'Draft', active: false, completed: true },
        { label: 'Rejected', active: true, completed: false }
      ];
    }

    const steps = ['Draft', 'Pending Approval', 'Approved', 'Pending for Signature', 'Final'];
    const currentIndex = steps.indexOf(currentStatus);

    return steps.map((step, index) => ({
      label: step,
      active: index === currentIndex,
      completed: index < currentIndex
    }));
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', id: 'All' }];
    if (selectedDrugId !== null) {
      const drug = drugs.find(d => d.id === selectedDrugId);
      if (drug) crumbs.push({ label: drug.name, id: `drug-${drug.id}` });
    }

    if (selectedFolder !== 'All') {
      const folder = ctdFolders.find(f => f.id === selectedFolder);
      if (folder) {
        crumbs.push({ label: folder.name, id: folder.id });

        if (selectedSubfolder && folder.children) {
          const subfolder = folder.children.find(sf => sf.id === selectedSubfolder);
          if (subfolder) crumbs.push({ label: subfolder.name, id: subfolder.id });
        }
      }
    }

    return crumbs;
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDocuments.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const currentPageData = getCurrentPageData();

  return {
    // data
    documents,
    filteredDocuments,
    activeTab,
    subTab,
    drugs,
    selectedDrugId,
    categories,
    ctdFolders,
    expandedFolders,
    selectedFolder,
    selectedSubfolder,
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
    versionHistoryRaw,
    compareVersion,
    editForm,
    signature,
    canApprove,
    canEdit,
    canDelete,
    canCreate,
    currentUser,
    isSidebarCollapsed,
    ctdStructure,
    isStructureDisabled,
    filters,
    itemsPerPage,
    totalPages,
    currentPageData,
    errorMessage,
    successMessage,
    isLoading,
    reviewerComments,
    reviewerCommentError,
    rejectReason,
    isRejectModalOpen,

    // setters
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
    setIsSidebarCollapsed,
    setFilters,
    setReviewerComments,
    setReviewerCommentError,
    setRejectReason,
    setIsRejectModalOpen,
    setSelectedDrugId: selectDrug,
    setActiveTab,
    setSubTab,
    isAdmin,
    tmfFolders,
    gmpFolders,
    showDeleted,
    setShowDeleted,

    // handlers
    loadData,
    handleStructureChange,
    handleViewDocument,
    openDocumentInReviewMode,
    handleApprove,
    handleFinalApprove,
    handleReject,
    confirmReject,
    handleSubmitForReview,
    openEditModal,
    handleSaveEdit,
    handleCompareVersion,
    handleBulkDelete,
    handleExport,
    resetFilters,
    toggleFolder,
    handleFolderClick,
    handleSubfolderClick,
    getWorkflowSteps,
    getBreadcrumbs,
    initiateAdobeSign,
    handleReinitializeSignature
  };
}

