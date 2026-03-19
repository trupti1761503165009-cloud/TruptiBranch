import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface IGmpCategory {
  id: number;
  name: string;
  sortOrder: number;
}

const emptyForm = (): Omit<IGmpCategory, 'id'> => ({
  name: '',
  sortOrder: 0
});

export function ManageGmpCategoriesData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [items, setItems] = React.useState<IGmpCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<IGmpCategory | null>(null);
  const [formData, setFormData] = React.useState<Omit<IGmpCategory, 'id'>>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof Omit<IGmpCategory, 'id'>, string>>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<IGmpCategory | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await provider.getItemsByQuery({
        listName: ListNames.GmpCategories,
        select: ['ID', 'Title', 'SortOrder'],
        top: 1000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      });
      const mapped: IGmpCategory[] = (data || []).map((item: any) => ({
        id: item.ID,
        name: item.Title || '',
        sortOrder: item.SortOrder || 0
      }));
      setItems(mapped);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load GMP Categories. Please try again.');
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
    const errors: Partial<Record<keyof Omit<IGmpCategory, 'id'>, string>> = {};
    if (!formData.name.trim()) errors.name = 'Category name is required.';
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

  const openEditPanel = (item: IGmpCategory) => {
    setFormData({ name: item.name, sortOrder: item.sortOrder });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: IGmpCategory) => {
    setFormData({ name: item.name, sortOrder: item.sortOrder });
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
          { Title: formData.name, SortOrder: formData.sortOrder || 0 },
          ListNames.GmpCategories
        );
        setSuccessMessage('GMP Category added successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (provider) await provider.updateItem(
          { Title: formData.name, SortOrder: formData.sortOrder || 0 },
          ListNames.GmpCategories,
          editingItem.id
        );
        setSuccessMessage('GMP Category updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save GMP Category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: IGmpCategory) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (provider) await provider.deleteItem(ListNames.GmpCategories, itemToDelete.id);
      setSuccessMessage('GMP Category deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete GMP Category. Please try again.');
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
