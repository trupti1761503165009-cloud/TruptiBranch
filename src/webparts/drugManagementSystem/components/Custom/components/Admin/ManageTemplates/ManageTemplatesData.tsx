import { useEffect, useState } from 'react';
import * as CamlBuilder from 'camljs';
import { useAtom, useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export function ManageTemplatesData() {
  const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
  const { provider, context } = appGlobalState;
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [categoryFilter, setCategoryFilter] = useState<number | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<number | 'All'>('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<any | null>(null);
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseLookupText = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value.lookupValue ?? value.Title ?? value.title ?? value.Name ?? '';
    }
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      return first?.lookupValue ?? first?.Title ?? first?.title ?? first?.Name ?? '';
    }
    if (typeof value === 'string') {
      const parts = value.split(';#');
      return parts.length > 1 ? parts[1] : parts[0];
    }
    return String(value);
  };

  const parseLookupId = (value: any): number | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value) && value.length > 0) {
      const id = value[0]?.lookupId ?? value[0]?.Id ?? value[0]?.id;
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
      const id = value.lookupId ?? value.Id ?? value.id;
      const parsed = Number(id);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [ctdFolders, setCtdFolders] = useState<Array<{ id: number; name: string }>>([]);
  const [ectdSections, setEctdSections] = useState<Array<{ id: number; name: string }>>([]);
  const [gmpModels, setGmpModels] = useState<Array<{ id: number; name: string }>>([]);
  const [tmfFolders, setTmfFolders] = useState<Array<{ id: number; name: string }>>([]);

  const loadTemplates = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const camlQuery = new CamlBuilder()
        // Templates library schema (Templates.xml) uses LinkFilename for file name; Title may not exist.
        .View([
          'ID',
          'LinkFilename',
          'FileLeafRef',
          'FileRef',
          'Status',
          'UploadDate',
          'Category',
          'CategoryId',
          'Country',
          'CountryId',
          'MappingType',
          'MappedCTDFolder',
          'MappedCTDFolderId',
          'eCTDSection',
          'eCTDSectionId',
          'eCTDSubsection',
          'IsEctdMapped',
          'MappedGMPModel',
          'MappedGMPModelId',
          'MappedTMFFolder',
          'MappedTMFFolderId',
          'ServerRedirectedEmbedUrl',
          'FileLeafRef',
          'FileRef'
        ])
        .RowLimit(5000, true)
        .Query();
      camlQuery.OrderByDesc('UploadDate');
      const data = await provider.getItemsByCAMLQuery(ListNames.Templates, camlQuery.ToString());
      setTemplates(
        (data || []).map((item: any) => ({
          id: item.ID,
          name: item.LinkFilename || item.FileLeafRef || item.Title || 'Template',
          category: parseLookupText(item.Category),
          country: parseLookupText(item.Country),
          uploadDate: item.UploadDate ? new Date(item.UploadDate).toISOString().split('T')[0] : '',
          status: (item.Status as 'Active' | 'Inactive') || 'Active',
          mappingType: item.MappingType || 'None',
          mappedCTDFolder: parseLookupText(item.MappedCTDFolder),
          eCTDSection: parseLookupText(item.eCTDSection),
          eCTDSubsection: item.eCTDSubsection || '',
          mappedGMPModel: parseLookupText(item.MappedGMPModel),
          mappedTMFFolder: parseLookupText(item.MappedTMFFolder),
          isEctdMapped: Boolean(item.IsEctdMapped),
          // extra fields used for preview/edit
          fileRef: item.FileRef || '',
          fileName: item.FileLeafRef || item.LinkFilename || '',
          categoryId: Number(item.CategoryId || parseLookupId(item.Category)) || 0,
          countryId: Number(item.CountryId || parseLookupId(item.Country)) || 0,
          mappedCTDFolderId: Number(item.MappedCTDFolderId || parseLookupId(item.MappedCTDFolder)) || 0,
          ectdSectionId: Number(item.eCTDSectionId || parseLookupId(item.eCTDSection)) || 0,
          mappedGMPModelId: Number(item.MappedGMPModelId || parseLookupId(item.MappedGMPModel)) || 0,
          mappedTMFFolderId: Number(item.MappedTMFFolderId || parseLookupId(item.MappedTMFFolder)) || 0,
          serverRedirectedEmbedUrl: item.ServerRedirectedEmbedUrl || ''
        }))
      );
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load templates:', error);
      setErrorMessage('Unable to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLookups = async () => {
    if (!provider) return;
    try {
      const categoriesQuery = new CamlBuilder().View(['ID', 'Title', 'Status']).RowLimit(5000, true).Query();
      categoriesQuery.OrderBy('Title');

      const countriesQuery = new CamlBuilder().View(['ID', 'Title']).RowLimit(5000, true).Query();
      countriesQuery.OrderBy('Title');

      const foldersQuery = new CamlBuilder().View(['ID', 'Title', 'FolderId', 'SortOrder']).RowLimit(5000, true).Query();
      foldersQuery.OrderBy('SortOrder');

      const sectionsQuery = new CamlBuilder().View(['ID', 'Title', 'SectionCode']).RowLimit(5000, true).Query();
      sectionsQuery.OrderBy('SectionCode');

      const gmpQuery = new CamlBuilder().View(['ID', 'Title']).RowLimit(5000, true).Query();
      gmpQuery.OrderBy('Title');

      const tmfQuery = new CamlBuilder().View(['ID', 'Title', 'FolderId', 'SortOrder']).RowLimit(5000, true).Query();
      tmfQuery.OrderBy('SortOrder');

      const safeGetItems = async (listName: string, query: string) => {
        try {
          return await provider.getItemsByCAMLQuery(listName, query);
        } catch (e) {
          console.warn(`List "${listName}" not found or inaccessible:`, e);
          return [];
        }
      };

      const [cats, ctys, folders, sections, gmps, tmfs] = await Promise.all([
        safeGetItems(ListNames.Categories, categoriesQuery.ToString()),
        safeGetItems(ListNames.Countries, countriesQuery.ToString()),
        safeGetItems(ListNames.CTDFolders, foldersQuery.ToString()),
        safeGetItems(ListNames.EctdSections, sectionsQuery.ToString()),
        safeGetItems(ListNames.GmpModels, gmpQuery.ToString()),
        safeGetItems(ListNames.TMFFolders, tmfQuery.ToString())
      ]);

      setCategories(
        (cats || [])
          .filter((c: any) => (c.Status || 'Active') === 'Active')
          .map((c: any) => ({ id: c.ID, name: c.Title }))
      );
      setCountries((ctys || []).map((c: any) => ({ id: c.ID, name: c.Title })));
      setCtdFolders((folders || []).map((f: any) => ({ id: f.ID, name: f.FolderId ? `${f.FolderId} - ${f.Title}` : f.Title })));
      setEctdSections((sections || []).map((s: any) => ({ id: s.ID, name: s.SectionCode ? `${s.SectionCode} - ${s.Title}` : s.Title })));
      setGmpModels((gmps || []).map((g: any) => ({ id: g.ID, name: g.Title })));
      setTmfFolders((tmfs || []).map((t: any) => ({ id: t.ID, name: t.FolderId ? `${t.FolderId} - ${t.Title}` : t.Title })));
    } catch (e) {
      console.error('Failed to load template lookups:', e);
    }
  };

  useEffect(() => {
    setAppGlobalState((prev: any) => ({ ...prev, isSidebarHidden: isCreatePageOpen }));
  }, [isCreatePageOpen, setAppGlobalState]);

  useEffect(() => {
    void (async function (): Promise<void> {
      await loadTemplates();
      await loadLookups();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    let filtered = templates.filter((t: any) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(t => t.categoryId === categoryFilter);
    }

    if (countryFilter !== 'All') {
      filtered = filtered.filter(t => t.countryId === countryFilter);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, statusFilter, categoryFilter, countryFilter, templates]);

  const openDeleteDialog = (ids: number[]) => {
    if (!ids || ids.length === 0) return;
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!provider) return;
    if (deleteIds.length === 0) return;
    setIsLoading(true);
    try {
      await provider.DeleteItemsWithBatch(ListNames.Templates, deleteIds.map(id => ({ Id: id })));
      await loadTemplates();
      setSelectedIds([]);
      setDeleteIds([]);
      setIsDeleteDialogOpen(false);
      setSuccessMessage('Templates deleted successfully.');
    } catch (error) {
      console.error('Failed to delete templates:', error);
      setErrorMessage('Unable to delete templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: number, updates: any) => {
    if (!provider) return;
    setIsLoading(true);
    try {
      await provider.updateItem(updates, ListNames.Templates, id);
      await loadTemplates();
      setSuccessMessage('Template updated successfully.');
    } catch (error) {
      console.error('Failed to update template:', error);
      setErrorMessage('Unable to update template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildAbsoluteFileUrl = (fileRef: string): string => {
    if (!fileRef) return '';
    if (fileRef.startsWith('http')) return fileRef;

    // fileRef from SharePoint is usually server-relative (starts with /sites/...)
    // origin gives https://tenant.sharepoint.com
    const origin = window.location.origin;
    const cleanRef = fileRef.startsWith('/') ? fileRef : `/${fileRef}`;
    return `${origin}${cleanRef}`;
  };

  return {
    provider,
    context,
    templates,
    filteredTemplates,
    searchTerm,
    statusFilter,
    categoryFilter,
    countryFilter,
    selectedIds,
    isDeleteDialogOpen,
    deleteIds,
    isViewModalOpen,
    viewingTemplate,
    isCreatePageOpen,
    errorMessage,
    successMessage,
    isLoading,
    categories,
    countries,
    ctdFolders,
    ectdSections,
    gmpModels,
    tmfFolders,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setCountryFilter,
    setSelectedIds,
    setIsDeleteDialogOpen,
    setIsViewModalOpen,
    setViewingTemplate,
    setIsCreatePageOpen,
    setSuccessMessage,
    loadTemplates,
    openDeleteDialog,
    handleDeleteConfirm,
    updateTemplate,
    buildAbsoluteFileUrl
  };
}


