import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface ITMFFolder {
  id: number;
  name: string;
  folderId: string;
  parentFolderId?: string;
  isFolder: boolean;
  sortOrder: number;
  zone: number;
  zoneName: string;
  section: string;
  sectionName: string;
  artifactId: string;
  artifactName: string;
  reference: string;
}

export const TMF_ZONE_CHOICES = [
  { value: 'Zone 1 - Trial Management', label: 'Zone 1 - Trial Management', zone: 1 },
  { value: 'Zone 2 - Central Trial Documents', label: 'Zone 2 - Central Trial Documents', zone: 2 },
  { value: 'Zone 3 - Regulatory', label: 'Zone 3 - Regulatory', zone: 3 },
  { value: 'Zone 4 - IRB or IEC and other Approvals', label: 'Zone 4 - IRB or IEC and other Approvals', zone: 4 }
];

export interface ITmfZoneOption { value: string; label: string; zone: number; }

export async function fetchTmfZonesFromList(provider: any): Promise<ITmfZoneOption[]> {
  if (!provider) return TMF_ZONE_CHOICES;
  try {
    const data = await provider.getItemsByQuery({
      listName: ListNames.TmfZones,
      select: ['Title', 'ZoneNumber', 'SortOrder'],
      top: 500,
      orderBy: 'SortOrder',
      isSortOrderAsc: true
    });
    const zones: ITmfZoneOption[] = (data || [])
      .map((item: any) => ({
        value: item.Title || '',
        label: item.Title || '',
        zone: item.ZoneNumber || 0
      }))
      .filter((z: ITmfZoneOption) => z.value);
    // TMF_ZONE_CHOICES serves as a fallback when the list is empty or not yet provisioned
    return zones.length > 0 ? zones : TMF_ZONE_CHOICES;
  } catch {
    // Fall back to hardcoded constant if the TmfZones list is unavailable
    return TMF_ZONE_CHOICES;
  }
}

const emptyForm = (): Omit<ITMFFolder, 'id'> => ({
  name: '',
  folderId: '',
  parentFolderId: '',
  isFolder: true,
  sortOrder: 0,
  zone: 0,
  zoneName: '',
  section: '',
  sectionName: '',
  artifactId: '',
  artifactName: '',
  reference: ''
});

export function ManageTMFData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [items, setItems] = React.useState<ITMFFolder[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ITMFFolder | null>(null);
  const [formData, setFormData] = React.useState<Omit<ITMFFolder, 'id'>>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<string, string>>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ITMFFolder | null>(null);

  const [folderTrail, setFolderTrail] = React.useState<string[]>([]);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await provider.getItemsByQuery({
        listName: ListNames.TMFFolders,
        select: ['ID', 'Title', 'FolderId', 'ParentFolderId', 'IsFolder', 'SortOrder',
                 'Zone', 'ZoneName', 'Section', 'SectionName', 'ArtifactId', 'ArtifactName', 'Reference'],
        top: 2000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      });
      const mapped: ITMFFolder[] = (data || []).map((item: any) => ({
        id: item.ID,
        name: item.Title || '',
        folderId: item.FolderId || String(item.ID),
        parentFolderId: item.ParentFolderId || undefined,
        isFolder: item.IsFolder !== false && item.IsFolder !== 0,
        sortOrder: item.SortOrder || 0,
        zone: item.Zone || 0,
        zoneName: item.ZoneName || '',
        section: item.Section || '',
        sectionName: item.SectionName || '',
        artifactId: item.ArtifactId || '',
        artifactName: item.ArtifactName || '',
        reference: item.Reference || ''
      }));
      setItems(mapped);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load TMF Folders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const currentParentId = folderTrail.length ? folderTrail[folderTrail.length - 1] : '';

  const currentLevelItems = React.useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const level = items.filter(i =>
      (!currentParentId ? !i.parentFolderId : i.parentFolderId === currentParentId)
    );
    if (!q) return level.sort((a, b) => a.sortOrder - b.sortOrder);
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.folderId.toLowerCase().includes(q) ||
      i.zoneName.toLowerCase().includes(q) ||
      i.sectionName.toLowerCase().includes(q)
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, currentParentId, searchTerm]);

  const getBreadcrumb = React.useMemo(() => {
    const crumbs: { label: string; id: string }[] = [];
    for (const id of folderTrail) {
      const item = items.find(i => i.folderId === id);
      if (item) crumbs.push({ label: item.name, id });
    }
    return crumbs;
  }, [folderTrail, items]);

  const drillInto = (folderId: string) => {
    setFolderTrail(prev => [...prev, folderId]);
    setSearchTerm('');
  };

  const navigateTo = (index: number) => {
    setFolderTrail(prev => prev.slice(0, index + 1));
  };

  const navigateToRoot = () => {
    setFolderTrail([]);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};
    if (!formData.name.trim()) errors.name = 'Title is required.';
    if (!formData.folderId.trim()) errors.folderId = 'Folder ID is required.';
    if (!formData.zoneName) errors.zoneName = 'Zone is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddPanel = (parentId?: string) => {
    const parentItem = parentId ? items.find(i => i.folderId === parentId) : undefined;
    setFormData({
      ...emptyForm(),
      parentFolderId: parentId || '',
      zoneName: parentItem?.zoneName || '',
      zone: parentItem?.zone || 0
    });
    setFieldErrors({});
    setEditingItem(null);
    setPanelMode('add');
    setIsPanelOpen(true);
  };

  const openEditPanel = (item: ITMFFolder) => {
    setFormData({
      name: item.name, folderId: item.folderId, parentFolderId: item.parentFolderId || '',
      isFolder: item.isFolder, sortOrder: item.sortOrder, zone: item.zone, zoneName: item.zoneName,
      section: item.section, sectionName: item.sectionName, artifactId: item.artifactId,
      artifactName: item.artifactName, reference: item.reference
    });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: ITMFFolder) => {
    setFormData({
      name: item.name, folderId: item.folderId, parentFolderId: item.parentFolderId || '',
      isFolder: item.isFolder, sortOrder: item.sortOrder, zone: item.zone, zoneName: item.zoneName,
      section: item.section, sectionName: item.sectionName, artifactId: item.artifactId,
      artifactName: item.artifactName, reference: item.reference
    });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('view');
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingItem(null);
    setFormData(emptyForm());
    setFieldErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const zoneChoice = TMF_ZONE_CHOICES.find(z => z.value === formData.zoneName);
      const zone = zoneChoice?.zone || formData.zone;
      if (panelMode === 'add') {
        if (provider) await provider.createItem(
          {
            Title: formData.name,
            FolderId: formData.folderId,
            ParentFolderId: formData.parentFolderId || '',
            IsFolder: formData.isFolder ? 1 : 0,
            SortOrder: formData.sortOrder || 0,
            Zone: zone,
            ZoneName: formData.zoneName || '',
            Section: formData.section || '',
            SectionName: formData.sectionName || '',
            ArtifactId: formData.artifactId || '',
            ArtifactName: formData.artifactName || '',
            Reference: formData.reference || ''
          },
          ListNames.TMFFolders
        );
        setSuccessMessage('TMF Folder added successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (provider) await provider.updateItem(
          {
            Title: formData.name,
            FolderId: formData.folderId,
            ParentFolderId: formData.parentFolderId || '',
            IsFolder: formData.isFolder ? 1 : 0,
            SortOrder: formData.sortOrder || 0,
            Zone: zone,
            ZoneName: formData.zoneName || '',
            Section: formData.section || '',
            SectionName: formData.sectionName || '',
            ArtifactId: formData.artifactId || '',
            ArtifactName: formData.artifactName || '',
            Reference: formData.reference || ''
          },
          ListNames.TMFFolders,
          editingItem.id
        );
        setSuccessMessage('TMF Folder updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save TMF Folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: ITMFFolder) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (provider) await provider.deleteItem(ListNames.TMFFolders, itemToDelete.id);
      setSuccessMessage('TMF Folder deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete TMF Folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChildren = (folderId: string) => items.some(i => i.parentFolderId === folderId);

  return {
    items,
    currentLevelItems,
    isLoading,
    errorMessage,
    successMessage,
    searchTerm,
    panelMode,
    isPanelOpen,
    editingItem,
    formData,
    fieldErrors,
    isDeleteDialogOpen,
    itemToDelete,
    folderTrail,
    getBreadcrumb,
    currentParentId,
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
    loadItems,
    drillInto,
    navigateTo,
    navigateToRoot,
    hasChildren
  };
}
