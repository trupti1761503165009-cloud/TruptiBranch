import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface ITmfZone {
  id: number;
  name: string;
  zoneNumber: number;
  sortOrder: number;
}

const emptyForm = (): Omit<ITmfZone, 'id'> => ({
  name: '',
  zoneNumber: 0,
  sortOrder: 0
});

export function ManageTmfZonesData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [items, setItems] = React.useState<ITmfZone[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ITmfZone | null>(null);
  const [formData, setFormData] = React.useState<Omit<ITmfZone, 'id'>>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof Omit<ITmfZone, 'id'>, string>>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ITmfZone | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await provider.getItemsByQuery({
        listName: ListNames.TmfZones,
        select: ['ID', 'Title', 'ZoneNumber', 'SortOrder'],
        top: 1000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      });
      const mapped: ITmfZone[] = (data || []).map((item: any) => ({
        id: item.ID,
        name: item.Title || '',
        zoneNumber: item.ZoneNumber || 0,
        sortOrder: item.SortOrder || 0
      }));
      setItems(mapped);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load TMF Zones. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = React.useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return items;
    return items.filter(i => i.name.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Omit<ITmfZone, 'id'>, string>> = {};
    if (!formData.name.trim()) errors.name = 'Zone name is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddPanel = () => {
    setFormData(emptyForm());
    setFieldErrors({});
    setEditingItem(null);
    setPanelMode('add');
    setIsPanelOpen(true);
  };

  const openEditPanel = (item: ITmfZone) => {
    setFormData({ name: item.name, zoneNumber: item.zoneNumber, sortOrder: item.sortOrder });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: ITmfZone) => {
    setFormData({ name: item.name, zoneNumber: item.zoneNumber, sortOrder: item.sortOrder });
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
      if (panelMode === 'add') {
        if (provider) await provider.createItem(
          { Title: formData.name, ZoneNumber: formData.zoneNumber || 0, SortOrder: formData.sortOrder || 0 },
          ListNames.TmfZones
        );
        setSuccessMessage('TMF Zone added successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (provider) await provider.updateItem(
          { Title: formData.name, ZoneNumber: formData.zoneNumber || 0, SortOrder: formData.sortOrder || 0 },
          ListNames.TmfZones,
          editingItem.id
        );
        setSuccessMessage('TMF Zone updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save TMF Zone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: ITmfZone) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (provider) await provider.deleteItem(ListNames.TmfZones, itemToDelete.id);
      setSuccessMessage('TMF Zone deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete TMF Zone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    filteredItems,
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
  };
}
