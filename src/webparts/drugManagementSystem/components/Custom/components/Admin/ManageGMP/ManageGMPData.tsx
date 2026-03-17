import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export interface IGMPModel {
  id: number;
  name: string;
  category: string;
  subGroup: string;
  sortOrder: number;
}

export const GMP_CATEGORIES = [
  'Governance and Procedures',
  'Manufacturing and Product Quality',
  'Validation'
];

const emptyForm = (): Omit<IGMPModel, 'id'> => ({
  name: '',
  category: '',
  subGroup: '',
  sortOrder: 0
});

export function ManageGMPData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [items, setItems] = React.useState<IGMPModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<IGMPModel | null>(null);
  const [formData, setFormData] = React.useState<Omit<IGMPModel, 'id'>>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof Omit<IGMPModel, 'id'>, string>>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<IGMPModel | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await provider.getGMPModels();
      setItems(data || []);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load GMP Models. Please try again.');
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
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.subGroup.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Omit<IGMPModel, 'id'>, string>> = {};
    if (!formData.name.trim()) errors.name = 'Model name is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';
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

  const openEditPanel = (item: IGMPModel) => {
    setFormData({ name: item.name, category: item.category, subGroup: item.subGroup, sortOrder: item.sortOrder });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: IGMPModel) => {
    setFormData({ name: item.name, category: item.category, subGroup: item.subGroup, sortOrder: item.sortOrder });
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
        if (provider) await provider.createGMPModel(formData);
        setSuccessMessage('GMP Model added successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (provider) await provider.updateGMPModel(editingItem.id, formData);
        setSuccessMessage('GMP Model updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save GMP Model. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: IGMPModel) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (provider) await provider.deleteGMPModel(itemToDelete.id);
      setSuccessMessage('GMP Model deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete GMP Model. Please try again.');
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
